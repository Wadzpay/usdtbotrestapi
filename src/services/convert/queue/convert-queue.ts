import { convertProcess } from "./convert-queue-consumer";

const Queue = require("bull");
//const { convertProcess } = require(".convert-queue-consumer");
const defaultJobOptions = { removeOnComplete: false, removeOnFail: false };
// Our job queue
const convertQueue = new Queue("dev-queue", {
  redis: process.env.REDIS_URL,
  defaultJobOptions
});

const createConversionOrder = (reqBody:any) => {
    convertQueue.add(reqBody, {
    //priority: getJobPriority(ethamout),
    //delay:30000,
    attempts: 1,
    //removeOnComplete: false, // removes job from queue on success
    //removeOnFail: true // removes job from queue on failure
  });
};

const getJobPriority = (ethamout:any) => {
  if (!ethamout.price) return 3;
  return ethamout > 100 ? 1 : 2;
};

convertQueue.process(100, convertProcess);

export{
    convertQueue,
    createConversionOrder,
};