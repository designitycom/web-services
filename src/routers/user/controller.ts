import { Client, Connection, ConnectionOptions } from "@temporalio/client";
import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { checkEmailWF,getAllNFTWF } from "../../workflows/user/workflows";
import { UserDTO } from "../../models/userDto";
import 'dotenv/config';
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./../../workflows/user/activities";

let temporalConnConfig: ConnectionOptions;

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "sandbox"
) {
  temporalConnConfig = {
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
  };
}

class UserController extends controller {
 
  //ASH>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  checkEmail = async (req: Request, res: Response) => {
    const userDTO = await plainToClass(UserDTO, req.body);
    console.log ("user email", userDTO.email)
    const connection = await Connection.connect(temporalConnConfig);
    console.log("connection confirmed  ")
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
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

  getAllNFT= async(req:Request, res:Response)=>{
    const userDTO = await plainToClass(UserDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "user-" + userDTO.wfId;
    const handle = await client.workflow.start(getAllNFTWF, {
      args: [userDTO],
      taskQueue: "user",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
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
}

export default new UserController();
