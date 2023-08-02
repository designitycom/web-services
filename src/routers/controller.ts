
// import { Request, Response } from "express";

//  class controller{
//     constructor(){
//     }

//     myResponse = async(res:Response,status:number,data:Object,message:string) =>{
//         res.status(status).send({"data":data,"message":message});
//     }

// }  


// export default controller

import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";
import { Request, Response } from "express";

class Controller {
  constructor() {}

  myResponse = async (
    res: Response,
    status: number,
    data: Object | Nft | Sft  | SftWithToken | NftWithToken | null,
    message: string
  ) => {
    res.status(status).send({ data: data, message: message });
  };
}

export default Controller;