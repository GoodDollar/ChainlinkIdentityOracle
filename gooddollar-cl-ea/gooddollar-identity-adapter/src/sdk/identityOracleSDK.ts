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

  //NOTICE: we do not sort elements since this is a large tree
  const merkleTree = new MerkleTree(elements, true)
  const merkleRoot = merkleTree.getRoot().toString('hex')
  fs.writeFileSync('whitelistedTree.json', JSON.stringify({ treeData, merkleRoot }))
  fs.writeFileSync('merkleRoot.txt', JSON.stringify(merkleRoot))
  return merkleRoot
}

function _getIPFS_CID() {
  return 'https://ipfs.io/ipfs/'+fs.readFileSync('CID.txt').toString().replace('"', '').replace('"', '')
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
    .catch((error) => {
      console.error("Error in pinata authentication :")
      console.error(error) 
      process.exit(1);
    })

  const sourcePath = 'whitelistedTree.json'
  let cid = ''

  await pinata
    .pinFromFS(sourcePath)
    .then((result) => {
      //handle results here
      cid = result.IpfsHash
    })
    .catch((error) => {
      console.error("Error uploading file to IPFS :")
      console.error(error)
      process.exit(1);
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


  let entries = Object.entries(treeData as Tree);
  let elements = entries.map(e => Buffer.from(e[1].hash.slice(2), "hex"))

  console.log("creating merkletree...", elements.length)

  //NOTICE: tree not sorted
  const merkleTree = new MerkleTree(elements, true)

  const calcMerkleRoot = merkleTree.getRoot().toString("hex")

  const addrData = treeData[_addr]
  const proofFor = Buffer.from(addrData.hash.slice(2), "hex")

  const proof = merkleTree.getProof(proofFor)
  const proofIndex = entries.findIndex(_ => _[1].hash === addrData.hash) + 1

  console.log({ proofIndex, proof, [_addr]: treeData[_addr] })

  return { proof, proofIndex }
}

export { createMerkleHash, postTreeData, createProofFromTreeData, getTreeData }

