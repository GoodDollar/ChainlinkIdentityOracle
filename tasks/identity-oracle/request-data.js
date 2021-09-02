let { networkConfig, getNetworkIdFromName } = require('../../helper-hardhat-config')

task("request-data", "Calls an IdentityOracle Contract request to startIPFSandStateHashProcess ")
    .addParam("contract", "The address of the IdentityOracle contract that you want to call")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        let networkId = await getNetworkIdFromName(network.name)
        console.log("Calling IdentityOracle contract ", contractAddr, " on network ", network.name)
        const IdentityOracle = await ethers.getContractFactory("IdentityOracle")

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        //Create connection to API Consumer Contract and call the createRequestTo function
        const IdentityOracleContract = new ethers.Contract(contractAddr, IdentityOracle.interface, signer)
        var result = await IdentityOracleContract.startIPFSandStateHashProcess()
        console.log('Contract ', contractAddr, ' external data request successfully called. Transaction Hash: ', result.hash)
        console.log("Run the following to read the returned result:")
        console.log("npx hardhat read-data --contract " + contractAddr + " --network " + network.name)
    })
module.exports = {}
