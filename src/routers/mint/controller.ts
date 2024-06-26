import controller from "../controller";
import { NextFunction, Response } from "express";
import {
  checkUserThenCreateNftWF,
  getUserNftAfterCheck,
  getMagicLinkFromAirtableWF,
  getUserMagicLinkFromAirtable,
  getUserScore,
} from "../../workflows/mint/workflows";
import { createTemporalClient } from "../../services/temporal";
import { UserDTO } from "../../models/userDto";
import { CustomRequest } from "../../middlewares/validator";

class MintController extends controller {
  checkUserThenCreateNft = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userDTO = new UserDTO();
      userDTO.publicKey = req.publicKey!;
      userDTO.email = req.email!;
      const client = await createTemporalClient();
      const workFlowId = "user-create-nft-" + userDTO.publicKey;
      userDTO.wfId = workFlowId;
      const handle = await client.workflow.start(checkUserThenCreateNftWF, {
        args: [userDTO],
        taskQueue: "mint",
        workflowId: workFlowId,
      });
      this.myResponse(res, 200, workFlowId, "set workflow");
    } catch (e) {
      next(e);
    }
  };

  returnDataFromCheckUserThenCreateNft = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const publicKey = req.publicKey!;
      console.log("public key",publicKey);
      const workFlowId = "user-create-nft-" + publicKey;
      const client = await createTemporalClient();
      const handle = client.workflow.getHandle(workFlowId);
      console.log("handle",handle);
      const val = await handle.query(getUserNftAfterCheck);

      const valScore = await handle.query(getUserScore);
      await handle.result();
      let result = {
       myNFT: val,
        scores: valScore,
      };
      this.myResponse(res, 200, result, "");
    } catch (err) {
      next();
    }
  };

  getMagicLinkFromAirtable = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userDTO = new UserDTO();
      userDTO.publicKey = req.publicKey!;
      userDTO.email = req.email!;
      const client = await createTemporalClient();
      const workFlowId = "user-magic-link-" + userDTO.publicKey;
      userDTO.wfId = workFlowId;
      const handle = await client.workflow.start(getMagicLinkFromAirtableWF, {
        args: [userDTO],
        taskQueue: "mint",
        workflowId: workFlowId,
      });
      this.myResponse(res, 200, workFlowId, "set workflow");
    } catch (e) {
      next(e);
    }
  };

  returnLogedinUserAiritableMagigLink = async (
    req: CustomRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const publicKey = req.publicKey!;
      const workFlowId = "user-magic-link-" + publicKey;
      const client = await createTemporalClient();
      const handle = client.workflow.getHandle(workFlowId);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      const val = await handle.query(getUserMagicLinkFromAirtable);
      await handle.result();
      this.myResponse(res, 200, val, "");
    } catch (err) {
      next();
    }
  };
} // end of MintController

export default new MintController();
