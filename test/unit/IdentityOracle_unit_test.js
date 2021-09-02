const { networkConfig, autoFundCheck, developmentChains } = require('../../helper-hardhat-config')
const skipIf = require('mocha-skip-if')
const chai = require('chai')
const { expect } = require('chai')
const { getChainId } = require('hardhat')

skip.if(!developmentChains.includes(network.name)).
  describe('IdentityOracle Unit Tests', async function () {

    let identityOracle, linkToken

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

      if (await autoFundCheck(identityOracle.address, networkName, linkTokenAddress, additionalMessage)) {
        await hre.run("fund-link", { contract: identityOracle.address, linkaddress: linkTokenAddress })
      }
    })

    it('Should successfully make startIPFSandStateHashProcess request', async () => {
      const transaction = await identityOracle.startIPFSandStateHashProcess()
      const tx_receipt = await transaction.wait()
      const requestId = tx_receipt.events[0].topics[1]

      console.log("requestId: ", requestId)
      expect(requestId).to.not.be.null
    })
  })
