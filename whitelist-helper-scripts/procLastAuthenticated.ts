import { ethers } from "ethers";
import { chunk } from "lodash";
export default async (
    _contract: ethers.Contract,
    _whitelisted: object,
    _whitelistedWLastAuthenticated: object,
    parallel = 1000
  ) => {
    const addresses = Object.keys(_whitelisted);
    const latestItem = addresses.length;
    
    let processedCount = 0;
    for (let itemsChunk of chunk(addresses, parallel)) {
      const ps = itemsChunk.map(async address => {
            let lastAuthenticated = 
                (await _contract.callStatic.lastAuthenticated(address));
            _whitelistedWLastAuthenticated[address] = lastAuthenticated.toNumber();
          });
      processedCount += itemsChunk.length;
      console.log('Processing ... from: ' + (processedCount - itemsChunk.length) + ' to: ' + processedCount);
      await Promise.all(ps);
    }
  };
