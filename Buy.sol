// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Context.sol";

contract Counterfeit {
    function buyProduct(bytes32 _secretId) external returns (bool) {}
}

contract Buy is Context {
    event MainContractSet(address mainContractAddress);
    event OwnerChanged(address caller, address newOwner);
    event ConstructorSet(address owner);
    event ProductPurchased(address buyerAddress);

    address private owner;
    Counterfeit private C;

    constructor() {
        owner = _msgSender();
        emit ConstructorSet(owner);
    }

    modifier onlyOwner() {
        require(_msgSender() == owner, "You are not the owner");
        _;
    }

    function setMainContract(address _address) external onlyOwner {
        C = Counterfeit(_address);
        emit MainContractSet(_address);
    }

    function changeOwner(address _newOwner) external onlyOwner {
        owner = _newOwner;
        emit OwnerChanged(_msgSender(), _newOwner);
    }

    function buyProduct(uint256 _secretId) external {
        bytes32 hash = keccak256(abi.encodePacked(_secretId));
        C.buyProduct(hash);
        emit ProductPurchased(_msgSender());
    }
}
