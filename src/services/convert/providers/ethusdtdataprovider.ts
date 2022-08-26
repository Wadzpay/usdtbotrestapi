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



var provider = new ethers.providers.JsonRpcProvider(RPC);
var signer;
var etherContract;

dotenv.config();


export const forTestingCompleteJob = async (walletAddress: string, privateKey: string, gasLimit: string) => {
    try{
        var decryptedDetails = decrypt(walletAddress,privateKey,gasLimit)
        walletAddress = (await decryptedDetails).decryptedWallAddr;
        privateKey = (await decryptedDetails).decryptedPrivKey;
        
        console.log('------------start---------------')
        console.log('privateKey', privateKey);
        console.log('walletAddress', walletAddress);
        console.log('gasLimit', gasLimit);
        signer = new ethers.Wallet(privateKey, provider);
        etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
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
     //console.log('privateKey', privateKey);
     //console.log('gasLimit', gasLimit);
     signer = new ethers.Wallet(privateKey, provider);
     //uniswap = new ethers.Contract(ROUTER, routerAbi, signer);
     etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
     console.log('<---End - Signer & Contract Process--->')
     var tx;
   
     console.log('<---Checking Current Balance.....')
     var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
     console.log('balance-->' + balance)
     //console.log('eth amount-->', parseFloat(ethAmt)); 
     console.log('<---Checking Buy Amount...(balance - eth amount)')
     let buy_amt = balance - parseFloat(ethAmt);
     console.log('buy amt -> ', buy_amt)
     console.log('<---Checking Gas Limit...')
     const gasLimitVal = await etherContract.estimateGas.swapExactETHForTokens(  
     //const gasLimitVal = await etherContract.swapExactETHForTokens(
       0,
       [WETH, USDT],
       walletAddress,
       "99000000000000000",
       {
           value: ethers.utils.parseUnits(buy_amt.toFixed(8).toString(), 18)
       });
       console.log('Gas Limit-->',gasLimitVal);
   
       console.log('<---Checking Fee Data...')
       const feeData = await provider.getFeeData();
       console.log('Fee Data-->',feeData);
   
       console.log('<---Checking Gas Price...')
       const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, "gwei");
       console.log('Gas Price-->',gasPrice);
       
       console.log('<---Checking Gas Fee...')
       const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005;
       console.log('Gas Fee...',gasFee);
   
       console.log('<---Checking Real Buy Amount...')    
       buy_amt = balance - (gasFee > parseFloat(ethAmt) ? gasFee : parseInt(ethAmt));
       console.log('Real buy amt...', buy_amt);
   
       console.log('<---Checking logic for sufficient funds(eth>=0.001 && buy_amt>0) for ETH to USDT conversion...')
       if (parseFloat(ethAmt) >= 0.001 && buy_amt > 0) {
         console.log('<---If loop...to convert ' + buy_amt + ' ETH to USDT')
         tx = buyUSDT(buy_amt, walletAddress,etherContract);
         return tx;
       }else{
           console.log('<--Else...Throws error due to in-sufficient funds..');        
          //throw new Error('Conversion Failed Due to Insufficient Balance.');
          return "Conversion Failed Due to Insufficient Balance.";
       }
       }catch(e:any){   
           console.log('<--Else...Throws error...since something went wrong');
           throw new Error(e.code+'-'+e.reason);
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
