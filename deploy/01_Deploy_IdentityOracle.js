let { networkConfig} = require('../helper-hardhat-config')

module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { deploy, log, get } = deployments
  const { deployer, avatar } = await getNamedAccounts()
  const chainId = await getChainId()
  let linkTokenAddress
  let oracle
  let additionalMessage = ""
  //set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)

  if (chainId == 31337) {
    linkToken = await get('LinkToken')
    MockOracle = await get('MockOracle')
    linkTokenAddress = linkToken.address
    oracle = MockOracle.address
    additionalMessage = " --linkaddress " + linkTokenAddress
  } else {
    linkTokenAddress = networkConfig[chainId]['linkToken']
    oracle = networkConfig[chainId]['oracle']
  }
  const jobId = networkConfig[chainId]['jobId']
  const fee = networkConfig[chainId]['fee']
  const networkName = networkConfig[chainId]['name']

  const identityOracle = await deploy('IdentityOracle', {
    from: deployer,
    args: [deployer, oracle],
    log: true
  })

  log("Run IdentityOracle contract with following command:", {deployer, oracle})
  log("npx hardhat request-data --contract " + identityOracle.address + " --network " + networkName)
  log("----------------------------------------------------")
}
module.exports.tags = ['all', 'api', 'main']
