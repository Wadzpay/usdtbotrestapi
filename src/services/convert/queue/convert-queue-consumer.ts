//import { getUSDTFromETH } from "../convert/conversionethusdt";
import { getUSDTFromETH } from "../conversionethusdt";

const convertProcess = async (job:any, done:any) => {
  try {
    console.log('inside convertProcess')
    //console.log(job.data);
    //await httpContext.ns.runPromise(async () =>{
      const{wallAddr, privKey, gasLimit} = job.data;
      if(wallAddr&&privKey&&gasLimit){
        console.log('<==== convert the given currency ===>')
        await getUSDTFromETH(job.data);
        done();  

      }
    //})
  } catch(e:any) {
    console.log('Came to the exception:::::');
    //console.log(e);
    await job.moveToFailed({message: e},0);
  } finally {
    
  }
    
  };
  
  export {
    convertProcess,
  };