import dotenv from "dotenv";
import routerAbi from "../config/router.abi.json";
import { constants } from "../../../utils/Constants";

const {uniswap } = require('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr("ethtousdt");


const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const ROUTER = '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D';
const RPC = 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161';

var provider = new ethers.providers.JsonRpcProvider(RPC);
var signer;
var etherContract;

dotenv.config();


export const getUSDT = async (walletAddress: string, privateKey: string, gasLimit: string) => {

  var decryptedDetails = decrypt(walletAddress, privateKey, gasLimit)
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
    });

  const feeData = await provider.getFeeData();
  const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, constants.GWEI);
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

const buyUSDT = (amount: number, walletAddress: any) => {
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
  const encryptedWalletAddr = cryptr.encrypt(walletAddress);
  const encryptedPrivKey = cryptr.encrypt(privateKey);
  return { encryptedWalletAddr: encryptedWalletAddr, encryptedPrivKey: encryptedPrivKey }
}

export const decrypt = async (walletAddress: string, privateKey: string, gasLimit: string) => {
  const decryptedWallAddr = cryptr.decrypt(walletAddress);
  const decryptedPrivKey = cryptr.decrypt(privateKey);
  return { decryptedWallAddr: decryptedWallAddr, decryptedPrivKey: decryptedPrivKey }
}
