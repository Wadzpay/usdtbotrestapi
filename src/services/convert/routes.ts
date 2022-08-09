import { Request, Response } from "express";
import { decrpytWalletDetails, encrpytWalletDetails, getUSDTFromETH } from "./ConversionETHUSDT";
import { checkWalletParams } from "../../middleware/checks";

export default [
  {
    path: "/api/v1/convert",
    method: "get",
    handler: [
      checkWalletParams,
      async ({query}: Request, res: Response) => {
        const result = await getUSDTFromETH(query.wallAddr, query.privKey, query.gasLimit);
        res.status(200).send(result);
      }
    ]
  },
  {
    path: "/api/v1/encrypt",
    method: "get",
    handler: [
      checkWalletParams,
      async ({query}: Request, res: Response) => {
        const result = await encrpytWalletDetails(query.wallAddr, query.privKey, query.gasLimit);
        res.status(200).send(result);
      }
     
    ]
  },
  {
    path: "/api/v1/decrypt",
    method: "get",
    handler: [
      checkWalletParams,
      async ({query}: Request, res: Response) => {
        const result = await decrpytWalletDetails(query.wallAddr, query.privKey, query.gasLimit);
        res.status(200).send(result);
      }
     
    ]
  }
];
