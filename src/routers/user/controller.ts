import controller from "../controller";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import {
  getUserNft,
  checkEmailWF,
  getAllNFTWF,
  handleUserDTO,
} from "../../workflows/user/workflows";
import { UserDTO } from "../../models/userDto";
import "dotenv/config";
import { getPKIDToken } from "../../services/solana";
import { createTemporalClient } from "../../services/temporal";

class UserController extends controller {

  checkEmail = async (req: Request, res: Response) => {
    const userDTO = await plainToClass(UserDTO, req.body);
    console.log("user email", req.body);
    console.log("user email", userDTO.email);
    const client = await createTemporalClient();    
    console.log("after temporal");
    const workFlowId = "user-" + userDTO.wfId;
    const handle = await client.workflow.start(checkEmailWF, {
      args: [userDTO],
      taskQueue: "user",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  getAllUserDTO = async (req: Request, res: Response) => {
    const workFlowId = req.params.workFlowId;
    const client = await createTemporalClient();
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const val = await handle.query(handleUserDTO);
    console.log(val);
    await handle.result();
    console.log("complete");

    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");
  };

  getAllNFT = async (req: Request, res: Response) => {
    const userDTO = await plainToClass(UserDTO, req.body);
    const idToken = req.headers["id-token"]!;
    userDTO.publicKey = await getPKIDToken(idToken.toString());
    const client = await createTemporalClient();
    const workFlowId = "user-" + userDTO.wfId;
    const handle = await client.workflow.start(getAllNFTWF, {
      args: [userDTO],
      taskQueue: "user",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  checkGetAllNFTs = async (req: Request, res: Response) => {
    const workFlowId = req.params.workFlowId;
    const client = await createTemporalClient();
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const val = await handle.query(getUserNft);
    console.log(val);
    await handle.result();
    console.log("complete");
    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");
  };


} //end UserController

export default new UserController();
