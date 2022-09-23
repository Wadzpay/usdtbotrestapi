console.log('Loading function');

var request = "request-promise";
var dotenv = "dotenv";
var https = require('https')
require('dotenv').config();


import {getUSDTFromETH } from "./services/convert/providers/conversionethusdt";
import {sqs,queueURL} from "./services/convert/queue/QueueParams"

// Import the AWS SDK
var aws  = require('aws-sdk');
const { Consumer } = require('sqs-consumer');
const { response } = require('express');

var logger = require('./services/convert/logger/awscloudwatchlogger');


// Load your AWS credentials and try to instantiate the object.
//aws.config.loadFromPath(__dirname + '/config/config.json');
// Instantiate SQS.
//var sqs = new aws.SQS();

//console.log('queueUrl...',process.env.queueUrl+"/"+process.env.accountId+"/"+process.env.queueName);
logger.info('info',`queueURL...${queueURL}`);
export const app = Consumer.create({
    queueUrl: queueURL,
    handleMessage: async (message:any) => {
      // do some work with `message`
      //console.log('message...',message);
            
      var reqBody = JSON.parse(message.Body);
      //console.log('...', reqBody);

      logger.info('info',`wallet address...${reqBody.wallAddr}`);
      try{
        logger.log('info', `<...........START...Conversion logic for => ${message.MessageId}............>`);
        var result = await getUSDTFromETH(reqBody); 
        
        response.status(200).send(result); 
        
        }catch(err:any){
          console.log(`Error....${err}`);
          logger.log('error', `<...........ERROR...Conversion logic for => ${message.MessageId}............>`);
          response.status(500).send(`Error Occured while executing conversion logic ${err.message}`)
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

  app.on('error', (err:any) => {
    console.error(err.message);
  });
  
  app.on('processing_error', (err:any) => {
    console.error(err.message);
  });
  
 // app.start();

exports.handler = async (event:any) => {
    //console.log('Received event:', JSON.stringify(event, null, 2));
    for (const { messageId, reqBody } of event.Records) {
        //console.log('SQS message %s: %j', messageId, body);

        //var reqBody = body;//JSON.parse(body);
        //console.log('reqBody...', reqBody);

        console.log('msg body....',reqBody.wallAddr);   
        try{
          logger.log('info', `Run conversion logic...`);
          var result = await getUSDTFromETH(reqBody);    
          response.status(200).send(result); 
          }catch(err:any){
            response.status(500).send(`Error Occured while executing conversion logic ${err.message}`)
          }      
    }
    return `Successfully processed ${event.Records.length} messages.`;
};




