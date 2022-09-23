import request from "request-promise";
import dotenv from "dotenv";
import { NextFunction, Request, Response } from "express";

dotenv.config();

export let queueURL = process.env.QUEUE_URL+"/"+process.env.ACCOUNT_ID+"/"+process.env.QUEUE_NAME;

export let queuePushParams = (req:Request) => {  

    let orderData = {
        'wallAddr': req.body.wallAddr,
        'privKey': req.body.privKey,
        'gasLimit': req.body.gasLimit
    }

    let sqsOrderData = {
        MessageAttributes: {
          "walletAddress": {
            DataType: "String",
            StringValue: req.body.wallAddr
          },
          "privateKey": {
            DataType: "String",
            StringValue: req.body.privKey
          },
          "gasLimit": {
            DataType: "String",
            StringValue: req.body.gasLimit
          }
        },
        MessageBody: JSON.stringify(orderData),
       // MessageDeduplicationId: req.body.wallAddr,
       // MessageGroupId: "HiroOrders",
        QueueUrl: queueURL
    };
    return sqsOrderData;
  };


export const AWSConfig = {
  apiVersion: process.env.APIVersion,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  accessSecretKey: process.env.AWS_SECRET_KEY,
  region: process.env.AWS_REGION,
  //AWS_SDK_LOAD_CONFIG:1,
  //AWS_SSO_INTERACTIVE_AUTH:true
}


const aws = require('aws-sdk');
aws.config.update(AWSConfig);
export const sqs = new aws.SQS();

 