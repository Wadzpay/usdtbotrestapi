import request from "request-promise";
import dotenv from "dotenv";
dotenv.config();
import routerAbi from "../config/router.abi.json";
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPT_KEY);

//var Web3 = require('web3');
//For Nodejs
//const {gasstationInfo} = require('eth-gasprice-estimator');

const WETH = process.env.WETH;
const USDT = process.env.USDT;
const ROUTER = process.env.ROUTER;
const RPC = process.env.RPC;


var logger = require('../logger/awscloudwatchlogger');

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

export var getUSDT = async (reqBody:any) => {

    logger.log('info', `Conversion Logic start.....`, {tags: 'ethusdtdataprovider.getUSDT'});
    try {
        var walletAddress = reqBody.wallAddr;
        var privateKey = reqBody.privKey;
        var transFee = reqBody.gasLimit;
        //logger.log('info', `Inside getUSDT`);
        //console.log('Wallet Address-->', walletAddress);
        
        //console.log('ETH to be converted-->', ethAmt);
        logger.log('info',`User input transaction fee...${transFee}`,{ tags: 'ethusdtdataprovider.getUSDT', additionalInfo: { body: transFee } })

        logger.log('info','<---Start - Decryption Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var decryptedDetails = decrypt(reqBody)
        walletAddress = (await decryptedDetails).decryptedWallAddr;
        logger.log('info',`Wallet Address...${walletAddress}`,{ tags: 'ethusdtdataprovider.getUSDT', additionalInfo: { body: walletAddress } })
        privateKey = (await decryptedDetails).decryptedPrivKey;
        logger.log('info','<---End - Decryption Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})

        logger.log('info','<---Start - Signer & Contract Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var provider = await new ethers.providers.JsonRpcProvider(RPC);
        //console.log('privateKey', privateKey);
        //console.log('gasLimit', gasLimit);
        var signer = await new ethers.Wallet(privateKey, provider);
        //uniswap = new ethers.Contract(ROUTER, routerAbi, signer);
        const etherContract = await new ethers.Contract(ROUTER, routerAbi, signer);
        logger.log('info','<---End - Signer & Contract Process--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        var tx;

        logger.log('info','<---Checking Current Balance--->',{ tags: 'ethusdtdataprovider.getUSDT'})
        
        /* Step 1 - Getting current balance from wallet address */
        const balance = await ethers.utils.formatEther(await provider.getBalance(walletAddress))
        logger.log('info',`balance.....${Number(balance)}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{balance: balance}})
        
        const allowed_balance = process.env.ALLOWED_BALANCE
        logger.log('info',`allowed balance.....${Number(allowed_balance)}`)
        

        if(Number(balance)<Number(allowed_balance)){
            logger.log('error',`Current Balance ${balance} < Allowed Balance ${allowed_balance}`)
            throw new Error(`Current Balance ${balance} < Allowed Balance ${allowed_balance}`); 
        }

        /* Step 2 - Checking current gas fee on available balance...start */
        //let buy_amt = balance - parseFloat(ethAmt);
        //console.log('buy amt for estimate gas -> ', exchange_amt)

                
        var gasLimitVal;
        try{
        gasLimitVal = await etherContract.estimateGas.swapExactETHForTokens(
            0,
            [WETH, USDT],
            walletAddress,
            "99000000000000000",
            {
                value: ethers.utils.parseUnits(Number(balance).toFixed(8).toString(), 18)
            });
        }catch(err:any){
            console.log(err)
            logger.log('error',`Error Occured while finding estimated gas limit for balance ${balance}`);
            return `Error Occured while finding estimated gas limit with...Error code...${err.code}. Reason...${err.reason}`;
        }
        logger.log('info',`Gas Limit Value....${gasLimitVal}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{estimatedGas: gasLimitVal}})
        const feeData = await provider.getFeeData();
        logger.log('info',`Fee Data.....${feeData}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{feeData: feeData}})
        const gasPrice = await ethers.utils.formatUnits(feeData.gasPrice, "gwei");
        logger.log('info',`Gas Price.....${gasPrice}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{GWEICurrntGasPrice: gasPrice}})

        const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.005;
        logger.log('info',`Gas Fee....${gasFee}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{CurrentGasFee: gasFee}})
        /* checking current gas fee on balance...end */
        
        /* Step 3 - Comparing user entered gasFee with current gas fees */
        var check = (gasFee > transFee ? true : false)
        logger.log('info',`Is gasFee > ethAmt.....${check}`)
        logger.log('info', `Final gas fee ...${gasFee}`)
        if(gasFee>transFee){
            logger.log('error',`Current Gas Fee ${gasFee} > User provided ${transFee}`)
            throw new Error(`Conversion failed. Reason: Current Gas Fee ${gasFee} > User provided Transction fee ${transFee}`);
        }


        /* Modified below logic based on inputs from Venkata --> Start */
        /*
         *  balance --> balance in wallet address
         *  ethAmt  --> amount entered by user in %
         *  transactionFeeETHAmt --> transaction fees to deducted from balance
         */
        /* Step 4 - Checking trasaction fee on available balance...start */
        var transactionFeeETHAmt = balance * (parseFloat(transFee)); //transFee is the fees entered by user
       // logger.log('info',`transactionFeeETHAmt.....${transactionFeeETHAmt}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{transactionFeeETHAmt: transactionFeeETHAmt}})
        
       /* Step 5 - Checking final amount to be converted...start */
       var exchange_amt = balance - gasFee; // exchange_amt is final ETH amount to be converted
        //logger.log('info',`balance-transactionFeeETHAmt.....${exchange_amt}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{exchange_amt: exchange_amt}})
        /* Modified below logic based on inputs from Venkata --> End */

        /* added based on discussion with Abhinav -- start */
        logger.log('info', `Exchange amount  ...${balance - gasFee}`)
        logger.log('info', `Gas fee after after deducting from balance ...${gasFee}`)

        /* added based on discussion with Abhinav -- end*/
        //exchange_amt = exchange_amt - gasFee;
        logger.log('info',`Final ETH amt to be converted...${exchange_amt}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
        
        logger.log('info',`<---Checking if ETH amount > 0 for ETH to USDT conversion...${exchange_amt}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
        //console.log('<---Checking logic for sufficient funds for ETH to USDT conversion...')
        //console.log(ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18));
        if (exchange_amt > 0) {
            logger.log('info','Inside If loop...FinalETHAmtToBeConverted > 0...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
            //tx = buyUSDT(buy_amt, walletAddress,etherContract);
         var tx;   
         try{
         logger.log('info','Inside try block...executing transaction.')
         var ALLOW_TRANSACTION = process.env.ALLOW_TRANSACTION || 'YES';
         if(ALLOW_TRANSACTION==='YES'){
            logger.log('info',`ALLOW_TRANSACTION is set ${ALLOW_TRANSACTION}, so ETH to USDT conversion will happen`)
         tx = await new etherContract.swapExactETHForTokens(
                0,
                [WETH, USDT],
                walletAddress,
                "99000000000000000",
                {
                    value: ethers.utils.parseUnits(balance.toFixed(8).toString(), 18)
                }
            )         
         }else{
            logger.log('info',`ALLOW_TRANSACTION is set ${ALLOW_TRANSACTION}, so ETH to USDT conversion not happened and balance is...${balance}`)
         }
            } catch (err: any) {
                //console.log('<--Else...Throws error...since something went wrong');
                logger.log('error',`Error occured while swaping. ${err.code}: ${err.reason}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{error: err.reason}})
                return `Error occured while swaping. ${err.code}: ${err.reason}`;
            }
            logger.log('info',`Transaction Details...${tx}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{tx: tx}})            
            return tx;
        } else {
            logger.log('info','Inside Else...FinalETHAmtToBeConverted < 0...',{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
            //console.log('<--Else...Throws error due to in-sufficient funds..');
            //throw new Error('Conversion Failed Due to Insufficient Balance.');
            logger.log('error',`Conversion Failed Due to Insufficient Balance...${exchange_amt}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{FinalETHAmtToBeConverted: exchange_amt}})
            return "Conversion Failed Due to Insufficient Balance.";
        }
    } catch (err: any) {
        //console.log('<--Else...Throws error...since something went wrong');
        logger.log('error',`Something went wrong during conversion...${err.reason}`,{ tags: 'ethusdtdataprovider.getUSDT',  additionalInfo:{error: err.reason}})
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
