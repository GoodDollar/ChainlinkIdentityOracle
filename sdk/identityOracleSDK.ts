import { ethers } from "ethers";
import * as fs from 'fs';
import MerkleTree from "merkle-tree-solidity";
import fetch from "node-fetch";
import { NFTStorage, Blob } from 'nft.storage'


type Tree = {
    [key: string]: {
        hash: string;
        lastAuth: number;
    };
};

type Whitelisted = {
    [key: string]: {
        lauth: number;
    };
};

function createMerkleHash() {

    const fileContent = JSON.parse(fs.readFileSync("whitelisted.test.json").toString());
    

    let toTree: Array<[string, number]> = Object.entries(fileContent as Whitelisted).map(
        (e) => {
            return [e[0], e[1]["lauth"]];
        }
    );
    //elementes creation and asignment
    const treeData = {};
    const elements = toTree.map(e => {
        const lAuth = (e[1])
            .toLocaleString("fullwide", {
                useGrouping: false
            });
        const hash = ethers.utils.keccak256(
            ethers.utils.defaultAbiCoder.encode(
                ["address", "uint256"],
                [e[0], lAuth]
            )
        );
        treeData[e[0]] = {
            lauth: lAuth,
            hash
        };
        return Buffer.from(hash.slice(2), "hex");
    });


    const merkleTree = new MerkleTree(elements);
    const merkleRoot = merkleTree.getRoot().toString("hex");
    fs.writeFileSync("whitelistedTree.test.json", JSON.stringify({ treeData, merkleRoot }));
    return merkleRoot;

}

function _getIPFS_CID() {
    // Hardcoded to test, It will get IPFS CID from smart contract
    return "https://bafkreibpjfb52jogprvsjydbyncqbazpcd376r46x6znlzknhzkqkb5pba.ipfs.dweb.link/";
}

async function getTreeData() {

    const data = await fetch(
        _getIPFS_CID()
    ).then(_ => _.json());
   
    return data;
}

async function postTreeData() {
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDYzNUZBMzJBMTJFMEYyODdlMzE4MUJlMUQyYkFiQWY2MjY5NkI0OTUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTYyNTg1ODMyMTg5NywibmFtZSI6IkdETEF1dGgifQ.NYJc0Lbk4-Wi7M1qPKKA9ggeYOQ9JTIUyByLJHiSuYM';
    const client = new NFTStorage({ token: apiKey })

    const fileContent = JSON.parse(fs.readFileSync("whitelistedTree.test.json").toString());
    const cid = await client.storeBlob(new Blob([JSON.stringify(fileContent)]));

    return cid;
}

async function createProofFromTreeData(_addr: string) {
    type Tree = {
        [key: string]: {
            hash: string;
            lastAuth: number;
        };
    };

    const data = await getTreeData();
    
    const treeData = data["treeData"];
    
    // Verifing if address exists
    if (!treeData.hasOwnProperty(_addr)) {
        throw console.error("error : "+_addr+"  doesn't exist");
    }
    const merkleRoot = data["merkleRoot"];
    const elements = Object.entries(treeData as Tree).map(e =>
        Buffer.from(e[1].hash.slice(2), "hex")
    );
    const merkleTree = new MerkleTree(elements);

    const proof = merkleTree
        .getProof(Buffer.from(treeData[_addr].hash.slice(2), "hex"))
        .map(_ => "0x" + _.toString("hex"));
    
    console.log({ proof, [_addr]: treeData[_addr] });
    
    return proof;
}

export { createMerkleHash, postTreeData, createProofFromTreeData, getTreeData };