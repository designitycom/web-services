import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import { Record } from "airtable";

import type * as activities from "./activities";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";
import {
  findRecordWithEmailWF,
  updateSoftrCreativeUsersWF,
} from "../airtable/workflows";

import { ICreativesScoresAirtable } from "../airtable/activities";

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
  let userScore: any = null;
  let userNFTAfterCheck: Nft | Sft | SftWithToken | NftWithToken | null = null;
  wf.setHandler(getUserNftAfterCheck, () => userNFTAfterCheck);
  wf.setHandler(getUserScore, () => userScore);
  console.log("checking score account");
  let scoreAccount = await getScoreAccount(userDTO.publicKey);
  if (scoreAccount == undefined) {
    let record = await wf.executeChild(findRecordWithEmailWF, {
      args: [userDTO.email],
      workflowId: "child-checkuser-" + userDTO.wfId,
      taskQueue: "airtable",
    });
    if (!record) {
      return "not found";
    }
    record.fields["Wallet Address"] = userDTO.publicKey;
    const registerMintAddress = await createRegisterMint();
    scoreAccount = await register(record, registerMintAddress);
    record.fields["Token Address"] = registerMintAddress;
    await verify(record.fields["Wallet Address"]);
    await wf.executeChild(updateSoftrCreativeUsersWF, {
      args: [record],
      workflowId: "child-updateuser-" + userDTO.wfId,
      taskQueue: "airtable",
    });
    console.log("scoreAccount>>>", scoreAccount);
  }
  userScore = scoreAccount;
  userNFTAfterCheck = await getMetaplexNFT(scoreAccount.mint!);
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
  const record = await wf.executeChild(findRecordWithEmailWF, {
    args: [userDTO.email],
    workflowId: "child-magiclink-" + userDTO.wfId,
    taskQueue: "airtable",
  });

  logedinUserAiritableMagigLink = String(record?.fields["Magic Link"]);

  return "ok";
}

export async function submitScoreWF(score: Record<ICreativesScoresAirtable>) {
  return await submitScore(score.fields);
}