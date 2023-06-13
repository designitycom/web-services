
import { Request, Response } from "express";

 class controller{
    constructor(){
    }

    myResponse = async(res:Response,status:number,data:Object,message:string) =>{
        res.status(status).send({"data":data,"message":message});
    }

}  


export default controller