const Web3 = require('web3');
const web3Provider = 'https://rpc.fuse.io/';
const web3 = new Web3(web3Provider);
const identityContractABI = require('./identityContractABI.json');
const fs = require('fs');

// Identity contract address
const contractAddress = '0xFa8d865A962ca8456dF331D78806152d3aC5B84F';
const identityContract = new web3.eth.Contract(identityContractABI, contractAddress); 
// It upload the latest whitelisted Blocks state from json file
const whitelisted = require('./whitelistedWBlock.json');
// It upload the latest processed block number
var fromBlock = require('./latestProcessedBlock.json');
// It has the whitelist processing state
var wlProcEnded = false;
// It is the number of blocks that processes each time in the main loop
var blockStep = 10000;
// It has the latest block number in Fuse blockchain
var latestFuseBlock; 
// It is the last block to be processed in each iteration of the main loop.
var latestToBlock;

// Sleep is a function used to wait async methods results
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// Get the latest Fuse block
function getlatestFuseBlock() {
    web3.eth.getBlockNumber().then(result => {latestFuseBlock = result;});
}

/* genWhitelisted function read WhitelistedAdded events from block 6246324
   for each whitelisted event read (if not already set) the address current 
   lastAuthenticated value and keep the event block number if higher than 
   last address WhitelistedAdded event.
   read WhitelistedRemoved events if event block number > address whitelisted 
   event block than remove address
*/
function genWhitelisted() {
    latestToBlock = Math.min(fromBlock + blockStep - 1, latestFuseBlock);
    identityContract.getPastEvents('WhitelistedAdded', {
        fromBlock: fromBlock,
        toBlock: latestToBlock
    }).then( events => {

        // It Feeds the whitelistd dict
        events.forEach( event => {
            if (!whitelisted.hasOwnProperty[event.returnValues.account] ||
                   (whitelisted.hasOwnProperty[event.returnValues.account] && 
                    whitelisted[event.returnValues.account] < event.blockNumber)) {
                whitelisted[event.returnValues.account] = event.blockNumber;
            }
        });
        console.log(Object.keys(whitelisted).length);
        identityContract.getPastEvents('WhitelistedRemoved', {
            fromBlock: fromBlock,
            toBlock: latestToBlock
        }).then( events => {
            var address;
            var blockNumber;

            // It Purge white list
            events.forEach( event => {
                address = event.returnValues.account;
                blockNumber = event.blockNumber;
                if (whitelisted.hasOwnProperty(address)) {
                    console.log('address to delete check '+address);
                    if (whitelisted[address] < blockNumber) {
                        delete whitelisted[address];
                        console.log(address+' deleted.');
                    }
                }
            });
            wlProcEnded = true;
        });
      
    });
}

// Process blocks to generate the whitelisted addreses
async function generateWhitelistPairs() {
    
    console.log('Getting latest blocknumber...');
    getlatestFuseBlock();
    while (latestFuseBlock === undefined) {
        await sleep(500);
    }
    // Alternative loop to process a specified number of sets of blocks in each script execution
    // for (let i = 0; (i < 100) && (latestFuseBlock > fromBlock) ; i++) {        

    while (latestFuseBlock > fromBlock) {                
        genWhitelisted();
        console.log('Generating Whitelist... from block number: '+fromBlock+' to: '+latestToBlock+' latestFuseBlock: '+latestFuseBlock);
        while (!wlProcEnded) {
            await sleep(500);
        }
        console.log('Whitelisted size: '+Object.keys(whitelisted).length);
  
        fromBlock = latestToBlock + 1;
        wlProcEnded = false;
        latestFuseBlock = undefined;
        console.log('Getting latest blocknumber...');
        getlatestFuseBlock();
        while (latestFuseBlock === undefined) {
            await sleep(500);
        }
    }
    
    console.log('============================================================================');
    console.log('Whitelisted size: '+Object.keys(whitelisted).length);
    // It save the whitelist into json file
    fs.writeFile('whitelistedWBlock.json', JSON.stringify(whitelisted), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
    // It save the latest processed block number into json file
    fs.writeFile('latestProcessedBlock.json', JSON.stringify(latestToBlock), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

}
  
generateWhitelistPairs();

