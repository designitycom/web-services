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
  submitScore,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
  retry:{
    maximumAttempts:4
  }
});

export const getUserNftAfterCheck = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken | null
>("getUserNftAfterCheck");
export const getUserScore = wf.defineQuery<any>("getUserScore");
export async function checkUserThenCreateNftWF(
  userDTO: UserDTO
): Promise<string> {
  let scoreAccount: any;
  let userNFTAfterCheck: Nft | Sft | SftWithToken | NftWithToken | null = null;
  wf.setHandler(getUserNftAfterCheck, () => userNFTAfterCheck);
  wf.setHandler(getUserScore, () => scoreAccount);
  scoreAccount = await getScoreAccount(userDTO.publicKey);
  while (scoreAccount === undefined) {
    let record = await wf.executeChild(findRecordWithEmailWF, {
      args: [userDTO.email],
      workflowId: "child-check-" + userDTO.wfId,
      taskQueue: "airtable",
    });
    if (!record) {
      return "not found";
    }
    record.fields["Wallet Address"] = userDTO.publicKey;
    const registerMintAddress = await createRegisterMint();
    try {
      const txSig = await register(record.fields, registerMintAddress);
      if (txSig) {
        record.fields["Token Address"] = registerMintAddress;
        await verify(record.fields["Wallet Address"]);
        await wf.executeChild(updateSoftrCreativeUsersWF, {
          args: [record.id, record.fields],
          workflowId: "child-update-" + userDTO.wfId,
          taskQueue: "airtable",
        });
        scoreAccount = await getScoreAccount(userDTO.publicKey);
      }
    } catch (err) {
      console.log(err);
    }
  }
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
    workflowId: "child-" + userDTO.wfId,
    taskQueue: "airtable",
  });

  logedinUserAiritableMagigLink = String(record?.fields["Magic Link"]);

  return "ok";
}

export async function submitScoreWF(fields: ICreativesScoresAirtable) {
  try {
    return await submitScore(fields);
  } catch (err) {
    console.error(err);
  }
  return null;
}
