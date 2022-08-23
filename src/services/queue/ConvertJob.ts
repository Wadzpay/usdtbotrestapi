import Queue from "bull";

import { constants } from "../../utils/Constants";
import convertProcess from "../processes/ConvertJobProcess";

class ConvertJob {
    convertQueue: Queue.Queue<any>;

    constructor() {
        this.convertQueue = new Queue(constants.CONVERT_QUEUE);
        this.convertQueue.on("completed", (job, result) => {
          console.log(`Job completed JOBID:- ${job.id}`);
        });
        this.perform();
      }

      perform = async () => {
        this.convertQueue.process(convertProcess);
      };
}

export const convertJob = new ConvertJob();