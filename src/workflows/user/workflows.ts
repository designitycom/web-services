import * as wf from "@temporalio/workflow";
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { UserDTO } from "../../models/userDto";


const { getUserDto, getAllNFT,  } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");

export async function checkEmailWF(userDTO: UserDTO): Promise<string> {
  let status = "check email process started";

  wf.setHandler(getStatus, () => status);

  userDTO = await getUserDto(userDTO);

  status = "check email process completed";

  return "ok";
}

//ASH????
export const allNFT = wf.defineQuery<string>('allNFT');
//ASH
export async function getAllNFTWF(userDTO: UserDTO): Promise<string> {
const allNFT = await getAllNFT(userDTO)
console.log("in workflow>>>>>>>>>", allNFT)

  return "ok";
}

export async function getNFTDetailsWF(workFlowId2:string): Promise <String>{


  return allNFT 
}


