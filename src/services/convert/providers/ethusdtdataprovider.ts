import request from "request-promise";
import dotenv from "dotenv";
import routerAbi from "../config/router.abi.json";
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPT_KEY);


const WETH = process.env.WETH;
const USDT = process.env.USDT;
const ROUTER = process.env.ROUTER;
const RPC = process.env.RPC;


var logger = require('../logger/aws_cloudwatch_logger');

//var provider = new ethers.providers.JsonRpcProvider(RPC);
//var signer;
//var etherContract;

dotenv.config();



export const forTestingCompleteJob = async (reqBody:any) => {
    try {

        var walletAddress = reqBody.wallAddr;
        var privateKey = reqBody.privKey;
        var ethAmt = reqBody.gasLimit;

        logger.log('info', `Inside forTestingCompleteJob`, { tags: 'input', additionalInfo: { body: walletAddress } });
        console.log('Wallet Address-->', walletAddress);
        console.log('ETH to be converted-->', ethAmt);

        var decryptedDetails = decrypt(reqBody)
        walletAddress = (await decryptedDetails).decryptedWallAddr;
        privateKey = (await decryptedDetails).decryptedPrivKey;

        console.log('------------start---------------')
        console.log('privateKey', privateKey);
        console.log('walletAddress', walletAddress);
        console.log('gasLimit', ethAmt);
        var provider = new ethers.providers.JsonRpcProvider(RPC);
        var signer = new ethers.Wallet(privateKey, provider);
        var etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
        var tx;

        var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
        console.log('current balance of the wallet -> ' + balance)
        let buy_amt = balance - parseFloat(ethAmt);
        console.log('buy amt for estimate gas -> ', buy_amt)
        const gasLimitVal = await etherContract.estimateGas.swapExactETHForTokens(
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
        console.log('current gas limit -> ', parseFloat(gasLimitVal));
        const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005;
        console.log('current gas fee -> ', gasFee);
        buy_amt = balance - (gasFee > parseFloat(ethAmt) ? gasFee : parseFloat(ethAmt));
        console.log('real buy amt -> ', buy_amt)
        if (parseFloat(ethAmt) >= 0.001 && buy_amt > 0) {
            var tx = new etherContract.swapExactETHForTokens(
                0,
                [WETH, USDT],
                walletAddress,
                "99000000000000000",
                {
                    value: ethers.utils.parseUnits(buy_amt.toFixed(8).toString(), 18)
                }
            )
            //console.log('tx-->', tx);
            logger.log('info', `Inside forTestingCompleteJob`, { tags: 'tx', additionalInfo: { tx: tx } });
            return tx;

        } else {
            console.log('<--Else...Throws error due to in-sufficient funds..');
            //throw new Error('Conversion Failed Due to Insufficient Balance.');
            return "Conversion Failed Due to Insufficient Balance.";
        }
        
    } catch (err: any) {
        console.log('<--Else...Throws error...since something went wrong');
        return err;
    }
}

export const getUSDT = async (reqBody:any) => {

    logger.log('info', `Conversion Logic start.....`, {tags: 'ethusdtdataprovider.getUSDT'});
    try {
        var walletAddress = reqBody.wallAddr;
        var privateKey = reqBody.privKey;
        var ethAmt = reqBody.gasLimit;
        //logger.log('info', `Inside getUSDT`);
        //console.log('Wallet Address-->', walletAddress);
        logger.log('info',`Wallet Address...`,{ tags: 'ethusdtdataprovider.getUSDT', additionalInfo: { body: walletAddress } })
        //console.log('ETH to be converted-->', ethAmt);
        logger.log('info',`ETH to be converted...`,{ tags: 'ethusdtdataprovider.getUSDT', additionalInfo: { body: ethAmt } })

        logger.log('info','<---Start - Decryption Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var decryptedDetails = decrypt(reqBody)
        walletAddress = (await decryptedDetails).decryptedWallAddr;
        privateKey = (await decryptedDetails).decryptedPrivKey;
        logger.log('info','<---End - Decryption Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})

        logger.log('info','<---Start - Signer & Contract Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var provider = new ethers.providers.JsonRpcProvider(RPC);
        //console.log('privateKey', privateKey);
        //console.log('gasLimit', gasLimit);
        var signer = new ethers.Wallet(privateKey, provider);
        //uniswap = new ethers.Contract(ROUTER, routerAbi, signer);
        const etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
        logger.log('info','<---End - Signer & Contract Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var tx;

        logger.log('info','<---Checking Current Balance--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        
        var balance = ethers.utils.formatEther(await provider.getBalance(walletAddress))
        logger.log('info','balance.....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{balance: balance}})

        /* Modified below logic based on inputs from Venkata --> Start */
        /*
         *  balance --> balance in wallet address
         *  ethAmt  --> amount entered by user in %
         *  transactionFeeETHAmt --> transaction fees to deducted from balance
         */
        var transactionFeeETHAmt = balance * (parseFloat(ethAmt) / 100);
        logger.log('info','balance*(ethAmt/100).....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{transactionFeeETHAmt: transactionFeeETHAmt}})
        
        //  exchange_amt --> ETH amount to be coverted to USDT
        var exchange_amt = balance - transactionFeeETHAmt;
        logger.log('info','balance-transactionFeeETHAmt.....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{exchange_amt: exchange_amt}})
        /* Modified below logic based on inputs from Venkata --> End */

        /* added based on discussion with Abhinav -- start */

        //let buy_amt = balance - parseFloat(ethAmt);
        //console.log('buy amt for estimate gas -> ', exchange_amt)
        const gasLimitVal = await etherContract.estimateGas.swapExactETHForTokens(
            0,
            [WETH, USDT],
            walletAddress,
            "99000000000000000",
            {
                value: ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18)
            });
        
        logger.log('info','etherContract.estimateGas.swapExactETHForTokens',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{estimatedGas: gasLimitVal}})
        const feeData = await provider.getFeeData();
        logger.log('info','provider.getFeeData().....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{feeData: feeData}})
        const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, "gwei");
        logger.log('info','ethers.utils.formatUnits.....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{GWEICurrntGasPrice: gasPrice}})

        const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005;
        logger.log('info','gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005.....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{CurrentGasFee: gasFee}})

        /* added based on discussion with Abhinav -- end*/
        exchange_amt = exchange_amt - gasFee;
        logger.log('info','exchange_amt - gasFee.....',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
        
        logger.log('info','<---Checking if ETH amount > 0 for ETH to USDT conversion...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
        //console.log('<---Checking logic for sufficient funds for ETH to USDT conversion...')
        //console.log(ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18));
        if (exchange_amt > 0) {
            logger.log('info','Inside If loop...FinalETHAmtToBeConverted > 0...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
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
            logger.log('info','Transaction Details...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{tx: tx}})            
            return tx;
        } else {
            logger.log('info','Inside Else...FinalETHAmtToBeConverted < 0...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
            //console.log('<--Else...Throws error due to in-sufficient funds..');
            //throw new Error('Conversion Failed Due to Insufficient Balance.');
            logger.log('error','Conversion Failed Due to Insufficient Balance...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
            return "Conversion Failed Due to Insufficient Balance.";
        }
    } catch (err: any) {
        //console.log('<--Else...Throws error...since something went wrong');
        logger.log('error','Something went wrong during conversion...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{error: err.reason}})
        return err;
    }

};

const buyUSDT = (amount: number, walletAddress: any, etherContract: any) => {
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
    catch (e: any) {
        console.log('<--- In catch...Something went wrong in...buyUSDT');
        throw new Error(e.code + '-' + e.reason);
    }

}

export const encrpyt = async (reqBody:any) => {
    logger.log('info','Encrypting the wallet details...',{ tags: 'ethusdtdataprovider.encrpyt'})
    var walletAddress = reqBody.wallAddr;
    var privateKey = reqBody.privKey;
    var ethAmt = reqBody.gasLimit;
    const encryptedWalletAddr = cryptr.encrypt(walletAddress);
    const encryptedPrivKey = cryptr.encrypt(privateKey);
    return { encryptedWalletAddr: encryptedWalletAddr, encryptedPrivKey: encryptedPrivKey }
}

export const decrypt = async (reqBody:any) => {
    logger.log('info','Decrypting the wallet details...',{ tags: 'ethusdtdataprovider.decrypt'})
    var walletAddress = reqBody.wallAddr;
    var privateKey = reqBody.privKey;
    var ethAmt = reqBody.gasLimit;
    const decryptedWallAddr = cryptr.decrypt(walletAddress);
    const decryptedPrivKey = cryptr.decrypt(privateKey);
    return { decryptedWallAddr: decryptedWallAddr, decryptedPrivKey: decryptedPrivKey }
}
