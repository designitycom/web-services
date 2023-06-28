import * as wf from "@temporalio/workflow";
import { proxyActivities } from "@temporalio/workflow";
import type * as activities from "./activities";
import { UserDTO } from "../../models/userDto";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";

const { getUserDto, getAllNFT } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});
//---------------------------------------------------------
export const getStatus = wf.defineQuery<string>("getStatus");
export const handleUserDTO = wf.defineQuery<UserDTO>("handleUserDTO");
export async function checkEmailWF(userDTO: UserDTO): Promise<string> {
  let status = "check email process started";

  wf.setHandler(getStatus, () => status);
  wf.setHandler(handleUserDTO, () => userDTO);

  userDTO = await getUserDto(userDTO);

  status = "check email process completed";

  return "ok";
}
//---------------------------------------------------------
export const getMintAddress = wf.defineQuery<string>("getMintAddress");
export async function getAllNFTWF(userDTO: UserDTO): Promise<string> {
  let mintAddress="";
  wf.setHandler(getMintAddress, () => mintAddress);
  const allNFT = await getAllNFT(userDTO);
  mintAddress=allNFT.address.toString();
  console.log("in workflow>>>>>>>>>", allNFT);

  return "ok";
}


