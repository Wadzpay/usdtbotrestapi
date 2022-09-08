console.log('Loading function');

var request = "request-promise";
var dotenv = "dotenv";
var https = require('https')
require('dotenv').config();
var routerAbi = require("./config/router.abi.json");
const { ChainId, Fetcher, Route, Trade, TokenAmount, TradeType, uniswap } = require ('@uniswap/sdk');
const ethers = require('ethers');
const Cryptr = require('cryptr');
const cryptr = new Cryptr(process.env.CRYPT_KEY);

// Import the AWS SDK
var aws  = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const { response } = require('express');

const aws_config = {
  apiVersion: "2022-08-22",
  accessKeyId: process.env.AWS_ACCESS_KEY,
  accessSecretKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
}

// Load your AWS credentials and try to instantiate the object.
aws.config.update(aws_config);

const WETH = process.env.WETH;
const USDT = process.env.USDT;
const ROUTER = process.env.ROUTER;
const RPC = process.env.RPC;

console.log('queueUrl...',process.env.queueUrl+process.env.queueName);

const app = Consumer.create({
    queueUrl: process.env.queueUrl+process.env.queueName,
    handleMessage: async (message) => {
      // do some work with `message`
      console.log('message...',message);
            
      var reqBody = JSON.parse(message.Body);
      //console.log('...', reqBody);

      //console.log('....',reqBody.wallAddr);
      try{
        ethTousdt = await getUSDT(reqBody);
        //console.log('ethToUSDT...',ethTousdt);       
         }catch(err){
             console.log('Error occured while processing the conversion.....');
             console.log(err);
             return response.status(err.code).send(err.message);
         }      
    },
    sqs: new aws.SQS({
      httpOptions: {
        agent: new https.Agent({
          keepAlive: false
        })
      }
    })
  });

  app.on('error', (err) => {
    console.error(err.message);
  });
  
  app.on('processing_error', (err) => {
    console.error(err.message);
  });
  
  app.start();

exports.handler = async (event) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    for (const { messageId, body } of event.Records) {
        console.log('SQS message %s: %j', messageId, body);

        var reqBody = body;//JSON.parse(body);
        //console.log('reqBody...', reqBody);

        //console.log('msg body....',reqBody.wallAddr);   
        try{
          ethTousdt = await getUSDT(reqBody);
          //console.log('ethToUSDT...',ethTousdt);
          /*if(ethTousdt instanceof Error){
           console.log('ethTousdt is error......',ethTousdt.message);
           return res.status(500).send(ethTousdt.message);
          }*/
           }catch(err){
               console.log('Error occured while processing the conversion.....');
               //console.log(err);
               return response.status(500).send(err.reason);
           }      
    }
    return `Successfully processed ${event.Records.length} messages.`;
};

const getUSDT = async (reqBody) => {

    try{
     //console.log('Wallet Address....', reqBody.wallAddr);
     //console.log('Privat Key....', reqBody.privKey); 
     console.log('ETH to be converted-->', reqBody.gasLimit); 
   
     console.log('<---Start - Decryption Process--->')
     var decryptedDetails = decrypt(reqBody.wallAddr,reqBody.privKey,reqBody.gasLimit);
     walletAddress = (await decryptedDetails).decryptedWallAddr;
     privateKey = (await decryptedDetails).decryptedPrivKey;
     ethAmt = reqBody.gasLimit;
     console.log('<---End - Decryption Process--->')
     
     console.log('<---Start - Signer & Contract Process--->')
     var provider = new ethers.providers.JsonRpcProvider(RPC);
     //console.log('privateKey', privateKey);
     //console.log('gasLimit', gasLimit);
     var signer = new ethers.Wallet(privateKey, provider);
     //uniswap = new ethers.Contract(ROUTER, routerAbi, signer);
     const etherContract = new ethers.Contract(ROUTER, routerAbi, signer);
     //console.log('etherContract....',etherContract);
     console.log('<---End - Signer & Contract Process--->')
     var tx;
   
     console.log('<---Checking Current Balance.....')
     var provider_obj = await provider.getBalance(walletAddress);
     console.log('provider_obj....',provider_obj);
     var balance = ethers.utils.formatEther(provider_obj);
     console.log('balance-->' + balance)
     //console.log('eth amount-->', parseFloat(ethAmt)); 
     console.log('<---Checking Buy Amount...(balance - eth amount)')
     let exchange_amt = balance - parseFloat(ethAmt);
     console.log('exchange_amt -> ', exchange_amt)
     console.log('<---Checking Gas Limit...')
     const gasLimitVal = await etherContract.estimateGas.swapExactETHForTokens(  
     //const gasLimitVal = await etherContract.swapExactETHForTokens(
       0,
       [WETH, USDT],
       walletAddress,
       "99000000000000000",
       {
           value: ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18)
       });
       console.log('Gas Limit-->',gasLimitVal);
   
       console.log('<---Checking Fee Data...')
       const feeData = await provider.getFeeData();
       console.log('Fee Data-->',feeData);
   
       console.log('<---Checking Gas Price...')
       const gasPrice = ethers.utils.formatUnits(feeData.gasPrice, "gwei");
       console.log('Gas Price-->',gasPrice);
       
       console.log('<---Checking Gas Fee...')
       const gasFee = gasLimitVal * gasPrice / Math.pow(10, 9) + 0.000;
       console.log('Gas Fee...',gasFee);

       console.log('....',gasFee > parseFloat(ethAmt) ? gasFee : parseFloat(ethAmt));
   
       console.log('<---Checking Real Buy Amount...')  
       console.log('gas fee to consider -->',gasFee > parseFloat(ethAmt) ? gasFee : parseFloat(ethAmt))  ;
       
       /* Commented below logic based on inputs from Vekata */
       //exchange_amt = balance - (gasFee > parseFloat(ethAmt) ? gasFee : parseFloat(ethAmt));
       /* Modified below logic based on inputs from Venkata --> Start */
       var transactionFeeETHAmt = balance*(parseFloat(ethAmt)/100);
       exchange_amt = balance - transactionFeeETHAmt;
       console.log('Final Exchange Amount...', exchange_amt);
       /* Modified below logic based on inputs from Venkata --> End */
   
       console.log('<---Checking logic for sufficient funds(eth>=0.001 && buy_amt>0) for ETH to USDT conversion...')
       if (exchange_amt > 0) {
        console.log('<---If loop...to convert ' + exchange_amt + ' ETH to USDT')
       /*  //tx = buyUSDT(buy_amt, walletAddress,etherContract);
         var tx = new etherContract.method.swapExactETHForTokens(
            0,
            [WETH, USDT],
            walletAddress,
            "99000000000000000",
            {
                value: ethers.utils.parseUnits(exchange_amt.toFixed(8).toString(), 18)
            }
        )
         console.log('tx-->',tx);
         return tx;*/
       }else{
           console.log('<--Else...Throws error due to in-sufficient funds..');        
          //throw new Error('Conversion Failed Due to Insufficient Balance.');
          return "Conversion Failed Due to Insufficient Balance.";
       }
       }catch(err){   
           console.log('<--Something went wrong.Error Occured in getUSDT method');
           //console.log(err);
           throw new Error(err.code+'...'+err.reason);
       }
       
       };
 
       const decrypt = async (walletAddress, privateKey, gasLimit) => {
        const decryptedWallAddr = cryptr.decrypt(walletAddress);
        const decryptedPrivKey = cryptr.decrypt(privateKey);
        return {decryptedWallAddr:decryptedWallAddr,decryptedPrivKey:decryptedPrivKey}
    }


