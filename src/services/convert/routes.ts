import { NextFunction, Request, Response } from "express";
import { decrpytWalletDetails, encrpytWalletDetails, getUSDTFromETH } from "./providers/conversionethusdt";
import { authenticateAndcheckWalletParams } from "../../middleware/checks";
import { createConversionOrder } from "./queue/convert-queue";

import {sqs, queuePushParams} from "./queue/QueueParams";

var logger = require('../convert/logger/awscloudwatchlogger');

import dotenv from "dotenv";
dotenv.config();

export default [
  {
    path: "/api/v1/convert",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        try {
        //const RPC = process.env.RPC;
        //const reqBody = req.body;
        logger.log('info', `Requesting ${req.method} ${req.originalUrl}`, {tags: 'routes', additionalInfo: {body: req.body.gasLimit}});  
        
        var CONVERSION_LOGIC = process.env.CONVERSION_LOGIC || 'YES';
        
        if(CONVERSION_LOGIC==='YES'){
          try{
          logger.log('info', `Run conversion logic...`);
          var result = await getUSDTFromETH(req.body);    
          res.status(200).send(result); 
          }catch(err:any){
            res.status(500).send(`Error Occured while executing conversion logic ${err.message}`)
          }
        }else{
          logger.log('info', `Push messages to queue...`);
          (sqs.sendMessage(queuePushParams(req)).promise()).then((data:any) => {
            console.log('data...',data)
            console.log(`OrdersSvc | SUCCESS: ${data.MessageId}`);
            res.status(200).send(`OrdersSvc | SUCCESS: ${data.MessageId}`);
        }).catch((err:any) => {
            console.log(err);
            console.log(`OrdersSvc | ERROR: ${err}`);
            // Send email to emails API
            res.status(500).send(`OrdersSvc | ERROR: ${err}`);
        });   
        }   
        
        
        }catch (e:any) {
          return res.status(500).send(`Error Occured with ${req.method} ${req.originalUrl}`);
        }
      }
      /*async (req: Request, res: Response, next: NextFunction) => {
        try {
        const reqBody = req.body;
        //console.log('req_body-->',reqBody);
        await createConversionOrder(req.body);
        return res.status(200).send("Job successfully added to queue");
      }catch (e) {
        return res.status(500).send("Error Occured while adding Job to Queue");
      }
      }*/
    ]
  },
  {
    path: "/api/v1/encrypt",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        try{
        const reqBody = req.body;
        const result = await encrpytWalletDetails(req.body);
        res.status(200).send(result);
        }catch(e:any){
          res.send(e.code).send(e.reason);
        }
      }
     
    ]
  },
  {
    path: "/api/v1/decrypt",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        try{
        const result = await decrpytWalletDetails(req.body);
        res.status(200).send(result);
      }catch(e:any){
        res.send(e.code).send(e.reason);
      }
      }
     
    ]
  }
];
