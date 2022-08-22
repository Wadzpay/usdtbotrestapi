import Queue from "bull";

import rootPath from "app-root-path";
//const { searchBull, jobOptions } = require("../search/config")
//import searchProcess from "../processes/SearchJobProcess"
import convertProcess from "../processes/ConvertJobProcess";

class ConvertJob {
    convertQueue: Queue.Queue<any>;

    constructor() {
        console.log("<== inside ConvertJob constructor ==>");
        //this.searchQueue = new Queue("search-queue", process.env.REDIS as string);
        this.convertQueue = new Queue("convert-queue");
        this.convertQueue.on("completed", (job, result) => {
          console.log(`Job completed JOBID:- ${job.id}`);
        });
        this.perform();
      }

      perform = async () => {
        console.log("<== inside perform ==>")
        this.convertQueue.process(convertProcess);
      };

     /* static async process(message: any, channel: Channel) {
        switch (message.mailType) {
          case "createPasswordMail":
            await UserMailer.createPasswordMail(message.passwordLink, message.user);
            channel.ack(message);
            break;
          case "sendConfirmationMail":
            await UserMailer.sendConfirmationMail(
              message.confirmationLink,
              message.user
            );
            channel.ack(message);
            break;
        }
      }*/
}

export const convertJob = new ConvertJob();