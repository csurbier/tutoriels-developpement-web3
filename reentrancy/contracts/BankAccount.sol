// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Address.sol";
contract BankAccount {
  using Address for address payable;
  mapping(address => uint256) public balanceOf;

  function deposit() external payable  {
    balanceOf[msg.sender] += msg.value;
  }

  function withdraw() external {
    require(balanceOf[msg.sender] > 0, "Pas de fond a retirer");

    uint256 depositedAmount = balanceOf[msg.sender];
 
    payable(msg.sender).sendValue(depositedAmount);

    balanceOf[msg.sender] = 0;
  }
}
