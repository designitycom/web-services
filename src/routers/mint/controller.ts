import controller from "../controller";
import { Request, Response } from "express";
import {  checkUserThenCreateNftWF, getUserNftAfterCheck, getMagicLinkFromAirtableWF, getUserMagicLinkFromAirtable, getUserScore } from "../../workflows/mint/workflows";
import { plainToClass } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import { getEmailFromIdToken, getWalletPublicKeyFromIdToken } from "../../services/solana";
import { createTemporalClient } from "../../services/temporal";
import { UserDTO } from "../../models/userDto";


class MintController extends controller {
  
  checkUserThenCreateNft = async (req: Request, res: Response) => {
    const idToken = req.headers["id-token"]!;
    // const userEmail = await getEmailFromIdToken(idToken.toString());
    const userDTO = new UserDTO
    userDTO.publicKey = await getWalletPublicKeyFromIdToken(idToken.toString());
    userDTO.email = await getEmailFromIdToken(idToken.toString());
    const client = await createTemporalClient();
    const workFlowId = "user-" + req.body.wfId;
    userDTO.wfId = workFlowId;
    const handle = await client.workflow.start(checkUserThenCreateNftWF, {
      args: [userDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    this.myResponse(res, 200, workFlowId, "set workflow");
  }

  returnDataFromCheckUserThenCreateNft = async (req: Request, res: Response) => {
    const workFlowId = req.params.workFlowId;
    const client = await createTemporalClient();
    const handle = client.workflow.getHandle(workFlowId);
    try {
      const val = await handle.query(getUserNftAfterCheck);
      const valScore = await handle.query(getUserScore);
      await handle.result();
      let result={
        myNFT:val,
        scores:valScore
      }
      this.myResponse(res, 200, result, "set workflow");
    } catch (err) {
      this.myResponse(res, 500, err, "return data");
    }
  };


  getMagicLinkFromAirtable = async (req: Request, res: Response) => {
    const idToken = req.headers["id-token"]!;
    const userDTO = new UserDTO
    userDTO.email = await getEmailFromIdToken(idToken.toString());
    const client = await createTemporalClient();
    const workFlowId = "user-" + req.body.wfId;
    userDTO.wfId = workFlowId;
    const handle = await client.workflow.start(getMagicLinkFromAirtableWF, {
      args: [userDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    this.myResponse(res, 200, workFlowId, "set workflow");
  }

  returnLogedinUserAiritableMagigLink = async (req: Request, res: Response) => {
    const workFlowId = req.params.workFlowId;
    const client = await createTemporalClient();
    console.log("wfid>>>", workFlowId)
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const val = await handle.query(getUserMagicLinkFromAirtable);
    await handle.result();
    console.log("complete");
    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");
  }


}// end of MintController

export default new MintController();
