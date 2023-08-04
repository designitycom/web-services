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
export async function checkEmailWF(userDTO: UserDTO): Promise<UserDTO> {
  let status = "check email process started";

  wf.setHandler(getStatus, () => status);
  wf.setHandler(handleUserDTO, () => userDTO);

  userDTO = await getUserDto(userDTO);

  status = "check email process completed";

  return userDTO;
}
//---------------------------------------------------------
export const getUserNft = wf.defineQuery<Nft | Sft | SftWithToken | NftWithToken>("getUserNft");
export async function getAllNFTWF(userDTO: UserDTO): Promise<Nft | Sft | SftWithToken | NftWithToken > {
  const userNFT = await getAllNFT(userDTO);
  return userNFT;
}


