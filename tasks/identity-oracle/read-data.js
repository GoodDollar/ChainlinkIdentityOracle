task("read-data", "Calls an IdentityOracle Contract to stateHash and IPFS CID values")
    .addParam("contract", "The address of the IdentityOracle contract that you want to call")
    .setAction(async taskArgs => {

        const contractAddr = taskArgs.contract
        const networkId = network.name
        console.log("Reading data from IdentityOracle contract ", contractAddr, " on network ", networkId)
        const IdentityOracle = await ethers.getContractFactory("IdentityOracle")

        //Get signer information
        const accounts = await ethers.getSigners()
        const signer = accounts[0]

        //Create connection to IdentityOracle Contract and call the createRequestTo function
        const IdentityOracleContract = new ethers.Contract(contractAddr, IdentityOracle.interface, signer)
        let result = await IdentityOracleContract.stateHash()
        console.log('stateHash value is: ', result)
        result = await IdentityOracleContract.stateDataIPFS()
        console.log('IPFS CID value is: ', result)
        if (result == 0 && ['hardhat', 'localhost', 'ganache'].indexOf(network.name) == 0) {
            console.log("You'll either need to wait another minute, or fix something!")
        }
        if (['hardhat', 'localhost', 'ganache'].indexOf(network.name) >= 0) {
            console.log("You'll have to manually update the value since you're on a local chain!")
        }
    })

module.exports = {}
