import { NextFunction, Request, Response } from "express";
import { decrpytWalletDetails, encrpytWalletDetails, getUSDTFromETH } from "./conversionethusdt";
import { authenticateAndcheckWalletParams } from "../../middleware/checks";
import { createConversionOrder } from "./queue/convert-queue";

var logger = require('../convert/logger/aws_cloudwatch_logger');

export default [
  {
    path: "/api/v1/convert",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        try {
        
        const reqBody = req.body;
        logger.log('info', `Requesting ${req.method} ${req.originalUrl}`, {tags: 'routes', additionalInfo: {body: req.body.gasLimit}});  
        const result = await getUSDTFromETH(req.body);
        res.status(200).send(result);
        }catch (e:any) {
          return res.status(500).send(e);
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
        const result = await decrpytWalletDetails(req.body);
        res.status(200).send(result);
      }
     
    ]
  }
];
