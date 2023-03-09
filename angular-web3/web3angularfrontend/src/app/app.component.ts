import { Component } from '@angular/core';
import { Web3ServiceService } from './services/web3-service.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'web3angularfrontend';
 

  constructor(private web3Service:Web3ServiceService){
  
  }
 
  async connectWallet(){
    this.web3Service.getAccount().then((connecte)=>{
      if (connecte){
        console.log("Connecte avec adresse ",this.web3Service.connectedAddress)
        this.web3Service.checkCurrentChainId().then((chainId)=>{
          console.log("Chainid ",chainId)
        })
      }
    })
  }
  
}
