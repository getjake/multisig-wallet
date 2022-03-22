// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MultisigWallet {

    struct Tx {
        address payable _to;
        uint256 _amount;
    }

    address public admin;
    uint public minNumOfSigners; // at least two
    address[] public signers;
    
    event TransferProposed (
        uint indexed id,
        address indexed _to,
        uint256 _amount
    );

    event EthSent(
        address indexed _to,
        uint256 _amount
    );
    
    // transaction
    uint public txCount;
    mapping(uint => Tx) public transactions; // tx, to => amount
    mapping(uint => uint) public numberPeopleSigned; // how many people already signed the tx.
    mapping(uint => address[]) public peopleSigned;
    mapping(uint => bool) public isEthSent;

    constructor(uint _minNumOfSigners) {
        admin = msg.sender;
        signers.push(msg.sender);
        require(_minNumOfSigners >= 2, "Number of signers shall be no less than 2");
        minNumOfSigners = _minNumOfSigners; 
    }

    // add signers;
    function addSigner(address _signer) onlyOwner external {
        uint numOfSigners = signers.length;
        bool signerExists = false;
        for(uint i = 0; i < numOfSigners; i++) {
            if (signers[i] == _signer) {
                signerExists = true;
                break;
            }
        }
        require(signerExists == false, "signer already exists");
        signers.push(_signer);
    }
    
    // deposit money into the smart contract
    function deposit() payable external {}
    // the fallback function
    receive() external payable {}

    // 一般在写入的function中不用 return, 而使用 emit event
    function proposeTranser(address payable _to, uint256 amount) onlyOwner external{
        require(_to != address(0), "Cannot pay to empty address!");
        require(amount > 0, "At least pay one wei");
        require(address(this).balance >= amount, "Insufficient balance!");
        // Add item
        uint _id = txCount;
        transactions[_id] = Tx(_to, amount);
        signTransfer(_id);
        txCount++;
        emit TransferProposed(_id, _to, amount);
    }

    function signTransfer(uint _id) public onlySigner {
        require(isEthSent[_id] == false, "You cannot signed the expired tx");
        require(_isPersonSigned(_id, msg.sender) == false, "You have already signed this tx");
        require(numberPeopleSigned[_id] < minNumOfSigners, "No need to sign it");

        peopleSigned[_id].push(msg.sender);
        numberPeopleSigned[_id]++;

        if(numberPeopleSigned[_id] >= minNumOfSigners) {
            require(address(this).balance >= transactions[_id]._amount, "Insufficient balance!");
            _sendEther(transactions[_id]._to, transactions[_id]._amount);
            isEthSent[_id] = true;
            emit EthSent(transactions[_id]._to, transactions[_id]._amount);
        }
    }

    // https://solidity-by-example.org/sending-ether/
    function _sendEther(address payable _to, uint256 amount) private {
        (bool sent, bytes memory data) = _to.call{value: amount}("");
        require(sent, "Failed to send ether to recipient");
    }

    function _isPersonSigned(uint _id, address _signer) internal view returns(bool) {
        address[] memory _peopleSigned = peopleSigned[_id];
        for(uint i=0; i < _peopleSigned.length; i++) {
            if(_signer == _peopleSigned[i]) {
                return true;
            }
        }
        return false;
    }

    function getEthBalance() public view returns(uint256) {
        uint256 result = address(this).balance;
        return result;
    }

    modifier onlySigner() {
        bool validSigner = false;
        uint numOfSigners = signers.length;
        for(uint i = 0; i < numOfSigners; i++) {
            if(msg.sender == signers[i]) {
                validSigner = true;
                break;
            }
        }
        require(validSigner, "Only valid signer is allowed");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == admin, "msg.sender must be admin");
        _;
    }
}