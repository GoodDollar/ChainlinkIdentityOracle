const { networkConfig, autoFundCheck } = require('../helper-hardhat-config')
const { ethers, getNamedAccounts } = require('hardhat')

module.exports = async ({
  getNamedAccounts,
  deployments
}) => {
  const { deploy, log, get } = deployments
  const chainId = await getChainId()
  let linkTokenAddress
  let additionalMessage = ""
  //set log level to ignore non errors
  ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR)
  const networkName = networkConfig[chainId]['name']

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

  //Try Auto-fund IdentityOracle contract with LINK
  const IdentityOracle = await deployments.get('IdentityOracle')
  const identityOracle = await ethers.getContractAt('IdentityOracle', IdentityOracle.address)

  if (await autoFundCheck(identityOracle.address, networkName, linkTokenAddress, additionalMessage)) {
    await hre.run("fund-link", { contract: identityOracle.address, linkaddress: linkTokenAddress })
  } else {
    log("Then run Identity Oracle contract with following command:")
    log("npx hardhat request-data --contract " + identityOracle.address + " --network " + networkName)
  }
  log("----------------------------------------------------")

}
module.exports.tags = ['all']
