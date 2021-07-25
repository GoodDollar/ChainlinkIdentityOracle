# Identity Oracle SDK
## Description: 
- It reads a whitelisted sample file "whitelistedTree.test.json" from filesystem. This filesystem is part of the result of the helper method That reads Identity contract. 
- It creates a merkleroot of whitelisted (address, last authenticated) pair  
- It uploads the Merkle Tree to IPFS: To test postTreeData function require set [IPFS_API_KEY] in identityOracleSDK.ts
- It reads the tree from IPFS and creates a proof. This proof is to be checked on solidity. 

# Requirements

- nodejs
- typescript module

# Install

```
git clone https://github.com/apronotti/ChainlinkIdentityOracle.git
# into sdk dir
npm install
```

# Execute test
```
tsc sdkTest.ts
node sdkTest.js
```
