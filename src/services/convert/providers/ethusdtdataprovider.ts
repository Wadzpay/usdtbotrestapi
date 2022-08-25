import request from "request-promise";
import dotenv from "dotenv";
import routerAbi from "../config/router.abi.json";
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require ('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr("ethtousdt");


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

export const getUSDT = async (walletAddress: string, privateKey: string, gasLimit: string) => {

 try{
  var decryptedDetails = decrypt(walletAddress,privateKey,gasLimit)
  walletAddress = (await decryptedDetails).decryptedWallAddr;
  privateKey = (await decryptedDetails).decryptedPrivKey;
  
  console.log('------------start---------------')
  //console.log('privateKey', privateKey);
  console.log('walletAddress', walletAddress);
  console.log('gasLimit', gasLimit);
  signer = new ethers.Wallet(privateKey, provider);
  etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
  var tx;

  var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
  console.log('current balance of the wallet -> ' + balance)
  let buy_amt = balance - parseInt(gasLimit);
  console.log('buy amt for estimate gas -> ', buy_amt)
  const gasLimitVal = await etherContract.swapExactETHForTokens(
    0,
    [WETH, USDT],
    walletAddress,
    "99000000000000000",
    {
        value: ethers.utils.parseUnits(buy_amt.toFixed(8).toString(), 18)
    });

    const feeData = await provider.getFeeData();
    const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, "gwei");
    console.log('current gas price -> ', gasPrice)
    console.log('current gas limit -> ', parseInt(gasLimitVal, 10));
    const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005;
    console.log('current gas fee -> ', gasFee);
    buy_amt = balance - (gasFee > parseInt(gasLimit) ? gasFee : parseInt(gasLimit));
    console.log('real buy amt -> ', buy_amt)
    if (parseInt(gasLimit) >= 0.001 && buy_amt > 0) {
      console.log('execute buy usdt with ' + buy_amt + ' eth')
      tx = buyUSDT(buy_amt, walletAddress);
      return tx;
    }
    }catch(e:any){   
        //return(e.code,'---',e.reason);    
        throw e.code+'-'+e.reason;
    }
    
    };

const buyUSDT = (amount:number, walletAddress:any) => {
            try {
                var tx = new uniswap.swapExactETHForTokens(
                    0,
                    [WETH, USDT],
                    walletAddress.current.value,
                    "99000000000000000",
                    {
                        value: ethers.utils.parseUnits(amount.toFixed(8).toString(), 18)
                    }
                )
                return tx;
            }
            catch(e:any){
                throw e.reason;
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
