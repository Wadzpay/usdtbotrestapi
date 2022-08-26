//import { convertJob } from "../services/queue/ConvertJob";
//import { searchJob }  from "../services/queue/SeachJob";

const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');



const express = require('express');

import { Router } from "express";
import { convertQueue } from "../services/convert/queue/convert-queue";

 //app.use('/ui', serverAdapter.getRouter());

export const handleBullBoard = (router:Router) => {

 const serverAdapter = new ExpressAdapter();
 serverAdapter.setBasePath('/admin/queues');

 const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [new BullMQAdapter(convertQueue)],
  serverAdapter: serverAdapter,
});

router.use("/admin/queues", serverAdapter.getRouter());


}
