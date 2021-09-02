import { ethers } from 'ethers'
import { chunk } from 'lodash'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (
  _contract: ethers.Contract,
  // eslint-disable-next-line @typescript-eslint/ban-types
  _whitelisted: object,
  _whitelistedWLastAuthenticated: { [x: string]: { lauth: number } },
  parallel = 1000,
) => {
  const addresses: string[] = Object.keys(_whitelisted)

  let processedCount = 0
  for (const itemsChunk of chunk(addresses, parallel)) {
    const ps = itemsChunk.map(async (address: string) => {
      const lastAuthenticated = await _contract.callStatic.lastAuthenticated(address)
      _whitelistedWLastAuthenticated[address] = { lauth: lastAuthenticated.toNumber() }
    })
    processedCount += itemsChunk.length
    console.log(
      'Processing ... from: ' + (processedCount - itemsChunk.length) + ' to: ' + processedCount,
    )
    await Promise.all(ps)
  }
}
