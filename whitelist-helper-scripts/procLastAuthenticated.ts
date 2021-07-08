import { ethers } from "ethers";
import { range, chunk } from "lodash";
export default async (
    _contract: ethers.Contract,
    _whitelisted: object,
    _whitelistedWLastAuthenticated: object,
    step = 100,
    parallel = 10
  ) => {
    const addresses = Object.keys(_whitelisted);
    const latestItem = addresses.length;
    const items = range(0, latestItem, step);
    
    for (let itemsChunk of chunk(items, parallel)) {
      const ps = itemsChunk.map(async item => {
          const psInt = addresses.slice(item,Math.min(item+step, latestItem)).map(async address => {
            let lastAuthenticated = 
                (await _contract.callStatic.lastAuthenticated(address));
            _whitelistedWLastAuthenticated[address] = lastAuthenticated.toNumber();
          });
          console.log('Progress ... '+item+' from '+latestItem);
          await Promise.all(psInt);
      });
      await Promise.all(ps);
    }
  };