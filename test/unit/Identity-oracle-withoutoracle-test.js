const { networkConfig, autoFundCheck, developmentChains } = require('../../helper-hardhat-config')
const skipIf = require('mocha-skip-if')
const chai = require('chai')
const { expect } = require('chai')
const { getChainId } = require('hardhat')

skip.if(!developmentChains.includes(network.name)).
  describe("IdentityOracle", function () {
    let identityOracle

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
    })

    it("Testing setter and getter function to stateHash and stateDataIPFS ...", async function () {

      expect(await identityOracle.stateHash()).to.equal("0x8412eb0aef944b1828a24a5e1e5e830db4e699761d79ded0c538f1b5016e3015")
      expect(await identityOracle.stateDataIPFS()).to.equal('QmchVu39NyTRdrpg4ATPLLc44guHMNFZEHZnDimSAyKxMv')

    })
    it('Testing prove function with a first set of values ...', async function () {

      const proof = [
        '0x7bc8520406917b1df974038b71fdf950d153eb984f8865ee1eed44ba48aa0d75',
        '0xd04ba8f6ec39f1ea12cf89af3bec89412f5287e578969ecc001cfb5d6e91193e'
      ]
      const addrIndexInTree = 2 
      let address = '0x5Cc89FC5890795aAb4837e29b54B681dA1aD8843'
      const lastAuthenticated = 1596045795

      var proveTx = await identityOracle.prove(address, lastAuthenticated, proof, addrIndexInTree, { gasLimit: 200000 })

      var receipt = await proveTx.wait()
      let proofResult = receipt.events.pop()

      //console.log(proofResult)

      expect(proofResult.event).to.equal('AddressWhitelisted')
      expect(proofResult.eventSignature).to.equal('AddressWhitelisted(address,uint256)')


      expect(proofResult.args[0]).to.equal(address)
      expect(proofResult.args[1]).to.equal(lastAuthenticated)
    })
    it("Checking isWhitelisted with several values ...", async function () {

      expect(await identityOracle.stateHash()).to.equal("0x8412eb0aef944b1828a24a5e1e5e830db4e699761d79ded0c538f1b5016e3015")
      expect(await identityOracle.stateDataIPFS()).to.equal('QmchVu39NyTRdrpg4ATPLLc44guHMNFZEHZnDimSAyKxMv')

      const proof = [
        '0xeb5ba0420a052a25247df44c56c85d5dd9a15b8316c61c0ea9882b5180b64533',
        '0xd04ba8f6ec39f1ea12cf89af3bec89412f5287e578969ecc001cfb5d6e91193e'
      ]
      const addrIndexInTree = 1 

      let address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
      const lastAuthenticated = 1596045795

      var proveTx = await identityOracle.prove(address, lastAuthenticated, proof, addrIndexInTree,{ gasLimit: 200000 })

      var receipt = await proveTx.wait()
      let proofResult = receipt.events.pop()
      
      expect(proofResult.event).to.equal('AddressWhitelisted')
      expect(proofResult.eventSignature).to.equal('AddressWhitelisted(address,uint256)')


      expect(proofResult.args[0]).to.equal(address)
      expect(proofResult.args[1]).to.equal(lastAuthenticated)

      // Te following tests are for isWhitelisted(address _address,uint256 _maxProofAgeInDays, uint256 _maxAuthenticationAgeInDays)

      expect(await identityOracle.isWhitelisted(address, 0, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 0) FAIL')

      expect(await identityOracle.isWhitelisted(address, 10000, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10000, 0) FAIL')

      expect(await identityOracle.isWhitelisted(address, 0, 10000)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 10000) FAIL')

      expect(await identityOracle.isWhitelisted(address, 10000, 10000)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10000, 10000) FAIL')

      expect(await identityOracle.isWhitelisted(address, 1, 0)).to.equal(true, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 1, 0) FAIL')

      expect(await identityOracle.isWhitelisted(address, 0, 10)).to.equal(false, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 10) FAIL')

      expect(await identityOracle.isWhitelisted(address, 10, 10)).to.equal(false, 'Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10, 10) FAIL')

    })
  })
