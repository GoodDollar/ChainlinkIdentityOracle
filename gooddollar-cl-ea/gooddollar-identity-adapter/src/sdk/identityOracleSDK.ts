import { config } from 'dotenv'
import { ethers } from 'ethers'
import * as fs from 'fs'
import MerkleTree from 'merkle-tree-solidity'
import fetch from 'node-fetch'
import pinataSDK from '@pinata/sdk'
config()

type Whitelisted = {
  [key: string]: {
    lauth: number
  }
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function createMerkleHash() {
  const fileContent = JSON.parse(fs.readFileSync('whitelistedWlastAuthenticated.json').toString())

  const toTree: Array<[string, number]> = Object.entries(fileContent as Whitelisted).map((e) => {
    return [e[0], e[1]['lauth']]
  })
  //elementes creation and asignment
  const treeData: { [x: string]: { lauth: string; hash: string } } = {}
  const elements = toTree.map((e) => {
    const lAuth = e[1].toLocaleString('fullwide', {
      useGrouping: false,
    })
    const hash = ethers.utils.keccak256(
      ethers.utils.defaultAbiCoder.encode(['address', 'uint256'], [e[0], lAuth]),
    )
    treeData[e[0]] = {
      lauth: lAuth,
      hash,
    }
    return Buffer.from(hash.slice(2), 'hex')
  })

  const merkleTree = new MerkleTree(elements)
  const merkleRoot = merkleTree.getRoot().toString('hex')
  fs.writeFileSync('whitelistedTree.json', JSON.stringify({ treeData, merkleRoot }))
  return merkleRoot
}

function _getIPFS_CID() {
  // Hardcoded to test, It will get IPFS CID from smart contract
  return 'https://ipfs.io/ipfs/QmboSowciWiTquCFzKgUg8Dpi89fzGTfAywmjF15ygDB4o'
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function getTreeData() {
  const data = await fetch(_getIPFS_CID()).then((_) => _.json())
  return data
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function postTreeData() {
  const apiKey = process.env.IPFS_API_KEY != undefined ? process.env.IPFS_API_KEY : ''
  const apiSecret = process.env.IPFS_API_SECRET != undefined ? process.env.IPFS_API_SECRET : ''
  const pinata = pinataSDK(apiKey, apiSecret)

  pinata
    .testAuthentication()
    .then((result) => {
      //handle successful authentication here
      console.log(result)
    })
    .catch((err) => {
      //handle error here
      console.log(err)
    })

  const sourcePath = 'whitelistedTree.json'
  let cid = ''

  await pinata
    .pinFromFS(sourcePath)
    .then((result) => {
      //handle results here
      cid = result.IpfsHash
    })
    .catch((err) => {
      //handle error here
      console.log(err)
    })

  fs.writeFileSync('CID.txt', JSON.stringify(cid))

  return cid
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
async function createProofFromTreeData(_addr: string) {
  type Tree = {
    [key: string]: {
      hash: string
      lastAuth: number
    }
  }

  const data = await getTreeData()
  const treeData = data['treeData']

  // Verifing if address exists
  // eslint-disable-next-line no-prototype-builtins
  if (!treeData.hasOwnProperty(_addr)) {
    throw console.error('error : ' + _addr + "  doesn't exist")
  }
  //const merkleRoot = data["merkleRoot"];
  const elements = Object.entries(treeData as Tree).map((e) =>
    Buffer.from(e[1].hash.slice(2), 'hex'),
  )
  const merkleTree = new MerkleTree(elements)
  const proof = merkleTree
    .getProof(Buffer.from(treeData[_addr].hash.slice(2), 'hex'))
    .map((_: { toString: (arg0: string) => string }) => '0x' + _.toString('hex'))

  //console.log({ proof, [_addr]: treeData[_addr] });
  return proof
}

export { createMerkleHash, postTreeData, createProofFromTreeData, getTreeData }
//export { createMerkleHash, createProofFromTreeData, getTreeData }
