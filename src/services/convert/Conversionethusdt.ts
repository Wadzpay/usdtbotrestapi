import { decrypt, encrpyt, getUSDT } from "./providers/ethusdtdataprovider";

export const getUSDTFromETH = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await getUSDT(walletAddress, privateKey, gasLimit);
}
export const encrpytWalletDetails = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await encrpyt(walletAddress, privateKey, gasLimit);
}
export const decrpytWalletDetails = async (walletAddress: any, privateKey: any, gasLimit: any) => {
 
  return await decrypt(walletAddress, privateKey, gasLimit);
}
