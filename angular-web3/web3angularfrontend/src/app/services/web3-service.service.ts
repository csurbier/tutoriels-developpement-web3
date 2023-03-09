import { Injectable } from '@angular/core';
import Web3 from 'web3';
declare const window: any;
@Injectable({
  providedIn: 'root'
})
export class Web3ServiceService {
  connectedAddress: string = ""
  walletConnected: boolean = false;
  hasWallet = false
  web3: any

  constructor() {
    if (window.ethereum) {
      this.hasWallet = true
    }
    else {
      this.hasWallet = false
    }
    console.log(this.hasWallet)
  }

  async getAccount() {
    return new Promise(async resolve => {
      let address = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (address.length > 0) {
        this.connectedAddress = address[0];
        this.walletConnected = true
        this.web3 = new Web3(Web3.givenProvider)
        console.log('address', address);
        resolve(true)
      }
      else {
        console.log("===Pas d'adresse ")
        resolve(false)
      }
    })
  }

  public  checkCurrentChainId = async () => {
    return new Promise(async resolve => {
      let networkId = await this.web3.eth.net.getId()
      console.log("===CUrrent chain ",networkId)
      resolve(networkId)
    })
  }
  
}
