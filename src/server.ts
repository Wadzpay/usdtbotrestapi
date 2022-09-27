import http from "http";
import express from "express";
import { applyMiddleware, applyRoutes } from "./utils";
import middleware from "./middleware";
import errorHandlers from "./middleware/errorhandlers";
import routes from "./services";
var logger = require('./services/convert/logger/awscloudwatchlogger');

import {app} from "./app";

var dotenv = "dotenv";

require('dotenv').config();


var PROCESS_START_SCRIPT = process.env.START_SCRIPT || 'PRODUCER';

logger.log('info',`start script.....${PROCESS_START_SCRIPT}`);

if(PROCESS_START_SCRIPT==='PRODUCER'){

process.on("uncaughtException", e => {
  console.log(e);
  //process.exit(1);
});

process.on("unhandledRejection", e => {
  console.log(e);
  //process.exit(1);
});




const router = express();
applyMiddleware(middleware, router);
applyRoutes(routes, router);
applyMiddleware(errorHandlers, router);

const PORT  = process.env.port || 3000;
const env =process.env.NODE_ENV
const server = http.createServer(router);

server.listen(PORT, () =>
  console.log(`Server is running http://localhost:${PORT}. ${env}..`)
);

}else{
  app.start();
}
