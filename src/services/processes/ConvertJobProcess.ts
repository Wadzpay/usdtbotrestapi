import { getUSDTFromETH } from "../convert/ConversionETHUSDT";
 
export const convertProcess = async (job: any, done: any) => {
    /*if (job.data.q.length < 3) {
      return {
        type: "FeatureCollection",
        features: []
      };
    }*/
  
    return getUSDTFromETH(job.data.wallAddr, job.data.privKey, job.data.gasLimit);
  };

export default convertProcess;