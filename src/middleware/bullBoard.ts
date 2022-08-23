import { convertJob } from "../services/queue/ConvertJob";
//import { searchJob } from "../services/queue/SeachJob";

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');

const express = require('express');

import { constants } from "../utils/Constants";
const app = express();

 

 //app.use('/ui', serverAdapter.getRouter());

export const handleBullBoard = (router:any) => {

 const serverAdapter = new ExpressAdapter();
 serverAdapter.setBasePath(constants.BULL_SERVER_BASE_PATH);

 const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(convertJob.convertQueue)],
  serverAdapter: serverAdapter,
});

   router.use(constants.BULL_SERVER_BASE_PATH, serverAdapter.getRouter());
}
