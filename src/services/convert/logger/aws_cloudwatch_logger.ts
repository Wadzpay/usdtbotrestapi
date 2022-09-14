"use strict";

import {AWSConfig} from "../conversionethusdt";

var winston = require('winston'),
    CloudWatchTransport = require('winston-cloudwatch');

var NODE_ENV = process.env.NODE_ENV || 'dev';

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console({
      timestamp: true,
      colorize: true,
    })
  ]
});

var config = {
  logGroupName: process.env.log_group_name,
  logStreamName: NODE_ENV,
  createLogGroup: false,
  createLogStream: true,
  awsConfig: AWSConfig,
  formatLog: function (item:any) {
    return item.level + ': ' + item.message + ' ' + JSON.stringify(item.meta)
  }
}

if (NODE_ENV != 'dev') logger.add(CloudWatchTransport, config);

logger.level = process.env.LOG_LEVEL || "silly";

logger.stream = {
  write: function(message:any, encoding:any) {
    logger.info(message);
  }
};

module.exports = logger;