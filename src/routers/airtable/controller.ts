import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import { Connection, Client, ConnectionOptions } from "@temporalio/client";
import {
  createMintWF,
  getMintAddress,
  getUpdatedMintAddress,
  updateMintWF,
} from "../../workflows/mint/workflows";
import * as activities from "./../../workflows/airtable/activities";
import { plainToClass, plainToClassFromExist } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import Airtable from "airtable";
import { AirTableDTO } from "../../models/airTableDto";
import { createRecordAirTableWF, deleteRecordAirTableWF, getAllAirTableWF, getRecordAirTableWF, updateRecordAirTableWF } from "../../workflows/airtable/workflows";
import { NativeConnection, Worker } from "@temporalio/worker";
import { getConnectionAirTable } from "../../services/airTable";
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

class AirTableController extends controller {

  getAllRecord=async(req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(getAllAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  }


  getRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(getRecordAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, {}, "set workflow");
  };

  createRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(createRecordAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, {}, "set workflow");
  };

  updateRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(updateRecordAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, {}, "set workflow");
  };

  deleteRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(deleteRecordAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, {}, "set workflow");
  };

  startWorkerAirTable = async (req: Request, res: Response) => {
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
      workflowsPath: require.resolve("./../../workflows/airtable/workflows"),
      activities,
      taskQueue: "airtable",
    });
    worker.run();
    res.send("worker run");
  };
} // end of AirTableController

export default new AirTableController();
