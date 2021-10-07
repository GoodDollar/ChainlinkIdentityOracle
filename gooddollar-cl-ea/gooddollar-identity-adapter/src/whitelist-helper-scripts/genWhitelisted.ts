import procEvents from './procEvents'
import procLastAuthenticated from './procLastAuthenticated'
import saveToFile from './utils'
import { ethers } from 'ethers'
import { identity as identityContractABI } from './identityContractABI.json'
import { createMerkleHash, getTreeData, postTreeData } from './../sdk/identityOracleSDK'

const url = 'https://rpc.fuse.io/'
const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(url)

// Identity contract address
const IDENTITY_CONTRACT_ADDRESS = '0xFa8d865A962ca8456dF331D78806152d3aC5B84F'
const contract: ethers.Contract = new ethers.Contract(
  IDENTITY_CONTRACT_ADDRESS,
  identityContractABI,
  provider,
)

type Whitelisted = {
  [key: string]: number
}

const whitelisted: Whitelisted = {}
const whitelistedWLastAuthenticated = {}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function genWhitelist() {
  // It feeds the whitelisted, adding addresses from WhitelistedAdded events
  const startBlock = 6246324
  const step = 20000
  const parallel = 5

  await procEvents(
    contract,
    contract.filters.WhitelistedAdded(), // filter value
    startBlock,
    (events) => {
      events.forEach((event) => {
        // eslint-disable-next-line no-prototype-builtins
        if (
          // eslint-disable-next-line no-prototype-builtins
          !whitelisted.hasOwnProperty(event.args ? event.args.account : '') ||
          // eslint-disable-next-line no-prototype-builtins
          (whitelisted.hasOwnProperty(event.args ? event.args.account : '') &&
            whitelisted[event.args ? event.args.account : ''] < event.blockNumber)
        ) {
          whitelisted[event.args ? event.args.account : ''] = event.blockNumber
        }
      })
    },
    step,
    parallel,
  )

  await procEvents(
    contract,
    contract.filters.WhitelistedRemoved(), // filter value
    startBlock,
    (events: any[]) => {
      events.forEach((event) => {
        const address: string = event.args.account
        // eslint-disable-next-line no-prototype-builtins
        if (whitelisted.hasOwnProperty(address)) {
          if (whitelisted[address] < event.blockNumber) {
            delete whitelisted[address]
            //console.log(address+' deleted.');
          }
        }
      })
    },
    step,
    parallel,
  )

  // It purge the whitelisted, removing addresses from WhitelistedRemoved event
  const lAuthParallel = 500

  await procLastAuthenticated(contract, whitelisted, whitelistedWLastAuthenticated, lAuthParallel)

  await saveToFile({
    _filename: 'whitelistedWlastAuthenticated.json',
    _content: whitelistedWLastAuthenticated,
  })

  await createMerkleHash()
  console.log('ipfs cid: ' + (await postTreeData()))
}

export { genWhitelist }
