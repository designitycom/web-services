import { Client, Connection, ConnectionOptions } from "@temporalio/client";
import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { getMintAddress, checkEmailWF, getAllNFTWF, handleUserDTO} from "../../workflows/user/workflows";
import { UserDTO } from "../../models/userDto";
import 'dotenv/config';
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./../../workflows/user/activities";
import { getPKIDToken } from "../../services/solana";
import { createTemporalClient } from "../../services/temporal";


class UserController extends controller {

  //ASH>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  checkEmail = async (req: Request, res: Response) => {
    const userDTO = await plainToClass(UserDTO, req.body);
    console.log("user email", userDTO.email)
    const client = await createTemporalClient();
    console.log("after temporal")
    const workFlowId = "user-" + userDTO.wfId;
    const handle = await client.workflow.start(checkEmailWF, {
      args: [userDTO],
      taskQueue: "user",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  getAllUserDTO= async (req: Request, res: Response)=>{
    const workFlowId = req.params.workFlowId
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
  }
//----------------------------
  getAllNFT = async (req: Request, res: Response) => {
    const userDTO = await plainToClass(UserDTO, req.body);
    const idToken=req.headers["id-token"]!;
    userDTO.publicKey=await getPKIDToken(idToken.toString());
    const client = await createTemporalClient();
    const workFlowId = "user-" + userDTO.wfId;
    const handle = await client.workflow.start(getAllNFTWF, {
      args: [userDTO],
      taskQueue: "user",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  }

  checkGetAllNFTs = async (req: Request, res: Response) => {
    const workFlowId = req.params.workFlowId
    const client = await createTemporalClient();
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const val = await handle.query(getMintAddress);
    console.log(val);

    await handle.result();
    console.log("complete");


    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");

  }

  startWorkerUser = async (req: Request, res: Response) => {
    const connection = await NativeConnection.connect({
      address: process.env.TEMPORAL_ADDRESS!,
      tls: {
        clientCertPair: {
          crt: Buffer.from(
            fs.readFileSync(process.env.TEMPORAL_TLS_CRT!, "utf8")
          ),
          key: Buffer.from(
            fs.readFileSync(process.env.TEMPORAL_TLS_KEY!, "utf8")
          ),
        },
      },
    });
    const worker = await Worker.create({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
      workflowsPath: require.resolve("./../../workflows/user/workflows"),
      activities,
      taskQueue: "user",
    });
    worker.run();
    res.send("worker run");
  };


}//end UserController 

export default new UserController();
