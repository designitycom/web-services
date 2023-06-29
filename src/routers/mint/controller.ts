import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import { Connection, Client, ConnectionOptions } from "@temporalio/client";
import { createMintWF, updateMintWF } from "../../workflows/mint/workflows";
import * as activities from "./../../workflows/mint/activities";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import { NativeConnection, Worker } from "@temporalio/worker";
import { getKeyPair, getPKIDToken, publicKeyFromBn } from "../../services/solana";
import { PublicKey } from "@metaplex-foundation/js";
import bs58 from "bs58";

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

class MintController extends controller {
  createMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    mintDTO.publicKey=await getPKIDToken(mintDTO.idToken);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "mint-" + mintDTO.wfId;
    const handle = await client.workflow.start(createMintWF, {
      args: [mintDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    console.log(`Started workflow`);
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  updateMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    mintDTO.publicKey=await getPKIDToken(mintDTO.idToken);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
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
}

export default new MintController();
