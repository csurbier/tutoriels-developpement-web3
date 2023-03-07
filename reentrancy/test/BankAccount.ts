import { assert, expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
describe("ReentrancyAttack", function () {
    async function deployFixture() {
      const [owner, account1] = await ethers.getSigners();
      const BankAccountFactory = await ethers.getContractFactory("BankAccount");
      const bankAccountContract = await BankAccountFactory.deploy();
      return { bankAccountContract, owner, account1 };
    }
  
    describe("Deposit", function () {
      it("Should deposit 100 ETH", async function () {
        const { bankAccountContract, owner,account1 } = await loadFixture(deployFixture);
        await bankAccountContract.connect(account1).deposit({ value: ethers.utils.parseEther("150") });
        const accountBalance = await bankAccountContract.balanceOf(account1.address);
        expect(accountBalance).to.eq(ethers.utils.parseEther("150"));
      });
  
       
    });
  
    describe("Withdrawals", function () {
        it("Should revert withdraw because no deposit", async function () {
            const { bankAccountContract, owner,account1 } = await loadFixture(deployFixture);
            await expect (bankAccountContract.connect(account1).withdraw()).to.revertedWith("Pas de fond a retirer");
          });

          it("Should withdraw 100ETH", async function () {
            const { bankAccountContract, owner,account1 } = await loadFixture(deployFixture);
            await bankAccountContract.connect(account1).deposit({ value: ethers.utils.parseEther("150") });
            // Check balance du compte avant le retrait 
            let accountBalanceBefore =  await ethers.provider.getBalance(account1.address);
            // Retrait de l'argent 
            await bankAccountContract.connect(account1).withdraw()
            // Vérifie qu'il ne reste rien sur le compte bancaire 
            const accountBalanceInBank = await bankAccountContract.balanceOf(account1.address);
            expect(accountBalanceInBank).to.eq(ethers.utils.parseEther("0"));
            // Check balance du compte après le retrait 
            let accountBalanceAfter =  await ethers.provider.getBalance(account1.address);
            console.log(`===Account balance before : ${ethers.utils.formatEther(accountBalanceBefore).toString()}`);
            console.log(`===Account balance before : ${ethers.utils.formatEther(accountBalanceAfter).toString()}`);
            
            let difference = Number(accountBalanceAfter) - Number(accountBalanceBefore);
            // On s'assure que le solde du compte a bien augmenté (149 car on tient compte des frais de gaz)    
            if (difference < Number(ethers.utils.parseEther("149"))){
              assert.fail("Balance not changed");
            }
          });
    });
  
      
    
  });
   