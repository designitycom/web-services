import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { AirTableDTO } from "../../models/airTableDto";

const { getAllRecord, getRecord,createRecord,updateRecord,deleteRecord,findRecordWithEmail,childAirtable } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");

export async function getAllAirTableWF(
  airTableDto: AirTableDTO
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call getAllRecord");
  const airtable = await getAllRecord(airTableDto);
  console.log("end step:end getAllRecord");
  status = "end";

  return "ok";
}

export async function getRecordAirTableWF(
  airTableDto: AirTableDTO
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call getRecord");
  await getRecord(airTableDto);
  console.log("end step:end getRecord");
  status = "end";

  return "ok";
}


export async function createRecordAirTableWF(
  airTableDto: AirTableDTO
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call createRecord");
  await createRecord(airTableDto);
  console.log("end step:end createRecord");
  status = "end";

  return "ok";
}
export async function updateRecordAirTableWF(
  airTableDto: AirTableDTO
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call updateRecord");
  await updateRecord(airTableDto);
  console.log("end step:end updateRecord");
  status = "end";

  return "ok";
}


export async function deleteRecordAirTableWF(
  airTableDto: AirTableDTO
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call deleteRecord");
  await deleteRecord(airTableDto);
  console.log("end step:end deleteRecord");
  status = "end";

  return "ok";
}

export async function findRecordWithEmailWF(
  email: String
): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);

  console.log("start step 1:call find record with email");
  const record=await findRecordWithEmail(email);
  console.log("end step:end find record with email");
  // console.log("workflow result:",record);
  status = "end";

  return "ok";
}

export async function childAirTableWF(
  ): Promise<string> {
    
      console.log('call child airtable wf');
      const resultChild=await childAirtable("test airtable child");
  
    return "ok";
  }
