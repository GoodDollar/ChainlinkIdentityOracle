
# Whitelist helper scripts
These scripts reads from the Identity contract at 0xFa8d865A962ca8456dF331D78806152d3aC5B84F from block 6246324

The first script use two files as input parameters:
 1)  whitelistedWBlock.json it contains a json dictionary with the last processed adresses. At the begining the value must setted with **{}** value.
 2)  latestProcessedBlock.json it cotains the last processed block number. At the begining it will be setted with 6246324 value.
   
**First step)** It reads WhitelistedAdded events from block 6246324 for each whitelisted event read (if not already set) the address current lastAuthenticated value and keep the event block number if higher than last address WhitelistedAdded event.

**Second step)** It reads WhitelistedRemoved events if event block number > address whitelisted event block than remove address

**Third step)** The second script reads from Identity contract at 0xFa8d865A962ca8456dF331D78806152d3aC5B84F the current lastAuthenticated value for each address and finaly save into a json file (whitelistedWlastAuthenticated.json) a list of pairs address, lastAuthenticated:timestamp


## Requirements 

 * nodejs 

## Install
```
git clone https://github.com/apronotti/ChainlinkIdentityOracle.git
# into whitelist-helper-scripts dir
npm install
```
## Execute

 * generate whitelisted
```
node genWhitelisted.js
```
 * generate whitelisted with timestamp
```
node node genWhitelistedWLastAuthenticated.js
```
