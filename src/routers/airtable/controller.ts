import controller from "../controller";
import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { AirTableDTO } from "../../models/airTableDto";
import {
  processPendingScoresWF,
} from "../../workflows/airtable/workflows";
import { createTemporalClient } from "../../services/temporal";

class AirTableController extends controller {
  processPendingScores = async (req: Request, res: Response) => {
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


}

export default new AirTableController();
