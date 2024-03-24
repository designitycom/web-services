import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import { Record } from "airtable";
import type * as activities from "./activities";
import { AirTableDTO } from "../../models/airTableDto";
import { submitScoreWF } from "../mint/workflows";

const {
  updateSoftrCreativeUsers,
  getCreativeWallet,
  getPendingScores,
  findRecordWithEmail,
  updateScoreTX
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");

export async function updateSoftrCreativeUsersWF(
  recordId: string,
  record: activities.ISoftrCreativesUser
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call updateRecord");
  await updateSoftrCreativeUsers(recordId, record);
  console.log("end step:end updateRecord");
  status = "end";

  return "ok";
}



export async function findRecordWithEmailWF(
  email: string
): Promise<Record<activities.ISoftrCreativesUser> | undefined> {
  let status = "start";
  console.log("Came in find record with email");
  wf.setHandler(getStatus, () => status);
  console.log("start step 1:call find record with email");
  const record = await findRecordWithEmail(email);
  console.log("end step:end find record with email");
  status = "end";
  return record;
}


export async function processPendingScoresWF(airtableDTO: AirTableDTO) {
  const pendingScores = await getPendingScores();
  //console.log("pending score length",pendingScores.length);
  if(pendingScores.length>0){
    //console.log("pending scores",pendingScores[0]);
      //console.log("pending scores fields",pendingScores[0].fields["Score Eligible?"]);
    for (const p of pendingScores) {
      
      if (p.fields["Score Eligible?"] !== "Yes") {
        continue;
      }
      const tx = await wf.executeChild(submitScoreWF, {
        args: [p.fields],
        workflowId: `child-submitscore-${airtableDTO.wfId}-${p.id}`,
        taskQueue: "mint",
      });
      if (tx) {
        await updateScoreTX(p.id, tx);
      }
    }
  }
  //console.log("score eligible?",pendingScores[0].fields["Score Eligible?"]);
  //console.log("score eligible",pendingScores[0].fields["Score_Eligible"]);
  /*for (const p of pendingScores) {
    if (p.fields["Score Eligible"] !== "Yes") {
    //if (p.fields["Score Eligible?"] !== "Yes") {
      continue;
    }
    const tx = await wf.executeChild(submitScoreWF, {
      args: [p.fields],
      workflowId: `child-submitscore-${airtableDTO.wfId}-${p.id}`,
      taskQueue: "mint",
    });
    if (tx) {
      await updateScoreTX(p.id, tx);
    }
  }*/
}