import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import * as activities from "./../../workflows/airtable/activities";
import { plainToClass } from "class-transformer";
import { AirTableDTO } from "../../models/airTableDto";
import {
  createRecordAirTableWF,
  deleteRecordAirTableWF,
  getAllAirTableWF,
  getRecordAirTableWF,
  updateRecordAirTableWF,
} from "../../workflows/airtable/workflows";
import { NativeConnection, Worker } from "@temporalio/worker";
import { createTemporalClient } from "../../services/temporal";

class AirTableController extends controller {

  getAllRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const client = await createTemporalClient();
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(getAllAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, workFlowId, "set workflow");
  };

  getRecord = async (req: Request, res: Response) => {
    const airTableDto = await plainToClass(AirTableDTO, req.body);
    const client = await createTemporalClient();
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
    const client = await createTemporalClient();
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
    const client = await createTemporalClient();
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
    const client = await createTemporalClient();
    const workFlowId = "airtable-" + airTableDto.wfId;
    const handle = await client.workflow.start(deleteRecordAirTableWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId,
    });
    console.log(`Workflow Started `);
    this.myResponse(res, 200, {}, "set workflow");
  };

  // startWorkerAirTable = async (req: Request, res: Response) => {
  //   const connection = await NativeConnection.connect({
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
  //   });
  //   const worker = await Worker.create({
  //     connection,
  //     namespace: process.env.TEMPORAL_NAMESPACE || "default",
  //     workflowsPath: require.resolve("./../../workflows/airtable/workflows"),
  //     activities,
  //     taskQueue: "airtable",
  //   });
  //   worker.run();
  //   res.send("worker run");
  // };
} // end of AirTableController

export default new AirTableController();
