import controller from "../controller";
import { Request, Response } from "express";

class SmartController extends controller {
  callSmart = async (req: Request, res: Response) => {
    
    // const orgMint = Keypair.generate();

    // const decodedAuthorityKey = new Uint8Array(
    //   JSON.parse(
    //     fs.readFileSync(path.join(__dirname, "../../../authority.json")).toString()
    //   )
    // );

    // let authority = Keypair.fromSecretKey(decodedAuthorityKey);
    this.myResponse(res, 200, null, "set workflow");
  };
} // end of MintController

export default new SmartController();
