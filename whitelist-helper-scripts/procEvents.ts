import { ethers } from 'ethers'
import { range, chunk } from 'lodash'

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export default async (
  contract: ethers.Contract,
  filter: ethers.EventFilter,
  startBlock: number,
  callback: (arg0: ethers.Event[]) => unknown,
  step = 20000,
  parallel = 5,
) => {
  const latestBlock = await contract.provider.getBlockNumber()
  const blocks = range(startBlock, latestBlock, step)

  for (const blockChunk of chunk(blocks, parallel)) {
    // Get the filter (the second null could be omitted)
    const ps = blockChunk.map(async (bc: number) => {
      // Query the filter (the latest could be omitted)
      const logs = await contract
        .queryFilter(filter, bc, Math.min(bc + step - 1, latestBlock))
        .catch((e) => {
          console.log('block logs failed retrying...', bc)
          return contract.queryFilter(filter, bc, Math.min(bc + step - 1, latestBlock))
        })
      // Print out all the values:
      console.log('found logs in block:', { bc }, logs.length)

      if (logs.length) await callback(logs)
    })
    await Promise.all(ps)
  }
}
