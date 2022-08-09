import { Request, Response } from "express";
import { getPlacesByName } from "./SearchController";
import { checkSearchParams } from "../../middleware/checks";
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue: QueueMQ, Worker, QueueScheduler } = require('bullmq');
import Bull from 'bull'
const express = require('express');
import searchProcess from "./search.process";
//const { connectQueue } = require('../../config')

/*const someQueue = new Queue()
const someOtherQueue = new Queue()
const queueMQ = new QueueMQ()

const { setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullAdapter(someQueue, { readOnlyMode: true }), // only this queue will be in read only mode
    new BullAdapter(someOtherQueue,  { allowRetries: false }),
    new BullMQAdapter(queueMQ, { allowRetries: true, readOnlyMode: true }),
  ]
})

const jobOptions = {
  // jobId, uncoment this line if your want unique jobid
  removeOnComplete: true, // remove job if complete
  delay: 60000, // 1 = 60000 min in ms
  attempts: 3 // attempt if job is error retry 3 times
};

const searchQueue = 'searchQueue'

/*([
  new BullAdapter(searchQueue)
]);*/

//var searchQueue = 'searchQueue'

const redisOptions = {
  port: 6379,
  host: '127.0.0.1',
  //password: '',
  //tls: false,
};

//const createQueueMQ = (searchQueue:string) => new Bull(searchQueue, process.env.REDIS_URL);

const searchQueue = new Bull('search', { redis: redisOptions });

/*async function setupBullMQProcessor(searchQueue:string) {
  const queueScheduler = new QueueScheduler(searchQueue, {
    connection: redisOptions,
  });*/
  //await queueScheduler.waitUntilReady();}


/*const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/ui');

createBullBoard({
  queues: [new BullMQAdapter(exampleBullMq)],
  serverAdapter,
});*/

//const app = express();

//app.use('/ui', serverAdapter.getRouter());

/*const jobOptions = {
  //jobId, //uncoment this line if your want unique jobid
  removeOnComplete: true, // remove job if complete
  delay: 60000, // 1 = 60000 min in ms
  attempts: 3 // attempt if job is error retry 3 times
};*/

export default [
  {
    path: "/api/v1/search",
    method: "get",
    handler: [
      checkSearchParams,
      /*async ({ query }: Request, res: Response) => {
        const result = await getPlacesByName(query.q);
        res.status(200).send(result);
      }*/
      async ({ query }: Request, res: Response) => {
        //const searchMQ = createQueueMQ('SearchQueue');
        console.log('befor calling createQueueMQ');
        /*const exampleBullMq = createQueueMQ('Search');
        console.log(exampleBullMq)
        const opts = query.opts || {};
        //await setupBullMQProcessor(exampleBullMq.name);
        exampleBullMq.add('Search', {q: query.q}, opts);*/
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
