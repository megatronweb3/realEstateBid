import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Web3Service } from '../util/web3.service';

declare let require: any;
const contract_artifacts = require('../../../build/contracts/RealEstateBid.json');


export interface UserType {
  value: string;
  viewValue: string;
}


@Component({
  selector: 'app-bid',
  templateUrl: './bid.component.html',
  styleUrls: ['./bid.component.css']
})
export class BidComponent implements OnInit {

  RealEstateBidContract: any;
  account: string;
  realEstateAddress: any;
  beneficaryAddress: any;
  winnerAddress: any;
  winningBid: any;
  minBid: any;

  @ViewChild('bidAmount', { static: false }) bidAmountRef: ElementRef;
  @ViewChild('depositAmount', { static: false }) depositAmountRef: ElementRef;
  @ViewChild('secret', { static: false }) secretRef: ElementRef;

  userTypes: UserType[] = [
    { value: "manager", viewValue: "Bid Manager" },
    { value: "bidder", viewValue: "Bidder" }
  ]

  constructor(private web3Service: Web3Service) { }

  ngOnInit() {

    this.loadAccount();
    this.loadContract();

  }

  async initializeData() {

    const deployedContract = await this.RealEstateBidContract.deployed();

    this.beneficaryAddress = await deployedContract.getBeneficaryAddress.call();
    this.realEstateAddress = await deployedContract.getRealEstateAddress.call();
    this.minBid = await deployedContract.getMinBid.call();

  }


  loadContract(): void {

    this.web3Service.artifactsToContract(contract_artifacts)
      .then((RealEstateBidAbstraction) => {
        this.RealEstateBidContract = RealEstateBidAbstraction;
        console.log("Contract loaded!");
        console.log(this.RealEstateBidContract);
        this.initializeData();
      });

  }

  /**
   * 
   * @param bidAmount 
   * @param depositAmount 
   * @param secret 
   */
  async bid(bidAmount: HTMLInputElement, depositAmount: HTMLInputElement, secret: HTMLInputElement) {

    console.log(bidAmount.value, depositAmount.value, secret.value);

    const depositWei = this.web3Service.toWei(depositAmount.value);
    const deployedContract = await this.RealEstateBidContract.deployed();
    const blindedBid = this.web3Service.obfuscateBid(bidAmount.value, secret.value);
    const transaction = await deployedContract.bid.sendTransaction(blindedBid, { from: this.account, value: depositWei, gas: 3000000 });

    console.log("transaction", transaction);

  }

  /**
   * Reveal/umask your bid
   * @param bidAmount 
   * @param secret 
   */
  async reveal(bidAmount: HTMLInputElement, secret: HTMLInputElement) {
    console.log(bidAmount.value, secret.value);

    const deployedContract = await this.RealEstateBidContract.deployed();
    const transaction = await deployedContract.reveal.sendTransaction(bidAmount.value, secret.value, { from: this.account, gas: 3000000 });

    console.log("transaction", transaction);


  }

  /**
   * End auction
   */
  async endAuction() {

    const deployedContract = await this.RealEstateBidContract.deployed();
    deployedContract.AuctionEnded().on('data', event => console.log(event));
    const event = await deployedContract.auctionEnd.sendTransaction({ from: this.account, gas: 3000000 });
    console.log("Winner:", event.logs[0].args.winner);

  }

  /**
   * End bidding phase, no more bidding will be allowed after this
   */
  async endBid() {

    const deployedContract = await this.RealEstateBidContract.deployed();
    const event = await deployedContract.bidEnd.sendTransaction({ from: this.account, gas: 3000000 });

  }

  /**
   * Get winner details
   */
  async getWinner() {

    const deployedContract = await this.RealEstateBidContract.deployed();
    const transaction = await deployedContract.highestBid.call();

    this.winnerAddress = transaction.bidderAddress;
    this.winningBid = transaction.bid;
    console.log("transaction", transaction.bidderAddress);
  }


/**
 * Perform actions on account load, switch
 */
  loadAccount() {
    console.log("load account");
    this.web3Service.accountsObservable.subscribe((accounts) => {
      
      this.account = accounts[0];
      console.log("current account:" + this.account);

      if(this.bidAmountRef){
        this.bidAmountRef.nativeElement.value ="";
      }

      if(this.depositAmountRef){
        this.depositAmountRef.nativeElement.value ="";
      }

      if(this.secretRef){
        this.secretRef.nativeElement.value ="";
      }
  

    });
  }


  updateUser(): void {

 
}


}
