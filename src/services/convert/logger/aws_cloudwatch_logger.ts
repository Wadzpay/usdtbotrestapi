"use strict";

import dotenv from "dotenv";
dotenv.config();

import {AWSConfig} from "../conversionethusdt";

var winston = require('winston');
    
var WinstonCloudWatch = require('winston-cloudwatch');

var NODE_ENV = process.env.NODE_ENV || 'dev';

var LOG_GROUP_NAME = process.env.LOG_GROUP_NAME || 'wadzpay-usdtbotrestapi'
console.log('LOG_GROUP_NAME....',LOG_GROUP_NAME);

const logger = new winston.createLogger({
  format: winston.format.json(),
  transports: [
      new (winston.transports.Console)({
          timestamp: true,
          colorize: true,
      })
 ]
});

logger.level = process.env.LOG_LEVEL || "silly";

console.log('log level....',logger.level);

var config = {  
  logGroupName: process.env.CLOUDWATCH_GROUP_NAME,
  logStreamName: `${process.env.CLOUDWATCH_GROUP_NAME}-${process.env.NODE_ENV}`,
  createLogGroup: false,
  createLogStream: true,
  awsConfig: AWSConfig,
  formatLog: function (item:any) {
    return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
  }
}

if (NODE_ENV != 'dev') logger.add(new WinstonCloudWatch(config));



logger.stream = {
  write: function(message:any, encoding:any) {
    logger.info(message);
  }
};

module.exports = logger;