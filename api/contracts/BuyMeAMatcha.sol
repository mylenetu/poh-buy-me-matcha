//SPDX-License-Identifier: MIT
pragma solidity >=0.8.5 <0.9.0;

import "poh-contracts/contracts/HumanOnly.sol";

contract BuyMeAMatcha is HumanOnly {
    event NewMemo(
        address indexed from,
        uint256 timestamp,
        string name,
        string message
    );

    struct Memo {
        address from;
        uint256 timestamp;
        string name;
        string message;
    }

    Memo[] memos;
    address payable _owner;

    constructor() {
      _owner = payable(msg.sender);
      setHumanityValidator(0x9064071eaB7c22E00e2d63233a9507d7107cFCD1);
    }

    function buyMatcha(string memory _name, string memory _message, bytes calldata proof) public payable basicPoH(proof) {
        require(msg.value > 0, "can't buy matcha with 0 eth");

        // Adds the memo to storage
        memos.push(Memo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        ));

        // Emit a log event when a new memo is created
        emit NewMemo(
            msg.sender,
            block.timestamp,
            _name,
            _message
        );
    }

        function getBalance() public view returns(uint) {
        return address(this).balance;
    }

   /**
    * @dev send the entire balance stored in this contract to the _owner
     */
    function withdrawTips() public {
        require(_owner.send(address(this).balance));
    }

   /**
    * @dev retrieve all the memos received and stored on the blockchain
     */
    function getMemos() public view returns(Memo[] memory){
        return memos;
    }

        function withdrawMoneyTo(address payable _to) public {
        _to.transfer(getBalance());
    }
}
