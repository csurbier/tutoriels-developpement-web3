// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract NftSubscriptionContract is Ownable, ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;
   
    uint256 private monthlyPrice = 10 ether;
    uint256 private yearlyPrice = 99 ether;
    Counters.Counter private _tokenIds;

    enum MemberType {
        MONTHLY,
        YEARLY
    }

    struct MemberCard {
        uint256 tokenId;
        uint256 expDte;
        uint256 paid;
        MemberType cardType;
        bool valid;
        address owner;
    }
    mapping(uint256 => MemberCard) public members;

    event NewMemberCard(address owner, uint256 paid);
    event MemberCardRenewed(address owner, uint256 paid);
    

    constructor() ERC721("NftSubscription", "NFTMEMBER") {}

    function mint(
        address _to,
        uint256 _paid,
        uint256 _expireDate,
        MemberType _cardType
    ) internal {
        uint256 id = _tokenIds.current();

        MemberCard memory _card;
        _card.tokenId = id;
        _card.expDte = _expireDate;
        _card.paid = _paid;
        _card.cardType = _cardType;
        _card.owner = _to;
        _card.valid = true;

        _mint(_to, id);
        members[id] = _card;
        emit NewMemberCard(_to, _paid);
        _tokenIds.increment();
    }

    function mintCard(MemberType _cardType) public payable {
        uint256 price;
        uint256 expireDate;
        if (_cardType == MemberType.MONTHLY) {
            price = monthlyPrice;
            expireDate = block.timestamp + 31 days;
        } else {
            price = yearlyPrice;
            expireDate = block.timestamp + 365 days;
        }
        require(msg.value == price, "Payment value incorrect");
        //Only one subscription/NFT per wallet 
        require(balanceOf(msg.sender)==0,"Already member please renew your subscription");
        mint(msg.sender, price, expireDate, _cardType);
    }

    // Subscription renew management
    function renewSubscription(uint256 _tokenId) external payable {
        require(_exists(_tokenId), "Membercard doesn't exists");
        
        MemberCard storage currentMember = members[_tokenId];
        //Comment the following if you want anyone to be able to renew
        // (gift,...)
        require(currentMember.owner == msg.sender, "Not your membercard");
       

        uint256 duration = 0;
        if (currentMember.cardType == MemberType.MONTHLY) {
            require(monthlyPrice == msg.value, "Payment value incorrect");
            duration = block.timestamp + 31 days; //month
        } else {
            require(yearlyPrice == msg.value, "Payment value incorrect");
            duration = block.timestamp + 365 days; //Year
        }
        currentMember.expDte = duration;
        currentMember.paid = msg.value;
        currentMember.valid = true;
        emit MemberCardRenewed(currentMember.owner, currentMember.expDte);
    }

    // Method to update prices
    function changePrice(
        MemberType _cardType,
        uint256 price
    ) external onlyOwner {
        if (_cardType == MemberType.MONTHLY) {
            monthlyPrice = price;
        } else {
            yearlyPrice = price;
        }
    }
 
    function getMemberCard() public view returns (MemberCard memory) {
        uint totalItemCount = _tokenIds.current();

        MemberCard memory currentCard;

        for (uint i = 0; i < totalItemCount; i++) {
            if (members[i].owner == msg.sender) {
                currentCard = members[i];
                if (block.timestamp >= currentCard.expDte) {
                    currentCard.valid = false;
                }
                break;
            }
        }
        return currentCard;
    }

    

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function withdraw() public onlyOwner nonReentrant {
        (bool os, ) = payable(owner()).call{value: address(this).balance}("");
        require(os);
    }

     function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        //call the original function that you wanted.
        super.safeTransferFrom(from, to, tokenId, data);

        //update
        uint256 totalItemCount = _tokenIds.current();

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (members[i].tokenId == tokenId) {
                MemberCard storage currentItem = members[i];
                currentItem.owner = payable(to);

                break;
            }
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //call the original function that you wanted.
        super.safeTransferFrom(from, to, tokenId);

        //update
        uint256 totalItemCount = _tokenIds.current();

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (members[i].tokenId == tokenId) {
                MemberCard storage currentItem = members[i];
                currentItem.owner = payable(to);

                break;
            }
        }
    }

      function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public virtual override {
        //call the original function that you wanted.
        super.transferFrom(from, to, tokenId);

        //update
        uint256 totalItemCount = _tokenIds.current();

        for (uint256 i = 0; i < totalItemCount; i++) {
            if (members[i].tokenId == tokenId) {
                MemberCard storage currentItem = members[i];
                currentItem.owner = payable(to);

                break;
            }
        }
    }
}
