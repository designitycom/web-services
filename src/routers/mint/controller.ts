import controller from "../controller";
import { Request, Response } from "express";
import { createMintWF, getAllNFTWF, getCreatedNft, getUpdatedMintAddress, getUserNft, updateMintWF, checkUserThenCreateNftWF, getUserNftAfterCheck, getMagicLinkFromAirtableWF , getUserMagicLinkFromAirtable} from "../../workflows/mint/workflows";
import { plainToClass } from "class-transformer";
import { MintDTO } from "../../models/mintDto";
import {  getEmailFromIdToken, getWalletPublicKeyFromIdToken } from "../../services/solana";
import { createTemporalClient } from "../../services/temporal";
import { UserDTO } from "../../models/userDto";


class MintController extends controller {
  createMint = async (req: Request, res: Response) => {
    const mintDTO = await plainToClass(MintDTO, req.body);
    const idToken=req.headers["id-token"]!;
    mintDTO.publicKey=await getWalletPublicKeyFromIdToken(idToken.toString());
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
    mintDTO.publicKey=await getWalletPublicKeyFromIdToken(idToken.toString());
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
//ASH------------------------->
getAllNFT = async (req: Request, res: Response) => {
  const userDTO = new UserDTO;
  const idToken = req.headers["id-token"]!;
  userDTO.publicKey = await getWalletPublicKeyFromIdToken(idToken.toString());
  const client = await createTemporalClient();
  const workFlowId = "user-" + req.body.wfId;
  const handle = await client.workflow.start(getAllNFTWF, {
    args: [userDTO],
    taskQueue: "mint",
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
  await handle.result();
  console.log("complete");
  console.log(`Workflow Started `);
  this.myResponse(res, 200, val, "set workflow");
};


checkUserThenCreateNft = async(req:Request, res:Response)=>{
  const idToken = req.headers["id-token"]!;
  // const userEmail = await getEmailFromIdToken(idToken.toString());
  const userDTO = new UserDTO 
  userDTO.publicKey = await getWalletPublicKeyFromIdToken(idToken.toString());
  userDTO.email = await getEmailFromIdToken(idToken.toString());
  const client = await createTemporalClient();
  const workFlowId = "user-" + req.body.wfId;
  const handle = await client.workflow.start(checkUserThenCreateNftWF, {
    args: [userDTO],
    taskQueue: "mint",
    workflowId: workFlowId,
  });
  this.myResponse(res, 200, workFlowId, "set workflow");
}

returnDataFromCheckUserThenCreateNft = async (req: Request, res: Response) => {
  const workFlowId = req.params.workFlowId;
  const client = await createTemporalClient();
  console.log(workFlowId);
  const handle = client.workflow.getHandle(workFlowId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const val = await handle.query(getUserNftAfterCheck);
  await handle.result();
  console.log("complete");
  console.log(`Workflow Started `);
  this.myResponse(res, 200, val, "set workflow"); 
};


getMagicLinkFromAirtable =async (req:Request, res: Response) => {
  const idToken = req.headers["id-token"]!;
  const userDTO = new UserDTO 
  userDTO.email=await getEmailFromIdToken(idToken.toString());
  const client = await createTemporalClient();
  const workFlowId = "user-" + req.body.wfId;
  const handle = await client.workflow.start(getMagicLinkFromAirtableWF, {
    args: [userDTO],
    taskQueue: "mint",
    workflowId: workFlowId,
  });
  this.myResponse(res, 200, workFlowId, "set workflow");
}

returnLogedinUserAiritableMagigLink = async (req:Request, res:Response)=>{
  const workFlowId = req.params.workFlowId;
  const client = await createTemporalClient();
  console.log("wfid>>>", workFlowId)
  const handle = client.workflow.getHandle(workFlowId);
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const val = await handle.query(getUserMagicLinkFromAirtable);
  await handle.result();
  console.log("complete");
  console.log(`Workflow Started `);
  this.myResponse(res, 200, val, "set workflow");
}


}// end of MintController

export default new MintController();
