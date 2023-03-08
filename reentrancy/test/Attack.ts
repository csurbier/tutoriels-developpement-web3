import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
describe("ReentrancyAttack", function () {
    async function deployFixture() {
      const [owner, attacker, account1,account2,account3] = await ethers.getSigners();
      const BankAccountFactory = await ethers.getContractFactory("BankAccount",owner);
      const bankAccountContract = await BankAccountFactory.deploy();

      const attackFactory = await ethers.getContractFactory("Attack",attacker);
      const attackContract = await attackFactory.deploy(bankAccountContract.address);
      return { bankAccountContract, attackContract,owner, attacker,account1,account2,account3};
    }
  
   
      
    describe("Attack", function () {
      it("Should drains all ETH from bank contract", async function () {
        const { bankAccountContract,attackContract, owner,attacker,account1,account2,account3 } = await loadFixture(deployFixture);
        // Deposit to bank from different accounts
        await bankAccountContract.connect(account1).deposit({ value: ethers.utils.parseEther("500") });
        await bankAccountContract.connect(account2).deposit({ value: ethers.utils.parseEther("500") });
        await bankAccountContract.connect(account3).deposit({ value: ethers.utils.parseEther("500") });
        // check balance before attack 
        let accountBalanceBeforeAttack =  await ethers.provider.getBalance(attacker.address);
        console.log(`BankAccount before : ${ethers.utils.formatEther(await ethers.provider.getBalance(bankAccountContract.address)).toString()}`);
        console.log(`===Attacker balance before : ${ethers.utils.formatEther(accountBalanceBeforeAttack).toString()}`);
       
        await attackContract.attack({ value: ethers.utils.parseEther("500") })
       
        // check balance after attack
        let accountBalanceAfterAttack =  await ethers.provider.getBalance(attacker.address);
        let bankBalanceAfter = await ethers.provider.getBalance(bankAccountContract.address)
        console.log(`BankAccount after : ${ethers.utils.formatEther(bankBalanceAfter).toString()}`);
        console.log(`===Attacker balance after : ${ethers.utils.formatEther(accountBalanceAfterAttack).toString()}`);
        expect(bankBalanceAfter).to.eq(ethers.utils.parseEther("0"));
      });
  
       
    });
    
  });
   