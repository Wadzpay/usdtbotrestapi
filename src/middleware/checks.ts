import { Request, Response, NextFunction } from "express";
import { HTTP400Error } from "../utils/httpErrors";

export const checkSearchParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.q) {
    throw new HTTP400Error("Missing q parameter");
  } else {
    next();
  }
};

export const checkWalletParams = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.query.wallAddr) {
    throw new HTTP400Error("Missing Wallet Address parameter");
  } else if(!req.query.privKey){
    throw new HTTP400Error("Missing Private Key parameter");
  } else if(!req.query.gasLimit){
    throw new HTTP400Error("Missing Gas Limit parameter");
  } else {
    next();
  }
};
