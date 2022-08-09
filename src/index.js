const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { Queue: QueueMQ, Worker, QueueScheduler } = require('bullmq');
const express = require('express');

const sleep = (t) => new Promise((resolve) => setTimeout(resolve, t * 1000));

const redisOptions = {
  port: 6379,
  host: 'localhost',
  password: '',
  tls: false,
};

const createQueueMQ = (name) => new QueueMQ(name, { connection: redisOptions });

async function setupBullMQProcessor(queueName) {
  console.log('--> inside setupBullMQProcessor <--')
  const queueScheduler = new QueueScheduler(queueName, {
    connection: redisOptions,
  });
  await queueScheduler.waitUntilReady();

  new Worker(queueName, async (job) => {
    for (let i = 0; i <= 5; i++) {
      await sleep(Math.random());
      await job.updateProgress(i);
      await job.log(`Processing job at interval ${i}`);

      if (Math.random() * 200 < 1) throw new Error(`Random error ${i}`);
    }

    return { jobId: `This is the return value of job (${job.id})` };
  });
}

const run = async () => {
  console.log('--> inside run <--')
  const exampleBullMq = createQueueMQ('BullMQ');

  await setupBullMQProcessor(exampleBullMq.name);

  const app = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/ui');

  createBullBoard({
    queues: [new BullMQAdapter(exampleBullMq)],
    serverAdapter,
  });

  app.use('/ui', serverAdapter.getRouter());

  app.use('/add', (req, res) => {
    const opts = req.query.opts || {};
    console.log('opts-->', opts)
    if (opts.delay) {
      opts.delay = +opts.delay * 1000; // delay must be a number
    }

    exampleBullMq.add('Add', { title: req.query.title }, opts);

    res.json({
      ok: true,
    });
  });

  app.use('/keywordSearch', (req, res) => {
    //checkSearchParams,
      /*async ({ query }: Request, res: Response) => {
        const result = await getPlacesByName(query.q);
        res.status(200).send(result);
      }*/
      
        //const searchMQ = createQueueMQ('SearchQueue');
        console.log('befor calling createQueueMQ');
        //const exampleBullMq = createQueueMQ('KeywordSearch');
        const opts = req.query.opts || {};
        //await setupBullMQProcessor(exampleBullMq.name);
        exampleBullMq.add('Search', {keyword: req.query.keyword}, opts);
        return res.status(201).end();
  });

  app.listen(3000, () => {
    console.log('Running on 3000...');
    console.log('For the UI, open http://localhost:3000/ui');
    console.log('Make sure Redis is running on port 6379 by default');
    console.log('To populate the queue, run:');
    console.log('  curl http://localhost:3000/add?title=Example');
    console.log('To populate the queue with custom options (opts), run:');
    console.log('  curl http://localhost:3000/add?title=Test&opts[delay]=9');
  });
};

// eslint-disable-next-line no-console
run().catch((e) => console.error(e));