const { networkConfig, autoFundCheck, developmentChains } = require('../../helper-hardhat-config')
const skipIf = require('mocha-skip-if')
const chai = require('chai')
const { expect } = require('chai')
const { getChainId } = require('hardhat')

skip.if(!developmentChains.includes(network.name)).
  describe("IdentityOracle", function () {
    let identityOracle;

    beforeEach(async () => {
      const chainId = await getChainId()
      await deployments.fixture(['mocks', 'api'])
      const LinkToken = await deployments.get('LinkToken')
      linkToken = await ethers.getContractAt('LinkToken', LinkToken.address)
      const networkName = networkConfig[chainId]['name']

      linkTokenAddress = linkToken.address
      additionalMessage = " --linkaddress " + linkTokenAddress

      const IdentityOracle = await deployments.get('IdentityOracle')
      identityOracle = await ethers.getContractAt('IdentityOracle', IdentityOracle.address)
    });

    it("Testing setter and getter function to stateHash and stateDataIPFS ...", async function () {

      expect(await identityOracle.stateHash()).to.equal("0x0e8d3a960d058403c71b98a920e76d23683589ded04b08d877f3da31dcca18c6");
      expect(await identityOracle.stateDataIPFS()).to.equal('bafkreibpjfb52jogprvsjydbyncqbazpcd376r46x6znlzknhzkqkb5pba');

    });
    it('Testing prove function with a first set of values ...', async function () {

      const proof = [
        '0x7bc8520406917b1df974038b71fdf950d153eb984f8865ee1eed44ba48aa0d75',
        '0x553efbe26bb9edad753c89e3944df2c0db74e14167021adcbfe59393ba331e16'
      ];
      let address = '0x5Cc89FC5890795aAb4837e29b54B681dA1aD8843';
      const lastAuthenticated = 1596045795;

      var proveTx = await identityOracle.prove(address, lastAuthenticated, proof, { gasLimit: 200000 });

      var receipt = await proveTx.wait()
      let proofResult = receipt.events.pop()

      expect(proofResult.event).to.equal('ProofResult');
      expect(proofResult.eventSignature).to.equal('ProofResult(bool)');

      let result = proofResult.args[0]

      expect(result).to.equal(true);
    });
    it("Checking isWhitelisted with several values ...", async function () {

      expect(await identityOracle.stateHash()).to.equal("0x0e8d3a960d058403c71b98a920e76d23683589ded04b08d877f3da31dcca18c6");
      expect(await identityOracle.stateDataIPFS()).to.equal('bafkreibpjfb52jogprvsjydbyncqbazpcd376r46x6znlzknhzkqkb5pba');

      const proof = [
        '0xeb5ba0420a052a25247df44c56c85d5dd9a15b8316c61c0ea9882b5180b64533',
        '0x553efbe26bb9edad753c89e3944df2c0db74e14167021adcbfe59393ba331e16'
      ];
      let address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e';
      const lastAuthenticated = 1596045795;

      var proveTx = await identityOracle.prove(address, lastAuthenticated, proof, { gasLimit: 200000 });

      var receipt = await proveTx.wait();
      let proofResult = receipt.events.pop();

      expect(proofResult.event).to.equal('ProofResult');
      expect(proofResult.eventSignature).to.equal('ProofResult(bool)');

      let result = proofResult.args[0];

      expect(result).to.equal(true);

      // Te following tests are for isWhitelisted(address _address,uint256 _maxProofAgeInDays, uint256 _maxAuthenticationAgeInDays)

      expect(await identityOracle.isWhitelisted(address, 0, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 0) FAIL');

      expect(await identityOracle.isWhitelisted(address, 10000, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10000, 0) FAIL');

      expect(await identityOracle.isWhitelisted(address, 0, 10000)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 10000) FAIL');

      expect(await identityOracle.isWhitelisted(address, 10000, 10000)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10000, 10000) FAIL');

      expect(await identityOracle.isWhitelisted(address, 1, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 1, 0) FAIL');

      expect(await identityOracle.isWhitelisted(address, 0, 10)).to.equal(false, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 10) FAIL');

      expect(await identityOracle.isWhitelisted(address, 10, 10)).to.equal(false, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10, 10) FAIL');

    });
  });
