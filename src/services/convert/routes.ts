import { Request, Response } from "express";
import { decrpytWalletDetails, encrpytWalletDetails, getUSDTFromETH } from "./ConversionETHUSDT";
import { authenticateAndcheckWalletParams } from "../../middleware/checks";


export default [
  {
    path: "/api/v1/convert",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        const reqBody = req.body;
        const result = await getUSDTFromETH(reqBody.wallAddr, reqBody.privKey, reqBody.gasLimit);
        res.status(200).send(result);
      }
    ]
  },
  {
    path: "/api/v1/encrypt",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        const reqBody = req.body;
        const result = await encrpytWalletDetails(reqBody.wallAddr, reqBody.privKey, reqBody.gasLimit);
        res.status(200).send(result);
      }
     
    ]
  },
  {
    path: "/api/v1/decrypt",
    method: "post",
    handler: [
      authenticateAndcheckWalletParams,
      async (req: Request, res: Response) => {
        const result = await decrpytWalletDetails(req.body.wallAddr, req.body.privKey, req.body.gasLimit);
        res.status(200).send(result);
      }
     
    ]
  }
];
