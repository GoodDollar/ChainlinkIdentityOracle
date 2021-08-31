const chai = require('chai')
const { expect } = require('chai')
const skipIf = require('mocha-skip-if')
const { developmentChains } = require('../../helper-hardhat-config')

skip.if(developmentChains.includes(network.name)).
  describe('IdentityOracle Integration Tests \n', async function () {

    let identityOracle

    beforeEach(async () => {
      const IdentityOracle = await deployments.get('IdentityOracle')
      identityOracle = await ethers.getContractAt('IdentityOracle', IdentityOracle.address)
    })

    it('Should successfully make an startIPFSandStateHashProcess request and get a result', async () => {
      const IdentityOracle = await deployments.get('IdentityOracle')
      console.log("Calling IdentityOracle contract ", IdentityOracle.address, " on network ", network.name)
      const transaction = await identityOracle.startIPFSandStateHashProcess()
      const tx_receipt = await transaction.wait()
      const requestId = tx_receipt.events[0].topics[1]
      console.log('Contract ', IdentityOracle.address, ' external data request successfully called. Transaction Hash: ', tx_receipt.transactionHash + '\n')
      
      //wait 60 secs for oracle to callback
      console.log('Wait 60 seconds to read the result ... \n')
      await new Promise(resolve => setTimeout(resolve, 60000))
      console.log("Getting the result: \n")
      
      //Now check the result
      const result = await identityOracle.stateHash()
      console.log("IdentityOracle stateHash value: ", result) 
      const resultIPFSCID = await identityOracle.stateDataIPFS()
      console.log("IdentityOracle IPFS CID value: ", resultIPFSCID) 

      expect(result).to.not.be.equal('')
    })
  })