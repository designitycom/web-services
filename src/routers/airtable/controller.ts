import controller from "../controller";
import { Request, Response } from "express";
import fs from "fs";
import * as activities from "./../../workflows/airtable/activities";
import { plainToClass } from "class-transformer";
import { AirTableDTO } from "../../models/airTableDto";
import {
  findRecordWithEmailWF,
  // getRecordAirTableWF,
  processPendingScoresWF,
  updateRecordAirTableWF,
} from "../../workflows/airtable/workflows";
import { NativeConnection, Worker } from "@temporalio/worker";
import { createTemporalClient } from "../../services/temporal";

class AirTableController extends controller {

  //   const airTableDto = await plainToClass(AirTableDTO, req.body);
  //   const client = await createTemporalClient();
  //   const workFlowId = "airtable-" + airTableDto.wfId;
  //   const handle = await client.workflow.start(getRecordAirTableWF, {
  //     args: [airTableDto],
  //     taskQueue: "airtable",
  //     workflowId: workFlowId,
  //   });
  //   console.log(`Workflow Started `);
  //   this.myResponse(res, 200, {}, "set workflow");
  // };

  processPendingScores = async (req: Request, res: Response)=>{
    const airTableDto = plainToClass(AirTableDTO, req.body);
    console.log(`started ${airTableDto.wfId} `);
    const client = await createTemporalClient();
    const workFlowId = "airtable-" + airTableDto.wfId;
    client.workflow.start(processPendingScoresWF, {
      args: [airTableDto],
      taskQueue: "airtable",
      workflowId: workFlowId
    });
    this.myResponse(res, 200, {}, "set workflow");
  };


} // end of AirTableController

export default new AirTableController();
