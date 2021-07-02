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
// This array contents the whitelisted addreses 
const whitelistedArray = Object.keys(whitelisted);
// This dictionary is where the main process store the results.
const whitelistedWLastAuthenticated = {}; 
// This is the size of the list to process
const wlLength = whitelistedArray.length ;

// Sleep is a function used to wait async methods results
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getLastAuthenticated(address) {
    identityContract.methods.lastAuthenticated(address).call()
        .then(result => 
            {
                whitelistedWLastAuthenticated[address] = result;
            });
}

async function genWhitelistedWLastAuthenticated() {
    for (let i = 0 ; i < whitelistedArray.length ; i++) {
            getLastAuthenticated(whitelistedArray[i]);
            
            if ((i % 100) == 0) 
            {
                console.log(i);
                console.log(Object.keys(whitelistedWLastAuthenticated).length);
                await sleep(150);
            }
        
    }
}
// This function generate a list with the pairs of whitelisted (address, lastAuthenticated) 
async function generateWhitelistedWTSAndSave() {
    console.log('============================================================================');
    console.log('Obtaining lastAuthenticated ...');
    genWhitelistedWLastAuthenticated();
    console.log('============================================================================');
    while(Object.keys(whitelistedWLastAuthenticated).length < wlLength) {
        await sleep(1000);
    }
    
    console.log(Object.keys(whitelistedWLastAuthenticated).length);

    // It save the whitelist with lastAuthenticated into json file
    fs.writeFile('whitelistedWlastAuthenticated.json', JSON.stringify(whitelistedWLastAuthenticated), function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}
  
generateWhitelistedWTSAndSave();

