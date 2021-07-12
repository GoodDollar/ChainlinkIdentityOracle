import procEvents from "./procEvents";
import procLastAuthenticated from "./procLastAuthenticated";
import saveToFile from "./utils";
import { ethers } from "ethers";
import { identity as identityContractABI } from "./identityContractABI.json";

const url: string = "https://rpc.fuse.io/";
const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(url);

// Identity contract address
const IDENTITY_CONTRACT_ADDRESS = "0xFa8d865A962ca8456dF331D78806152d3aC5B84F";
const contract: ethers.Contract = new ethers.Contract(IDENTITY_CONTRACT_ADDRESS, identityContractABI, provider);

const whitelisted: object = {};
const whitelistedWLastAuthenticated: object = {};

async function main() {
    
    // It feeds the whitelisted, adding addresses from WhitelistedAdded events
    const startBlock: number =  6246324;
    const step: number = 20000;
    const parallel: number = 5;

    console.log('=======================================================================================');
    console.log('Generating Whitelist... from block number: '+startBlock);
    console.log('=======================================================================================');

    await procEvents(contract,
        contract.filters.WhitelistedAdded(), // filter value
        startBlock,
        (events: any[]) => {
            events.forEach( event => {
                if (!whitelisted.hasOwnProperty[event.args.account] ||
                       (whitelisted.hasOwnProperty[event.args.account] && 
                        whitelisted[event.args.account] < event.blockNumber)) {
                    whitelisted[event.args.account] = event.blockNumber;
                }
            }); 
        },
        step,
        parallel);
        
    // It purge the whitelisted, removing addresses from WhitelistedRemoved event
    const lAuthParallel: number = 1000;
    
    console.log('=======================================================================================');
    console.log('Purging Whitelist, deleting WhitelistedRemoved from block number: '+startBlock);
    console.log('=======================================================================================');
    
    await procEvents(contract,
        contract.filters.WhitelistedRemoved(), // filter value
        startBlock,
        (events: any[]) => {
          events.forEach( event => {
            var address = event.args.account;
            if (whitelisted.hasOwnProperty(address)) {
                if (whitelisted[address] < event.blockNumber) {
                    delete whitelisted[address];
                    console.log(address+' deleted.');
                }
            }
          });
        },
        step,
        parallel);

    // It save the whitelist into json file
    await saveToFile('whitelistedWBlock.json', whitelisted);
    
    console.log(" Whitelisted size: "+Object.keys(whitelisted).length);
    console.log('=======================================================================================');
    console.log('Generating Whitelist with lastAuthenticated ... ');
    console.log('=======================================================================================');    
    await procLastAuthenticated(contract, 
                                whitelisted, 
                                whitelistedWLastAuthenticated,
                                lAuthParallel);

    await saveToFile('whitelistedWlastAuthenticated-ethersjs.json',whitelistedWLastAuthenticated);
    
}

main();

