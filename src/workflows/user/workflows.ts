import * as wf from "@temporalio/workflow";
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { UserDTO } from "../../models/userDto";

const { getUserDto } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");

export async function checkEmailWF(userDTO: UserDTO): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  userDTO= await getUserDto(userDTO);
  
  return "ok";
}
export async function getAllNFT(): Promise<string> {
  return "ok";
}
