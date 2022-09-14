import { decrypt, encrpyt, forTestingCompleteJob, getUSDT } from "../convert/providers/ethusdtdataprovider";
import dotenv from "dotenv";
dotenv.config();

var logger = require('../convert/logger/aws_cloudwatch_logger');

export const getUSDTFromETH = async (reqBody:any) => {

  logger.log('info', `Requesting for ${reqBody.wallAddr} to convert ${reqBody.gasLimit}`, {tags: 'conversionethusdt.getUSDTFromETH'});  

  var CONVERSION_LOGIC = process.env.CONVERSION_LOGIC || 'YES';
  
  logger.log('info', `Checking for CONVERSION_LOGIC env variable`, {tags: 'conversionethusdt.getUSDTFromETH', additionalInfo: {CONVERSION_LOGIC: CONVERSION_LOGIC}});
  if(CONVERSION_LOGIC==='YES')
    return await getUSDT(reqBody);
  else
    return await forTestingCompleteJob(reqBody);
}
export const encrpytWalletDetails = async (reqBody:any) => {

  logger.log('info', `Encrypting provided Wallet Details`, {tags: 'conversionethusdt.encrpytWalletDetails'});
 
  return await encrpyt(reqBody);
}
export const decrpytWalletDetails = async (reqBody:any) => {

  logger.log('info', `Decrypting provided Wallet Details`, {tags: 'conversionethusdt.decrpytWalletDetails'});
 
  return await decrypt(reqBody);
}

export const AWSConfig = {
  apiVersion: process.env.APIVersion,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  accessSecretKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  //AWS_SDK_LOAD_CONFIG:1,
  //AWS_SSO_INTERACTIVE_AUTH:true
}
