import { ethers } from "ethers";
import { range, chunk } from "lodash";
export default async (
  contract: ethers.Contract,
  filter: ethers.EventFilter,
  startBlock: number,
  callback: (arg0: ethers.Event[]) => any,
  step: number = 20000,
  parallel: number = 5
) => {
  const latestBlock = await contract.provider.getBlockNumber();
  
  const blocks = range(startBlock, latestBlock, step);

  for (let blockChunk of chunk(blocks, parallel)) {
    // Get the filter (the second null could be omitted)
    const ps = blockChunk.map(async bc => {
      // Query the filter (the latest could be omitted)
      const logs = await contract
        .queryFilter(filter, bc, Math.min(bc + step - 1, latestBlock))
        .catch(e => {
          console.log("block logs failed retrying...", bc);
          return contract.queryFilter(
            filter,
            bc,
            Math.min(bc + step - 1, latestBlock)
          );
        });
      // Print out all the values:
      console.log("found logs in block:", { bc }, logs.length);
      
      if (logs.length) await callback(logs);
    });
    await Promise.all(ps);
  }
};
