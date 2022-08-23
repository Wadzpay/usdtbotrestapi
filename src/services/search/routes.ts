import { Request, Response } from "express";
import { checkSearchParams } from "../../middleware/checks";
import Bull from 'bull'
const express = require('express');
import searchProcess from "./search.process";

const redisOptions = {
  port: 6379,
  host: '127.0.0.1',
};

const searchQueue = new Bull('search', { redis: redisOptions });

export default [
  {
    path: "/api/v1/search",
    method: "get",
    handler: [
      checkSearchParams,
      async ({ query }: Request, res: Response) => {
        console.log('befor calling createQueueMQ');
        const searchKeyword = (data:any) => {
          searchQueue.add(data,{q: query.q})
        }
        
        //consumer
        searchQueue.process(searchProcess);
        return res.status(201).end();
    }
    ]
  }
];
