
# Whitelist helper scripts
These scripts reads from the Identity contract at 0xFa8d865A962ca8456dF331D78806152d3aC5B84F from block 6246324

## Process description

**First step)** It reads WhitelistedAdded events from block 6246324 for each whitelisted event read the address current lastAuthenticated value and keep the event block number if higher than last address WhitelistedAdded event.

**Second step)** It reads WhitelistedAdded events from block 6246324 for each whitelisted event, it read the address current lastAuthenticated value and save the new block number if the event block number if it is higher than current block number assigned to this address.

**Third step)** It reads from Identity contract at 0xFa8d865A962ca8456dF331D78806152d3aC5B84F the current lastAuthenticated value for each address and finaly save into a json file (whitelistedWlastAuthenticated.json) a list of pairs address, lastAuthenticated:timestamp


## Requirements 

 * nodejs 
 * typescript module

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
