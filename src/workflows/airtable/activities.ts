import { FieldSet, Record } from "airtable";
import { getConnectionAirTable } from "../../services/airTable";

export interface ICreativesScoresAirtable extends FieldSet {
  Email: string;
  "Hard Skill (Calculated)": number;
  Creativity_design_sense: number;
  Accountability: number;
  Attention_to_detail: number;
  Communication_presentation: number;
  Feedback_listening: number;
  Leadership_guidance: number;
  Management_organisation: number;
  Strategic_thinking: number;
  Team_collaboration: number;
  "Creative Director Email": string;
  "Creative Director Name": string;
  "Wallet Address": string[];
  Creatives: string[];
  "Submitted On": string;
  "Score Eligible?": string[];
}

export interface ISoftrCreativesUser extends FieldSet {
  Email: string;
  "Token Address": string;
  "Wallet Address": string;
  "Magic Link": string;
  "Start Date"?: string[];
  Name: string;
  Status: number;
  Level: number;
  //"Profile image"?: string[];
  //"Dashboard - Backend iFrame"?: string[];
}

export interface ICreativesMaster extends FieldSet {
  "Personal Email Address": string;
}


export async function findRecordWithEmail(
  email: string
): Promise<Record<ISoftrCreativesUser> | undefined> {
  console.log("find by email");
  //const base = (await getConnectionAirTable()).base("appxprwH6zsJbTFyM");
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  /*const base = (await getConnectionAirTable()).base(
    `${process.env.CREATIVE_MASTER_AIRTABLE_BASE}`
  );*/
  /*const findRecords = await base<ISoftrCreativesUser>("Users")
    .select({
      view: "Softr / Smart Contract Users for Growth Master",
      filterByFormula: `{Email} = '${email}'`,
    })
    .all();*/
    const findRecords = await base<ISoftrCreativesUser>("Creatives Users")
    .select({
      view: "Creatives",
      filterByFormula: `{Email} = '${email}'`,
    })
    .all();
  if (findRecords.length < 1) {
    return undefined;
  }
  console.log(`records with emailsd ${email}`, findRecords);
  return findRecords[0];
}

export async function getCreativeWallet(recId: string) {
  //const base = (await getConnectionAirTable()).base("appBwrlSCBQDC9UCV");
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  /*const base = (await getConnectionAirTable()).base(
    `${process.env.GROWTH_MASTER_AIRTABLE_BASE}`
  );*/

  const result = await base<ICreativesMaster>("Creatives Growth Master").find(recId);
  const record = await findRecordWithEmail(
    result.fields["Personal Email Address"]
  );
  return record?.fields["Wallet Address"];
}

export async function updateScoreTX(recId: string, tx: string) {
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  //const base = (await getConnectionAirTable()).base("appBwrlSCBQDC9UCV");
  /*const base = (await getConnectionAirTable()).base(
    `${process.env.GROWTH_MASTER_AIRTABLE_BASE}`
  );*/

  await base("Creatives Scores").update(recId, {
    "Transaction ID": tx,
  });
}

export async function updateSoftrCreativeUsers(
  recordId: string,
  record: ISoftrCreativesUser
) {
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);

  //const base = (await getConnectionAirTable()).base("appxprwH6zsJbTFyM");
  /*const base = (await getConnectionAirTable()).base(
    `${process.env.CREATIVE_MASTER_AIRTABLE_BASE}`
  );*/
console.log("Record",record);
console.log("Record id",recordId);
  delete record["Start Date"];
  //delete record["Profile image"];
  //delete record["Dashboard - Backend iFrame"];
  delete record["ACTIVE? (from Creatives Master)"];
  console.log("After delete Record",record);
  return await base("Creatives Users").update([
  //return await base("Creatives Softr Users").update([
    {
      id: recordId,
      fields: record,
    },
  ]);
}

export async function getPendingScores() {
  //const base = (await getConnectionAirTable()).base("appBwrlSCBQDC9UCV");
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  try {
    return await base<ICreativesScoresAirtable>("Creatives Scores").select({
      view: "Grid view",
      filterByFormula: "AND({Transaction ID} = '', {Wallet Address}, {Submitted On}, NOT({Count Reviews Provided}))",
      sort: [ {field: "Submitted On", direction: "asc"}]
    }).all();
  } catch (err) {
    throw err;
  }
}
