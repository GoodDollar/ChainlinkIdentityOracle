# Chainlink Interaction

Create a CL Node and Fund the cl node address with ETH

## Bridge
Create a bridge for the external adapter

```
Bridge Name
gooddollar-bridge
Bridge URL
http://localhost:8080
Minimum Contract Payment
0
Confirmations
0
```
## Chainlink Jobs

Create the jobs

### JOB: genstatehashipfscid

This job is started by cron to generates the Addresses whitelist, upload it to IPFS, and creates the merkle hash, finally it saves this two parametes in filesystem. It takes more than one hour for about 230000 Addresses.

```
type = "cron"
schemaVersion = 1
name = "genstatehashipfscid"
schedule = "CRON_TZ=UTC 0 30 19 * * *"
observationSource = """
    gen_statehash_ipfscid [type=bridge name="gooddollar-bridge" requestData="{\\"data\\": {\\"endpoint\\":\\"genstatehashipfscid\\"}}"]
                
    gen_statehash_ipfscid
"""
```

### JOB: getstatehashipfscid

This job is a runlog one that return the external adapter long response values to the IdentityOracle smartcontract.

```
type = "cron"
schemaVersion = 1
name = "getstatehashipfscid"
schedule = "CRON_TZ=UTC 0 30 21 * * *"
observationSource = """
    fetch_hash [type=bridge name="gooddollar-bridge" requestData="{\\"data\\": {\\"endpoint\\":\\"getstatehashipfscid\\"}}"]
    json_parser [type="jsonparse"
              data="$(fetch_hash)"
              path="result"]
    encode_tx  [type=ethabiencode
                          abi="setFulfillStateHashIPFSCID(bytes result)" 
                          data=<{ "result": $(json_parser) }>]
    submit_tx [type=ethtx to="0x8CC93F854df3d9815331Cd178f496d4Db1D677A3" data="$(encode_tx)"]                     
    
    fetch_hash -> json_parser -> encode_tx -> submit_tx
"""
```

## Involved Smart contracts

### Oracle contract

Operator.sol 
```
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.7.0;

import "https://github.com/smartcontractkit/chainlink/blob/v0.10.13/contracts/src/v0.7/Operator.sol";
```

in this example it was deployed with address: 0x4f4202CCAf8999Cf86e02cB9324B909aE0Fe1E04


To autorize the node to fulfill requests invoke the function:
setAuthorizedSenders(["CHAINLINK_NODE_ADDRESS"])

in this example it has the address: 0xEa87db1524Ae4469CD5fD0b0fa490CB8662C8CF8


### Identity Oracle

./contracts/IdentityOracle.sol 

in this example it was deployed with address: 0x8CC93F854df3d9815331Cd178f496d4Db1D677A3

## workflow

1. Chainlink node starts the cron job genstatehashipfscid
   + It goes throught the bridge and starts the process genstatehashipfscid 
2. Chainlink node starts the cron job getstatehashipfscid job ID.
     + The Chainlink JOB request goes through the bridge
       - Call the external adapter and it returns the merklehash and Ipfscid
       - The job responses with a bytes "long response" the merklehash concatenated with the Ipfscid 
   + Finally node responses calling the function setFulfillStateHashIPFSCID of the IdentityOracle smart contract. 


<br/>
<p align="center">
<a href="https://chain.link" target="_blank">
<img src="https://raw.githubusercontent.com/smartcontractkit/chainlink-hardhat-box/master/box-img-lg.png" width="225" alt="Chainlink Hardhat logo">
</a>
</p>
<br/>

# IdentityOracle Tested with Chainlink Hardhat Box
 Implementation of the test using the [Hardhat](https://hardhat.org/) development environment:
 - [Request & Receive data](https://docs.chain.link/docs/request-and-receive-data)
 
 ## Requirements

- [NPM](https://www.npmjs.com/) and [YARN](https://yarnpkg.com/)


## Installation

Set your `KOVAN_RPC_URL` [environment variable.](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html). You can get one for free at [Infura's site.](https://infura.io/) You'll also need to set the variable `PRIVATE_KEY` which is your private key from you wallet, ie MetaMask. This is needed for deploying contracts to public networks.

You can set these in your `.env` file if you're unfamiliar with how setting environment variables work. Check out our [.env example](https://github.com/smartcontractkit/hardhat-starter-kit/blob/main/.env.example). If you wish to use this method to set these variables, update the values in the .env.example file, and then rename it to '.env'

![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+) **WARNING** ![WARNING](https://via.placeholder.com/15/f03c15/000000?text=+)

Don't commit and push any changes to .env files that may contain sensitive information, such as a private key! If this information reaches a public GitHub repository, someone can use it to check if you have any Mainnet funds in that wallet address, and steal them!

`.env` example:
```
KOVAN_RPC_URL='www.infura.io/asdfadsfafdadf'
PRIVATE_KEY='abcdef'
MAINNET_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/your-api-key"
```
`bash` example
```
export KOVAN_RPC_URL='www.infura.io/asdfadsfafdadf'
export MNEMONIC='cat dog frog...'
export MAINNET_RPC_URL="https://eth-mainnet.alchemyapi.io/v2/your-api-key"
```

If you plan on deploying to a local [Hardhat network](https://hardhat.org/hardhat-network/) that's a fork of the Ethereum mainnet instead of a public test network like Kovan, you'll also need to set your `MAINNET_RPC_URL` [environment variable.](https://www.twilio.com/blog/2017/01/how-to-set-environment-variables.html) and uncomment the `forking` section in `hardhat.config.js`. 

You can also use a `PRIVATE_KEY` instead of a `MNEMONIC` environment variable by uncommenting the section in the `hardhat.config.js`, and commenting out the `MNEMONIC` line.

Then you can install all the dependencies

```bash
git clone https://github.com/GoodDollar/ChainlinkIdentityOracle/
cd ChainlinkIdentityOracle
```
then

```bash
npm install
```

## Auto-Funding

This Starter Kit is configured by default to attempt to auto-fund any newly deployed contract, to save having to manually fund them after each deployment. The amount in LINK to send as part of this process can be modified in the [Starter Kit Config](https://github.com/apronotti/ChainlinkIdentityOracle/blob/main/helper-hardhat-config.js), and are configurable per network.

| Parameter  | Description                                                      | Default Value |
| -----------|:-----------------------------------------------------------------| :-------------|
| fundAmount | Amount of LINK to transfer when funding contracts                | 1 LINK        |

If you wish to deploy the smart contracts without performing the auto-funding, run the following command when doing your deployment:

```bash
npx hardhat deploy --tags main
```


## Deploy

Deployment scripts are in the [deploy](https://github.com/apronotti/ChainlinkIdentityOracle/tree/main/deploy) directory. If required, edit the desired environment specific variables or constructor parameters in each script, then run the hardhat deployment plugin as follows. If no network is specified, it will default to the hardhat network.

This will deploy to a local hardhat network

To deploy to testnet:
```bash
npx hardhat deploy --network kovan
```

## Test
Tests are located in the [test](https://github.com/smartcontractkit/hardhat-starter-kit/tree/main/test) directory, and are split between unit tests and integration tests. Unit tests should only be run on local environments, and integration tests should only run on live environments.

To run unit tests:

```bash
yarn test
```


