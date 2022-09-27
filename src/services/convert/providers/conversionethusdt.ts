import { decrypt, encrpyt, forTestingCompleteJob, getUSDT } from "./ethusdtdataprovider";
import dotenv from "dotenv";
dotenv.config();

var logger = require('../logger/awscloudwatchlogger');

export var getUSDTFromETH = async (reqBody:any) => {

  logger.log('info', `Requesting to convert ${reqBody.gasLimit}`, {tags: 'conversionethusdt.getUSDTFromETH'});  

    return await getUSDT(reqBody);
  
}
export const encrpytWalletDetails = async (reqBody:any) => {

  logger.log('info', `Encrypting provided Wallet Details`, {tags: 'conversionethusdt.encrpytWalletDetails'});
 
  return await encrpyt(reqBody);
}
export const decrpytWalletDetails = async (reqBody:any) => {

  logger.log('info', `Decrypting provided Wallet Details`, {tags: 'conversionethusdt.decrpytWalletDetails'});
 
  return await decrypt(reqBody);
}


