import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";
import { AirTableDTO } from "../../models/airTableDto";
import {
  findRecordWithEmailWF,
  updateRecordAirTableWF,
} from "../airtable/workflows";

import { IGrowthMasterAirtable } from "../airtable/activities";

const {
  getScoreAccount,
  register,
  createRegisterMint,
  getMetaplexNFT,
  verify,
  submitScore
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});



export const getUserNftAfterCheck = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken | null
>("getUserNftAfterCheck");
export const getUserScore = wf.defineQuery<any>("getUserScore");
export async function checkUserThenCreateNftWF(
  userDTO: UserDTO
): Promise<string> {
  let userScore:any= null;
  let userNFTAfterCheck: Nft | Sft | SftWithToken | NftWithToken | null = null;
  wf.setHandler(getUserNftAfterCheck, () => userNFTAfterCheck);
  wf.setHandler(getUserScore, () => userScore);
  console.log("checking score account");
  let scoreAccount = await getScoreAccount(userDTO.publicKey);
  if (scoreAccount == undefined) {
    let airTableDTO = new AirTableDTO();
    airTableDTO.email = userDTO.email;
    airTableDTO.wfId  = userDTO.wfId;
    airTableDTO = await wf.executeChild(findRecordWithEmailWF, {
      args: [airTableDTO],
      workflowId: "child-checkuser-" + userDTO.wfId,
      taskQueue: "airtable",
    });
    if (!airTableDTO.name) {
      return "not found";
    }
    const registerMintAddress = await createRegisterMint();
    scoreAccount = await register(airTableDTO.name, userDTO.publicKey, registerMintAddress, [airTableDTO.level, airTableDTO.status]);
    await verify(userDTO.publicKey);
    airTableDTO.walletAddress = userDTO.publicKey;
    airTableDTO.tokenAddress = scoreAccount.mint;
    await wf.executeChild(updateRecordAirTableWF, {
      args: [airTableDTO],
      workflowId: "child-updateuser-" + airTableDTO.wfId,
      taskQueue: "airtable",
    });
    console.log("scoreAccount>>>", scoreAccount);
  }
  userScore=scoreAccount;
  userNFTAfterCheck = await getMetaplexNFT(scoreAccount.mint);
  return "ok";
}

export const getUserMagicLinkFromAirtable = wf.defineQuery<string>(
  "getUserMagicLinkFromAirtable"
);
export async function getMagicLinkFromAirtableWF(
  userDTO: UserDTO
): Promise<string> {
  let logedinUserAiritableMagigLink = "";
  wf.setHandler(
    getUserMagicLinkFromAirtable,
    () => logedinUserAiritableMagigLink
  );
  //--    
  const airTableDTO = new AirTableDTO();
  airTableDTO.email = userDTO.email;
  const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
    args: [airTableDTO],
    workflowId: "child-magiclink-" + userDTO.wfId,
    taskQueue: "airtable",
  });
  //--
  logedinUserAiritableMagigLink = updatedAirTableDTO.magicLink;
  console.log("MagicLinkFromAirtableWF>>>", logedinUserAiritableMagigLink);

  return "ok";
}

export async function submitScoreWF(applicant: string, score: IGrowthMasterAirtable){
  console.log("before submitScoreWF", score);
  return await submitScore(applicant, score);
}