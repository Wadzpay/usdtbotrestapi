import {Job} from "bull";

const searchProcess = async (job:Job) => {
    console.log(job.data);
};

export default searchProcess;