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
    {
      "name": "genstatehashipfscid",
      "initiators": [
        {
          "type": "cron",
          "params": {
            "schedule": "CRON_TZ=UTC 40 17 * * *"
          }
        }
      ],
      "tasks": [
        {
          "type": "gooddollar-bridge",
          "params": {
            "endpoint": "genstatehashipfscid"
          }
        }
      ]
    }
```

### JOB: startIPFSandStateHashProcess

This is a cron based job and starts the process of data request and fulfilling

```
{
    "name": "startIPFSandStateHashProcess",
    "initiators": [
        {
            "type": "cron",
            "params": {
                "schedule": "CRON_TZ=UTC  40 20 * * *"
            }
        }
    ],
    "tasks": [
        {
            "type": "ethtx",
            "confirmations": 0,
            "params": {
                "address": "IDENTITY_ORACLE_CONTRACT_ADDRESS",
                "functionSelector": "startIPFSandStateHashProcess()"
            }
        }
    ]
}
```

### JOB: getstatehashipfscid

This job is a runlog one that return the external adapter long response values to the IdentityOracle smartcontract.

```
{
  "name": "getstatehashipfscid",
  "initiators": [
    {
      "type": "runlog",
      "params": {
        "address": "ORACLE_CONTRACT_ADDRESS"
      }
    }
  ],
  "tasks": [
    {
      "type": "gooddollar-bridge",
      "params": {
        "endpoint": "getstatehashipfscid"
      }
    },
    {
      "type": "resultcollect"
    },
    { 
      "type": "ethtx",
      "confirmations": 1,
      "params": {
        "abiEncoding": [
          "bytes32",
          "bytes"
        ]
      }
    }
  ]
}
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

in this example it has the address: 0x8f662fb14f7358c2BAeb9b5DdA4fE40F3fc65018


### Identity Oracle

./contracts/IdentityOracle.sol 

in this example it was deployed with address: 0x3fADdAFA3b59aA54Ab16fDEbaB7fd2cDBC2fEBc1

## workflow

1. Chainlink node starts the cron job genstatehashipfscid
   + It goes throught the bridge and starts the process genstatehashipfscid 
2. Chainlink node starts the cron job startIPFSandStateHashProcess
   + It connects to the smart contract IdentityOracle and invokes the function startIPFSandStateHashProcess()
   + This function makes a request to the function requestOracleData of Operator Smart Contract and pass the "getstatehashipfscid" job ID.
     + The Chainlink JOB request goes throught the bridge
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

To run integration tests:

```bash
yarn test-integration
```

## Run

The deployment output will give you the contract addresses as they are deployed. You can then use these contract addresses in conjunction with Hardhat tasks to perform operations on each contract

### To run the startstartIPFSandStateHashProcess() function & Receive the results
The IdentityOracle contract has two tasks, one to request startstartIPFSandStateHashProcess() function execution, and one to recieve the results. This contract needs to be funded with link first:

```bash
npx hardhat fund-link --contract insert-contract-address-here --network network
```

Once it's funded, you can run the request-data task. The contract parameter is mandatory, the rest are optional

```bash
npx hardhat request-data --contract insert-contract-address-here --network network
```

Once you have successfully made a request for external data, you can see the result via the read-data task
```bash
npx hardhat read-data --contract insert-contract-address-here --network network
```

