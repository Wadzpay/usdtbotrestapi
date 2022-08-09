import request from "request-promise";
import dotenv from "dotenv";
import routerAbi from "../config/router.abi.json";
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require ('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr("ethtousdt");
//const ethers = require('ethers');
//const uniswap = require('uniswapuniswap/v2-core');
//import {uniswap} from "uniswap";

var isRunning = false;

const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const RPC = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
//const RPC = 'https://goerli.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';
//const RPC = 'https://quiet-cool-water.ethereum-goerli.discover.quiknode.pro/da89a0bd3c28068d4b4f81f5690042f03cc62eab/'
var walletId = '625932042fb50700077b648edc0de39c';
var accessToken = 'v2xb129f1dbe8b1ff2f3c11c967f89012b22e1f6b68a80bdd8638019f9c50e54b0f';


var provider = new ethers.providers.JsonRpcProvider(RPC);
var signer;
//let uniswap;
var buy_amt;
var etherContract;

dotenv.config();


export const getUSDT = async (walletAddress: string, privateKey: string, gasLimit: string) => {
  //const key = process.env.OPEN_CAGE_DATA_KEY;
  //const url = `https://api.opencagedata.com/geocode/v1/geojson?q=${query}&key=${key}&limit=20&no_annotations=1`;
  //const response = await request(url);

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
  const gasLimitVal = await etherContract.swapExactETHForTokens(
    0,
    [WETH, USDT],
    walletAddress,
    "99000000000000000",
    {
        value: ethers.utils.parseUnits(buy_amt.toFixed(8).toString(), 18)
        // value: ethers.utils.parseUnits("0.02", 18)
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
    }

  return JSON.parse(tx);
};

const buyUSDT = (amount:number, walletAddress:any) => {
            try {
                var tx = new uniswap.swapExactETHForTokens(
                    0,
                    [WETH, USDT],
                    walletAddress.current.value,
                    "99000000000000000",
                    {
                        // value: ethers.utils.parseUnits("0.02", 18)
                        value: ethers.utils.parseUnits(amount.toFixed(8).toString(), 18)
                    }
                )
                console.log('tx', tx)
            }
            catch (e) {
                console.log('exception when call buy function -> ', e)
                // setLog(e + '');
            }
            return tx;
        }

  export const encrpyt = async (walletAddress: string, privateKey: string, gasLimit: string) => {
    /*const textToChars = (walletAddress:any) => walletAddress.split("").map((c:any) => c.charCodeAt(0));
    const byteHex = (n:any) => ("0" + Number(n).toString(16)).substr(-2);
    const applySaltToChar = (code:any) => textToChars(process.env.encrypt_key).reduce((a:any, b:any) => a ^ b, code);

    return walletAddress
      .split("")
      .map(textToChars)
      .map(applySaltToChar)
      .map(byteHex)
      .join("");*/
      const encryptedWalletAddr = cryptr.encrypt(walletAddress);
      const encryptedPrivKey = cryptr.encrypt(privateKey);
      return {encryptedWalletAddr:encryptedWalletAddr,encryptedPrivKey:encryptedPrivKey}      
  }

  export const decrypt = async (walletAddress: string, privateKey: string, gasLimit: string) => {
    /*const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
    const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
    return encoded
      .match(/.{1,2}/g)
      .map((hex) => parseInt(hex, 16))
      .map(applySaltToChar)
      .map((charCode) => String.fromCharCode(charCode))
      .join("");*/
      const decryptedWallAddr = cryptr.decrypt(walletAddress);
      const decryptedPrivKey = cryptr.decrypt(privateKey);
      return {decryptedWallAddr:decryptedWallAddr,decryptedPrivKey:decryptedPrivKey}
  }
