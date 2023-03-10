// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract BankAccount is ReentrancyGuard {
  using Address for address payable;
  mapping(address => uint256) public balanceOf;

  function deposit() external payable  {
    balanceOf[msg.sender] += msg.value;
  }

  function withdraw() external { //nonReentrant{
    require(balanceOf[msg.sender] > 0, "Pas de fond a retirer");

    uint256 depositedAmount = balanceOf[msg.sender];
    payable(msg.sender).sendValue(depositedAmount);
    balanceOf[msg.sender] = 0;
    
  }
}
