import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("NftSubscriptionContract", function () {
  
    async function deployFixture() {
    // Contracts are deployed using the first signer/account by default
    const [owner, account1,account2] = await ethers.getSigners();
      const NftSubscriptionContract = await ethers.getContractFactory("NftSubscriptionContract");
    const nftContract = await NftSubscriptionContract.deploy();
    return { nftContract};
  }
  
  describe("Souscription", function () {
    it("Souscription annuelle", async function () {
      const [owner, account1,account2] = await ethers.getSigners();
      const { nftContract } = await loadFixture(deployFixture);
      let price =  ethers.utils.parseEther("99");
      
      //Subscribe to a yearly membership
      await expect(nftContract.connect(account1)
      .mintCard(1,{value: price}))
      .to.emit(nftContract,'NewMemberCard')
      .withArgs(
        account1.address,
        price)

     // get the memberCard of the organizer using the members variable
     let memberCardId =0;
     let memberCard = await nftContract.members(memberCardId);
     // Should be a Yearly member card
     expect(memberCard.cardType).to.be.eq(1);
     expect(memberCard.paid).to.eq(price)
     expect(memberCard.valid).to.eq(true);

     //check expiration date 
     let timeStamp = (await ethers.provider.getBlock("latest")).timestamp
     // expiration date should be greater than 11 month in future
     timeStamp+= 11*(31*86400);
     expect(memberCard.expDte).to.be.greaterThan(timeStamp)
      
     // get the memberCard  using the getMemberCard function
     memberCard = await nftContract.connect(account1).getMemberCard()
     // Should be a Yearly member card
     expect(memberCard.cardType).to.be.eq(1);
     expect(memberCard.paid).to.eq(price)
     expect(memberCard.valid).to.eq(true);
     timeStamp = (await ethers.provider.getBlock("latest")).timestamp
     // expiration date should be greater than 11 month in future
     timeStamp+= 11*(31*86400);
     expect(memberCard.expDte).to.be.greaterThan(timeStamp)
    });
    
    it("Souscription mensuelle et check expire apres 1 mois", async function () {
      const [owner, account1,account2] = await ethers.getSigners();
      const { nftContract } = await loadFixture(deployFixture);
      let price =  ethers.utils.parseEther("10");
      //We need to set our nftTicket smart contract owner of the factory 
    
      await expect(nftContract.connect(account1)
      .mintCard(0,{value: price}))
      .to.emit(nftContract,'NewMemberCard')
      .withArgs(
        account1.address,
        price)

    // get the memberCard of the organizer using the getMemberCard function
     let memberCard = await nftContract.connect(account1).getMemberCard()
     // Should be a Monthly member card
     expect(memberCard.cardType).to.be.eq(0);
     expect(memberCard.valid).to.eq(true);
     let timeStamp = (await ethers.provider.getBlock("latest")).timestamp
   
     // let's go 10 days   in the future
    timeStamp+= 10*86400;
    await time.increaseTo(timeStamp);
    // get member card again and check still true
    memberCard = await nftContract.connect(account1).getMemberCard()
    expect(memberCard.valid).to.eq(true);
   
    // let's go 1 month and 1 day in the future
    timeStamp+= 1*(32*86400);
    await time.increaseTo(timeStamp);
    // get member card again 
    memberCard = await nftContract.connect(account1).getMemberCard()
    expect(memberCard.valid).to.eq(false);
   });

    it("Check souscription inexistante", async function () {
        const [owner, account1,account2] = await ethers.getSigners();
        const { nftContract } = await loadFixture(deployFixture);
        
      // get the memberCard of the organizer using the getMemberCard function
       let memberCard = await nftContract.connect(account2).getMemberCard()
     
       // Should be a Monthly member card
       expect(memberCard.valid).to.eq(false);
    });

    it("Pas plus d'une souscription pour un utilisateur", async function () {
        const [owner, account1,account2] = await ethers.getSigners();
        const { nftContract } = await loadFixture(deployFixture);
        
        let price =  ethers.utils.parseEther("10");
        
        await expect(nftContract.connect(account1)
          .mintCard(0,{value: price}))
          .to.emit(nftContract,'NewMemberCard')
          .withArgs(
              account1.address,
              price)
      
        await expect(nftContract.connect(account1)
           .mintCard(0,{value: price})).to.revertedWith("Already member please renew your subscription")
      
    });
    
    it("Souscription mensuelle et renouvellement", async function () {
      const [owner, account1,account2] = await ethers.getSigners();
      const { nftContract } = await loadFixture(deployFixture);
      
      let price =  ethers.utils.parseEther("10");
      
      await expect(nftContract.connect(account1)
        .mintCard(0,{value: price}))
        .to.emit(nftContract,'NewMemberCard')
        .withArgs(
            account1.address,
            price)
    
     // let's go 1 month and 1 day in the future
        
     let timeStamp = (await ethers.provider.getBlock("latest")).timestamp
     timeStamp+= 1*(32*86400);
     await time.increaseTo(timeStamp);
     // get member card again 
     let memberCard = await nftContract.connect(account1).getMemberCard()
     expect(memberCard.valid).to.eq(false);
     // try to renew
     await expect(nftContract.connect(account1)
        .renewSubscription(0,{value: price}))
        .to.emit(nftContract,'MemberCardRenewed')
     
    memberCard = await nftContract.connect(account1).getMemberCard()
     expect(memberCard.valid).to.eq(true);
     // check 4 days later
     timeStamp+= 4*86400;
     await time.increaseTo(timeStamp);
     memberCard = await nftContract.connect(account1).getMemberCard()
     expect(memberCard.valid).to.eq(true);
     // check failed again 1 month and 1 day in the future
     timeStamp+= 1*(32*86400);
     await time.increaseTo(timeStamp);
     memberCard = await nftContract.connect(account1).getMemberCard()
     expect(memberCard.valid).to.eq(false);
    });
 
    it("Souscription paiement KO", async function () {
      const [owner, account1,account2] = await ethers.getSigners();
      const { nftContract } = await loadFixture(deployFixture);
      
      let price =  ethers.utils.parseEther("8");
      
      await expect(nftContract.connect(account1)
        .mintCard(0,{value: price})).to.revertedWith("Payment value incorrect")

      await expect(nftContract.connect(account1)
        .mintCard(1,{value: price})).to.revertedWith("Payment value incorrect")

      
    });

    it("Souscription changement de prix", async function () {
        const [owner, account1,account2] = await ethers.getSigners();
        const { nftContract } = await loadFixture(deployFixture);
        
        let price =  ethers.utils.parseEther("10");
        
        await expect(nftContract.connect(account1)
          .mintCard(0,{value: price}))
          .to.emit(nftContract,'NewMemberCard')
          .withArgs(
              account1.address,
              price)
  
        let newPrice =  ethers.utils.parseEther("4");
        await nftContract.changePrice(0,newPrice);

        await expect(nftContract.connect(account2)
        .mintCard(0,{value: price})).to.revertedWith("Payment value incorrect")
        

        await expect(nftContract.connect(owner)
            .mintCard(0,{value: newPrice})) 
            .to.emit(nftContract,'NewMemberCard')
            .withArgs(
                owner.address,
                newPrice)
      });

      it("Transfert d'un NFT/abonnement ", async function () {
        const [owner, account1,account2] = await ethers.getSigners();
        const { nftContract } = await loadFixture(deployFixture);
        
        let price =  ethers.utils.parseEther("10");
        
        await expect(nftContract.connect(account1)
          .mintCard(0,{value: price}))
          .to.emit(nftContract,'NewMemberCard')
          .withArgs(
              account1.address,
              price)
        
        let memberCardAccount1 = await nftContract.connect(account1).getMemberCard()
        expect(memberCardAccount1.valid).to.eq(true);
     
        // Transfert NFT to account2
        
        nftContract.connect(account1).transferFrom(account1.address, account2.address, 0);
        // Check account1 is not a member
        memberCardAccount1 = await nftContract.connect(account1).getMemberCard()
        expect(memberCardAccount1.valid).to.eq(false);
        // Check account2 is a member 
        let memberCardAccount2 = await nftContract.connect(account2).getMemberCard()
        expect(memberCardAccount2.valid).to.eq(true);
            
        
      });
  
    
      
  });
 
});
