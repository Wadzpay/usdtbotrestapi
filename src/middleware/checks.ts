import { Request, Response, NextFunction } from "express";
import { HTTP400Error} from "../utils/httperrors";



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

export const authenticateAndcheckWalletParams = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {

  /* Authenticating the authorization token passed in the headers of the API and if authentication successful, then only proceed to next*/

  const authHandler = async () => {
    const accessToken = req.headers["authorization"];

    // If the token is not valid, an error is thrown:
    const path = req.headers.origin;
    if (process.env.ACCESS_TOKEN === accessToken && process.env.HOST_IP!=undefined && path?.includes(process.env.HOST_IP)) {
      walletValidations();
    } else {
      res.status(401).send("Unauthorized");
    }

  };


  /* If Authentication successful, check for wallet and privatekey validations */
  const walletValidations = async () => {
    if (Object.keys(req.body).length === 0) {
      res.status(400).send("Invalid Request");
    }
    else if (req.body.wallAddr === null || req.body.wallAddr === "") {
      res.status(400).send("Missing Wallet Address parameter");
    } else if (req.body.privKey === null || req.body.privKey === "") {
      res.status(400).send("Missing Private Key parameter");
    } else if (req.body.gasLimit === null || req.body.gasLimit === "") {
      res.status(400).send("Missing Gas Limit parameter");
    } else {
      next();
    }
  };

  await authHandler();

};
