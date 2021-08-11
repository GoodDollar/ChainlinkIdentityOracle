import procEvents from './procEvents'
import procLastAuthenticated from './procLastAuthenticated'
import saveToFile from './utils'
import { ethers } from 'ethers'
import { identity as identityContractABI } from './identityContractABI.json'

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
        if (
          !whitelisted.hasOwnProperty(event.args ? event.args.account : '') ||
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

  // It save the whitelist into json file
  await saveToFile({ _filename: 'whitelistedWBlock.json', _content: whitelisted })

  // It purge the whitelisted, removing addresses from WhitelistedRemoved event
  const lAuthParallel = 1000

  await procLastAuthenticated(contract, whitelisted, whitelistedWLastAuthenticated, lAuthParallel)

  await saveToFile({
    _filename: 'whitelistedWlastAuthenticated.json',
    _content: whitelistedWLastAuthenticated,
  })
}

genWhitelist()  // Comment this line for use in the CL oracle adapter

//export { genWhitelist } // Uncomment this line to use in the CL oracle adapter
