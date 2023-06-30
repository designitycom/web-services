import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import { Connection, Client, ConnectionOptions } from "@temporalio/client";
import { createMintWF, getMintAddress, getUpdatedMintAddress, updateMintWF } from "../../workflows/mint/workflows";
import * as activities from "./../../workflows/mint/activities";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import { NativeConnection, Worker } from "@temporalio/worker";
import { getKeyPair, getPKIDToken, publicKeyFromBn } from "../../services/solana";
import { PublicKey } from "@metaplex-foundation/js";
import bs58 from "bs58";
import { createTemporalClient } from "../../services/temporal";

// let temporalConnConfig: ConnectionOptions;

// if (
//   process.env.NODE_ENV === "production" ||
//   process.env.NODE_ENV === "sandbox"
// ) {
//   temporalConnConfig = {
//     address: process.env.TEMPORAL_ADDRESS!,
//     tls: {
//       clientCertPair: {
//         crt: Buffer.from(
//           fs.readFileSync(process.env.TEMPORAL_TLS_CRT!, "utf8")
//         ),
//         key: Buffer.from(
//           fs.readFileSync(process.env.TEMPORAL_TLS_KEY!, "utf8")
//         ),
//       },
//     },
//   };
// }

class MintController extends controller {
  createMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    const idToken=req.headers["id-token"]!;
    mintDTO.publicKey=await getPKIDToken(idToken.toString());
    const client = await createTemporalClient();
    // const connection = await Connection.connect(temporalConnConfig);
    // const client = new Client({
    //   connection,
    //   namespace: process.env.TEMPORAL_NAMESPACE || "default",
    // });
    const workFlowId = "mint-" + mintDTO.wfId;
    const handle = await client.workflow.start(createMintWF, {
      args: [mintDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    console.log(`In Controller, mint workflow started`);  
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  updateMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    const idToken=req.headers["id-token"]!;
    mintDTO.publicKey=await getPKIDToken(idToken.toString());
    const client = await createTemporalClient();
    // const connection = await Connection.connect(temporalConnConfig);
    // const client = new Client({
    //   connection,
    //   namespace: process.env.TEMPORAL_NAMESPACE || "default",
    // });
    const workFlowId = "mint-" + mintDTO.wfId;
    const handle = await client.workflow.start(updateMintWF, {
      args: [mintDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    console.log(`Start update workflow`);
    this.myResponse(res, 200, mintDTO, "hhh");
  };

  startWorkerMint = async (req: Request, res: Response) => {
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
      workflowsPath: require.resolve("./../../workflows/mint/workflows"),
      activities,
      taskQueue: "mint",
    });
    worker.run();
    res.send("worker run");
  };
//-------------
  getMintedTokenData = async (req:Request, res:Response)=>{
    const workFlowId = req.params.workFlowId
    const client = await createTemporalClient();
    // const connection = await Connection.connect(temporalConnConfig);
    // const client = new Client({
    //   connection,
    //   namespace: process.env.TEMPORAL_NAMESPACE || "default",
    // });
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("mint controller after temporal connection")
    const val = await handle.query(getMintAddress);
    console.log(val);

    await handle.result();
    console.log("complete");


    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");

  }

  getUpdatedMintTokenData = async (req:Request, res:Response)=>{
    const workFlowId = req.params.workFlowId
    const client = await createTemporalClient();
    // const connection = await Connection.connect(temporalConnConfig);
    // const client = new Client({
    //   connection,
    //   namespace: process.env.TEMPORAL_NAMESPACE || "default",
    // });
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("mint controller after temporal connection")
    const val = await handle.query(getUpdatedMintAddress);
    console.log(val);

    await handle.result();
    console.log("complete");


    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow"); 
  }

}// end of MintController

export default new MintController();
