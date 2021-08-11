import { createMerkleHash , postTreeData , createProofFromTreeData , getTreeData } from './identityOracleSDK'

async function main() {
  console.log('Creating merklehash: '+createMerkleHash()+'\n')
  //to test postTreeData function require set ["API_KEY_VALUE"] and ["API_SECRET_VALUE"] in .env config file
  console.log('Posting TreeData to IPFS cid: ' + await postTreeData()+'\n')
  const addrToTest = '0x5Cc89FC5890795aAb4837e29b54B681dA1aD8843'
  console.log('Getting proof for address: '+addrToTest+' \n -> proof: ['+await createProofFromTreeData(addrToTest)+']\n')
}

main()