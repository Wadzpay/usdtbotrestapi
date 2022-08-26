import { decrypt, encrpyt, forTestingCompleteJob, getUSDT } from "./providers/ethusdtdataprovider";

export const getUSDTFromETH = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await getUSDT(walletAddress, privateKey, gasLimit);
  //return await forTestingCompleteJob(walletAddress, privateKey, gasLimit);
}
export const encrpytWalletDetails = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await encrpyt(walletAddress, privateKey, gasLimit);
}
export const decrpytWalletDetails = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await decrypt(walletAddress, privateKey, gasLimit);
}
