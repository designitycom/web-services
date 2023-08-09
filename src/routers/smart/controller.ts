import controller from "../controller";
import { Request, Response } from "express";


class SmartController extends controller {
  callSmart = async (req: Request, res: Response) => {
  
    this.myResponse(res, 200, null, "set workflow");
  };
} // end of MintController

export default new SmartController();
