import controller from "../controller";
import { Request, Response } from "express";
import { createMintWF, getCreatedNft, getUpdatedMintAddress, updateMintWF } from "../../workflows/mint/workflows";
import { plainToClass } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import {  getPKIDToken } from "../../services/solana";
import { createTemporalClient } from "../../services/temporal";


class MintController extends controller {
  createMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    const idToken=req.headers["id-token"]!;
    mintDTO.publicKey=await getPKIDToken(idToken.toString());
    //ash
    console.log(" this is user public key in controller", mintDTO.publicKey)
    const client = await createTemporalClient();
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
    const workFlowId = "mint-" + mintDTO.wfId;
    const handle = await client.workflow.start(updateMintWF, {
      args: [mintDTO],
      taskQueue: "mint",
      workflowId: workFlowId,
    });
    console.log(`Start update workflow`);
    this.myResponse(res, 200, mintDTO, "hhh");
  };

//-------------
  getMintedTokenData = async (req:Request, res:Response)=>{
    const workFlowId = req.params.workFlowId
    const client = await createTemporalClient();
    console.log(workFlowId);
    const handle = client.workflow.getHandle(workFlowId);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("mint controller after temporal connection")
    const val = await handle.query(getCreatedNft);
    console.log(val);
    await handle.result();
    console.log("complete");
    console.log(`Workflow Started `);
    this.myResponse(res, 200, val, "set workflow");
  }

  getUpdatedMintTokenData = async (req:Request, res:Response)=>{
    const workFlowId = req.params.workFlowId
    const client = await createTemporalClient();
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
