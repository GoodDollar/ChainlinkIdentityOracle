import { ethers } from 'ethers'
import { identityOracle as identityOracleContractABI } from './identityOracleContractABI.json'

const url: string = 'KOVAN_RPC_PROVIDER' 
const provider: ethers.providers.JsonRpcProvider = new ethers.providers.JsonRpcProvider(url)

// Identity contract address
const IDENTITY_ORACLE_CONTRACT_ADDRESS = 'IDENTITYORACLE_CONTRACT_ADDRESS'
//const contract: ethers.Contract = new ethers.Contract(IDENTITY_ORACLE_CONTRACT_ADDRESS, identityOracleContractABI, provider)
const signer = new ethers.Wallet('WALLET_PRIVATE_KEY', provider)
const contract: ethers.Contract = new ethers.Contract(IDENTITY_ORACLE_CONTRACT_ADDRESS, identityOracleContractABI, signer)

async function main() {

    let stateHash = await contract.stateHash()
    console.log('Current stateHash value: '+stateHash+'\n')

    let ipfs_cid = await contract.stateDataIPFS()
    console.log('Current IPFS CID value: '+ipfs_cid+'\n')

    console.log('Sending a transaction to set values into stateHash and IPFS CID ... \n')
    let tx = await contract.setState('0x0e8d3a960d058403c71b98a920e76d23683589ded04b08d877f3da31dcca18c6',
    'bafkreibpjfb52jogprvsjydbyncqbazpcd376r46x6znlzknhzkqkb5pba' ,{gasLimit: 200000})

    // wait for the transaction to be mined
    let receipt = await tx.wait()
    //console.log(receipt)

    // FIRST PROOF 
    stateHash = await contract.stateHash()
    console.log('Current stateHash value: '+stateHash)

    ipfs_cid = await contract.stateDataIPFS()
    console.log('Current IPFS CID value: '+ipfs_cid+'\n')
    

    console.log('Testing prove function with a first set of values ...')
    const proof = [
        '0x7bc8520406917b1df974038b71fdf950d153eb984f8865ee1eed44ba48aa0d75',
        '0x553efbe26bb9edad753c89e3944df2c0db74e14167021adcbfe59393ba331e16'
    ]
    console.log('The proof : '+proof)
    //const leafHash = '0xeb5ba0420a052a25247df44c56c85d5dd9a15b8316c61c0ea9882b5180b64533'
    let address = '0x5Cc89FC5890795aAb4837e29b54B681dA1aD8843'
    const lastAuthenticated = 1596045795
    console.log('The address: '+address+' ; last authenticated :'+lastAuthenticated)

    tx = await contract.prove(address, lastAuthenticated, proof , {gasLimit: 200000})

    // wait for the transaction to be mined
    receipt = await tx.wait()
    let proofResult = receipt.events.pop()

    let result = proofResult.args[0]

    //console.log(receipt)
    console.log('Proof result: '+result+'\n')

    console.log('Checking if prove store the result using isValidProof function ...')
    let resultIsValidProof = await contract.isValidProof(address, lastAuthenticated, proof)
    console.log('isValidProof() result: '+resultIsValidProof+'\n')

    // SECOND PROOF 
    console.log('Testing prove function with second set of values ...')
    let proof2 = [
        '0xeb5ba0420a052a25247df44c56c85d5dd9a15b8316c61c0ea9882b5180b64533',
        '0x553efbe26bb9edad753c89e3944df2c0db74e14167021adcbfe59393ba331e16'
    ]
    console.log('The proof : '+proof2)
    let address2 = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    let lastAuthenticated2 = 1596045795
    console.log('The address: '+address+' ; last authenticated :'+lastAuthenticated)

    let tx2 = await contract.prove(address2, lastAuthenticated2, proof2 , {gasLimit: 200000})

    // wait for the transaction to be mined
    const receipt2 = await tx2.wait()
    //console.log(receipt2)
    let proofResult2 = receipt2.events.pop()

    let result2 = proofResult2.args[0]

    //console.log(receipt)
    console.log('Proof result: '+result2+'\n')

    console.log('Checking if prove store the result using isValidProof function ...')
    const resultIsValidProof2 = await contract.isValidProof(address2, lastAuthenticated2, proof2)
    console.log('isValidProof() result : '+resultIsValidProof2+'\n')

    console.log('Te following tests are for isWhitelisted(address _address,uint256 _maxProofAgeInDays, uint256 _maxAuthenticationAgeInDays) function')
    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 0) ')
    console.log('It would be return true')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 0, 0)
    console.log('Resulr : '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 500, 0) ')
    console.log('It would be return true')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 500, 0)
    console.log('Result: '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 500) ')
    console.log('It would be return true')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 0, 500)
    console.log('Result: '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 500, 500) ')
    console.log('It would be return true')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 500, 500)
    console.log('Result: '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 1, 0) ')
    console.log('It would be return true')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 1, 0)
    console.log('Result: '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 0, 10) ')
    console.log('It would be return false')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 0, 10)
    console.log('Result : '+result+'\n')

    console.log('Checking isWhitelisted(\'0xf96dADc6D71113F6500e97590760C924dA1eF70e\', 10, 10) ')
    console.log('It would be return false')
    console.log('Checking if prove store the result using isValidProof function ...')
    address = '0xf96dADc6D71113F6500e97590760C924dA1eF70e'
    result = await contract.isWhitelisted(address, 10, 10)
    console.log('Result:'+result+'\n')

}

main()
