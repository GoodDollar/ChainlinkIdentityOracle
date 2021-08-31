// SPDX-License-Identifier: MIT

pragma solidity >0.8.0;

import "hardhat/console.sol";
import "@gooddollar/goodprotocolv2/contracts/utils/DAOUpgradeableContract.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/MerkleProofUpgradeable.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

contract IdentityOracle is DAOUpgradeableContract, ChainlinkClient, Ownable {
    address public dao_avatar; // this implementation is only to test. In live it would be replaced for dao.avatar

    bytes32 public stateHash; // current state hash
    string public stateDataIPFS; // ipfs cid

    bytes32 public tmpStateHash; // this is used for the first of three steps of oracle updating process
    bytes32 public tmpStateDataIPFS1; // this is used for the second of three steps of oracle updating process
    bytes32 public tmpStateDataIPFS2; // this is used for the second of three steps of oracle updating process

    uint256 private constant ORACLE_PAYMENT = 10**17;
    string private JOBID_GET_STATE_HASH = "9088a872ef6a4c9b98234ac8db3ec4c0";
    string private JOBID_GET_IPFS_CID1 = "abbcfd8e16c048718e8a030daa2e489b";
    string private JOBID_GET_IPFS_CID2 = "be8deaa69e5b4dbea17f20fbc364023b";
    address private constant ORACLE_ADDRESS =
        0x7bccD524Fd2Cc264Dd80E4589B4B3409fb61daC0;

    uint256 public lastStartUpdProcInvoked;

    struct WhitelistProofState {
        uint256 lastProofDate;
        uint256 lastAuthenticatedDate;
    }

    mapping(address => WhitelistProofState) private whitelistProofState;
    event ProofResult(bool);
    mapping(address => bool) private oracleState; // Store oracle address ad if isAllowed

    constructor(address _link) Ownable() {
        if (_link == address(0)) {
            setPublicChainlinkToken();
        } else {
            setChainlinkToken(_link);
        }
        //setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);  // It's Link address of Kovan

        dao_avatar = msg.sender;
        oracleState[ORACLE_ADDRESS] = true;
        oracleState[msg.sender] = true;
    }

    function _onlyOracle() internal view {
        require(
            oracleState[msg.sender],
            "only allowed oracle can call this method"
        );
    }

    function _onlyAvatarTmp() internal view {
        require(
            address(dao_avatar) == msg.sender,
            "only avatar can call this method"
        );
    }

    //- only the DAO can approve/remove an oracle. onlyAvatar is defined in DAOUpgradeableContract
    function setOracle(address _oracle, bool _isAllowed) public {
        _onlyAvatarTmp();
        oracleState[_oracle] = _isAllowed;
    }

    function setState(bytes32 _merklehash, string memory _ipfscid)
        public
    //- only approved oracles can set the new merkle state plus link to ipfs data used to create state
    {
        _onlyOracle();
        stateHash = _merklehash;
        stateDataIPFS = _ipfscid;
    }

    // It's is the first function to be called by the oracle to update IPFS CID and StatetHash
    function startIPFSandStateHashProcess() public {
        _onlyOracle();
        lastStartUpdProcInvoked = block.timestamp;
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(JOBID_GET_STATE_HASH),
            address(this),
            this.setTmpStateHash.selector
        );
        sendChainlinkRequestTo(ORACLE_ADDRESS, req, ORACLE_PAYMENT);
    }

    // It's the second function to be called by the oracle to store the tmpStateHash value
    function setTmpStateHash(bytes32 _requestId, bytes32 _statehash)
        public
        recordChainlinkFulfillment(_requestId)
    // This function is called only oracle
    //- only approved oracles can set the new merkle state plus link to ipfs data used to create state
    {
        _onlyOracle();
        tmpStateHash = _statehash;
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(JOBID_GET_IPFS_CID1),
            address(this),
            this.setTmpStateDataIPFS1.selector
        );
        sendChainlinkRequestTo(ORACLE_ADDRESS, req, ORACLE_PAYMENT);
    }

    // It's the third function to be called by the oracle to store the first 32 bytes of IPFS CID
    function setTmpStateDataIPFS1(bytes32 _requestId, bytes32 _ipfscid1)
        public
        recordChainlinkFulfillment(_requestId)
    // This function is called only oracle
    //- only approved oracles can set the new merkle state plus link to ipfs data used to create state
    {
        _onlyOracle();
        tmpStateDataIPFS1 = _ipfscid1;
        Chainlink.Request memory req = buildChainlinkRequest(
            stringToBytes32(JOBID_GET_IPFS_CID2),
            address(this),
            this.completeIPFSandStateHashProcess.selector
        );
        sendChainlinkRequestTo(ORACLE_ADDRESS, req, ORACLE_PAYMENT);
    }

    // It's the fourth function to be called by the oracle to store the second 32 bytes of IPFS CID
    // And then assign the StateHash and IPFS CID values at once
    function completeIPFSandStateHashProcess(
        bytes32 _requestId,
        bytes32 _ipfscid2
    )
        public
        recordChainlinkFulfillment(_requestId)
    // This function is called only oracle
    //- only approved oracles can set the new merkle state plus link to ipfs data used to create state
    {
        _onlyOracle();
        tmpStateDataIPFS2 = _ipfscid2;
        setState(
            tmpStateHash,
            convIPFSCIDinBytes32ToStr(tmpStateDataIPFS1, tmpStateDataIPFS2)
        );
    }

    //- prove that pair publicAddress, lastAuthenticated exists in current state.
    //update address state in smart contract. also update address lastProofDate (required by isWhitelisted below).
    //Proof can be generated by "sdk" defined in previous step.
    function prove(
        address _address,
        uint256 _lastAuthenticated,
        bytes32[] memory _proof
    ) public {
        bool result = false;
        (, result) = _checkMerkleProof(
            _address,
            _lastAuthenticated,
            stateHash,
            _proof
        );
        //update address state in smart contract. also update address lastProofDate (required by isWhitelisted below).
        if (result) {
            WhitelistProofState memory state;
            state.lastProofDate = block.timestamp;
            state.lastAuthenticatedDate = _lastAuthenticated;
            whitelistProofState[_address] = state;
        }
        emit ProofResult(result);
    }

    function _checkMerkleProof(
        address _address,
        uint256 _lastAuthenticated,
        bytes32 _root,
        bytes32[] memory _proof
    ) internal pure returns (bytes32 leafHash, bool isProofValid) {
        leafHash = keccak256(abi.encode(_address, _lastAuthenticated));
        isProofValid = MerkleProofUpgradeable.verify(_proof, _root, leafHash);
    }

    //- returns true if address is whitelisted under maxProofAge and maxAuthentication age restrictions.
    //maxProofAge should be compared to lastProofDate and maxAuthenticationAge to lastAuthenticated.
    //if 0 is supplied then they are ignored.
    function isWhitelisted(
        address _address,
        uint256 _maxProofAgeInDays,
        uint256 _maxAuthenticationAgeInDays
    ) public view returns (bool) {
        bool result = false;
        WhitelistProofState memory state = whitelistProofState[_address];
        if (state.lastProofDate > 0) {
            if (
                (_maxAuthenticationAgeInDays == 0 ||
                    state.lastAuthenticatedDate >
                    block.timestamp - _maxAuthenticationAgeInDays * 1 days) &&
                (_maxProofAgeInDays == 0 ||
                    state.lastProofDate >
                    block.timestamp - _maxProofAgeInDays * 1 days)
            ) {
                result = true;
            }
        }
        return result;
    }

    function setJobIDIPFS1(string memory _jobid) public {
        _onlyAvatarTmp();
        JOBID_GET_IPFS_CID1 = _jobid;
    }

    function setJobIDIPFS2(string memory _jobid) public {
        _onlyAvatarTmp();
        JOBID_GET_IPFS_CID2 = _jobid;
    }

    function setJobIDStateHash(string memory _jobid) public {
        _onlyAvatarTmp();
        JOBID_GET_STATE_HASH = _jobid;
    }

    function getJobIDIPFS1() public view returns (string memory) {
        _onlyAvatarTmp();
        return JOBID_GET_IPFS_CID1;
    }

    function getJobIDIPFS2() public view returns (string memory) {
        _onlyAvatarTmp();
        return JOBID_GET_IPFS_CID2;
    }

    function getJobIDStateHash() public view returns (string memory) {
        _onlyAvatarTmp();
        return JOBID_GET_STATE_HASH;
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function convIPFSCIDinBytes32ToStr(bytes32 _value1, bytes32 _value2)
        private
        pure
        returns (string memory)
    {
        bytes memory bytesArray = new bytes(59);
        uint256 mainindex = 0;

        for (uint256 i = 5; i < 32; i++) {
            bytesArray[mainindex] = _value1[i];
            mainindex++;
        }

        for (uint256 i; i < 32; i++) {
            bytesArray[mainindex] = _value2[i];
            mainindex++;
        }
        return string(bytesArray);
    }

    function stringToBytes32(string memory source)
        private
        pure
        returns (bytes32 result)
    {
        bytes memory tempEmptyStringTest = bytes(source);
        if (tempEmptyStringTest.length == 0) {
            return 0x0;
        }

        assembly {
            // solhint-disable-line no-inline-assembly
            result := mload(add(source, 32))
        }
    }
}
