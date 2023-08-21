import { WorkflowExecutionAlreadyStartedError } from "@temporalio/client";
import { NextFunction ,Response,Request} from "express"

const handleError=(err:any,req: Request, res: Response,next:NextFunction)=>{ 
    const errMsg = err.message || 'Something went wrong';
    const errStatus = err.statusCode || 500;
    if (err instanceof WorkflowExecutionAlreadyStartedError){
        res.status(200).json({data:null,message:errMsg});
    }else{
        res.status(errStatus).json({data:null,message:errMsg});
    }
}

export default handleError;