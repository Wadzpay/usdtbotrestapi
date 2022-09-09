import request from "request-promise";
import dotenv from "dotenv";
import routerAbi from "../config/router.abi.json";
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require ('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPT_KEY);


const WETH = process.env.WETH;
const USDT = process.env.USDT;
const ROUTER = process.env.ROUTER;
const RPC = process.env.RPC;




//var provider = new ethers.providers.JsonRpcProvider(RPC);
//var signer;
//var etherContract;

dotenv.config();


export const forTestingCompleteJob = async (walletAddress: string, privateKey: string, gasLimit: string) => {
    try{
        var decryptedDetails = decrypt(walletAddress,privateKey,gasLimit)
        walletAddress = (await decryptedDetails).decryptedWallAddr;
        privateKey = (await decryptedDetails).decryptedPrivKey;
        
        console.log('------------start---------------')
        var provider = new ethers.providers.JsonRpcProvider(RPC);
        
        console.log('privateKey', privateKey);
        console.log('walletAddress', walletAddress);
        console.log('gasLimit', gasLimit);
        var signer = new ethers.Wallet(privateKey, provider);
        const etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
        var tx;
      
        var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
        console.log('current balance of the wallet -> ' + balance)
        let buy_amt = balance - parseInt(gasLimit);
        console.log('buy amt for estimate gas -> ', buy_amt)
        return buy_amt;
    }catch(e:any){        
        throw e.reason;
    }
}

export const getUSDT = async (walletAddress: string, privateKey: string, ethAmt: string) => {

    try{
     console.log('Wallet Address-->', walletAddress);
     console.log('ETH to be converted-->', ethAmt); 
   
     console.log('<---Start - Decryption Process--->')
     var decryptedDetails = decrypt(walletAddress,privateKey,ethAmt)
     walletAddress = (await decryptedDetails).decryptedWallAddr;
     privateKey = (await decryptedDetails).decryptedPrivKey;
     console.log('<---End - Decryption Process--->')
     
     console.log('<---Start - Signer & Contract Process--->')
     var provider = new ethers.providers.JsonRpcProvider(RPC);
     //console.log('privateKey', privateKey);
     //console.log('gasLimit', gasLimit);
     var signer = new ethers.Wallet(privateKey, provider);
     //uniswap = new ethers.Contract(ROUTER, routerAbi, signer);
     const etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
     console.log('<---End - Signer & Contract Process--->')
     var tx;
   
     console.log('<---Checking Current Balance.....')
     var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
     console.log('balance-->' + balance)
     
       /* Modified below logic based on inputs from Venkata --> Start */
       /*
        *  balance --> balance in wallet address
        *  ethAmt  --> amount entered by user in %
        *  transactionFeeETHAmt --> transaction fees to deducted from balance
        */
       var transactionFeeETHAmt = balance*(parseFloat(ethAmt)/100);
       
       //  exchange_amt --> ETH amount to be coverted to USDT
       var exchange_amt = balance - transactionFeeETHAmt;
       console.log('Real buy amt...', exchange_amt);
       /* Modified below logic based on inputs from Venkata --> End */
   
       console.log('<---Checking logic for sufficient funds for ETH to USDT conversion...')
       
        if (exchange_amt > 0) {
        console.log('<---If loop...to convert ' + exchange_amt + ' ETH to USDT')
         //tx = buyUSDT(buy_amt, walletAddress,etherContract);
         var tx = new etherContract.swapExactETHForTokens(
            0,
            [WETH, USDT],
            walletAddress,
            "99000000000000000",
            {
                value: ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18)
            }
        )
         console.log('tx-->',tx);
         return tx;
       }else{
           console.log('<--Else...Throws error due to in-sufficient funds..');        
          //throw new Error('Conversion Failed Due to Insufficient Balance.');
          return "Conversion Failed Due to Insufficient Balance.";
       }
       }catch(err:any){   
           console.log('<--Else...Throws error...since something went wrong');
           return err;
       }
       
       };
   
   const buyUSDT = (amount:number, walletAddress:any, etherContract:any) => {
               console.log('<-- Entered buyUSDT---conversion logic -->');
               try {
                   var tx = new etherContract.swapExactETHForTokens(
                       0,
                       [WETH, USDT],
                       walletAddress,
                       "99000000000000000",
                       {
                           value: ethers.utils.parseUnits(amount.toFixed(8).toString(), 18)
                       }
                   )
                   return tx;
               }
               catch(e:any){
                   console.log('<--- In catch...Something went wrong in...buyUSDT');
                   throw new Error(e.code+'-'+e.reason);
               }
              
           }

  export const encrpyt = async (walletAddress: string, privateKey: string, gasLimit: string) => {
      const encryptedWalletAddr = cryptr.encrypt(walletAddress);
      const encryptedPrivKey = cryptr.encrypt(privateKey);
      return {encryptedWalletAddr:encryptedWalletAddr,encryptedPrivKey:encryptedPrivKey}      
  }

  export const decrypt = async (walletAddress: string, privateKey: string, gasLimit: string) => {
      const decryptedWallAddr = cryptr.decrypt(walletAddress);
      const decryptedPrivKey = cryptr.decrypt(privateKey);
      return {decryptedWallAddr:decryptedWallAddr,decryptedPrivKey:decryptedPrivKey}
  }
