import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Nft, NftWithToken, PublicKey, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";
import { AirTableDTO } from "../../models/airTableDto";
import {
  findRecordWithEmailWF,
  updateRecordAirTableWF,
} from "../airtable/workflows";

import { getAllNFTWF } from "../user/workflows";

const {
  getScoreAccount,
  register,
  createRegisterMint,
  getMetaplexNFT
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
export const getCreatedNft = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getCreatedNft");

export const getUserNft = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getUserNft");
export async function getAllNFTWFinMint(userDTO: UserDTO): Promise<string> {
  wf.setHandler(getUserNft, () => userNFT);
  const userNFT = await wf.executeChild(getAllNFTWF, {
    args: [userDTO],
    workflowId: "child-" + userDTO.wfId,
    taskQueue: "user",
  });

  return "ok";
}

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
  console.log("scoreAccount>>>>>",scoreAccount  );
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
    scoreAccount = await register(airTableDTO.name, userDTO.publicKey, registerMintAddress, [airTableDTO.level, airTableDTO.role]);
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
