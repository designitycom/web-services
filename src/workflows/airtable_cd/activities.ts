import { FieldSet, Record } from "airtable";
import { getConnectionAirTable } from "../../services/airTable";

export interface ICreativesDirectorScoresAirtable extends FieldSet {
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
  "Wallet Address": string;
  Creatives: string[];
  "Submitted On": string;
  "Score Eligible?": string;
  "Processed": string;
}

export interface ISoftrCreativesCD extends FieldSet {
  Email?: string;
  "Token Address": string;
  "Wallet Address": string;
  "Magic Link"?: string;
  "Start Date"?: string[];
  Name?: string;
  Status: number;
  Level: number;
}

export interface ICreativesMaster extends FieldSet {
  "Personal Email Address": string;
}


export async function findRecordWithEmail(
  email: string
): Promise<Record<ISoftrCreativesCD> | undefined> {
  console.log("find by email");
 
  //const connection_obj=(await getConnectionAirTable());
  //connection_obj
  
  //const base = connection_obj.base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  console.log("connection base",base);
  const findRecords = await base<ISoftrCreativesCD>(process.env.CREATIVE_USER_TABLE!)
    .select({
      view: process.env.CREATIVE_USER_VIEW!,
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
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  const result = await base<ICreativesMaster>(process.env.CREATIVE_GROWTH_TABLE!).find(recId);
  const record = await findRecordWithEmail(
    result.fields["Personal Email Address"]
  );
  return record?.fields["Wallet Address"];
}

export async function updateScoreTX(recId: string, tx: string) {
  console.log("transaction id",recId);
  console.log("transaction",tx);
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  await base(process.env.CREATIVE_SCORES_TABLE!).update(recId, {
    "Transaction ID": tx,
  });
}

export async function updateSoftrCreativeUsers(
  recordId: string,
  record: ISoftrCreativesCD
) {
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  delete record["Start Date"];
  delete record["ACTIVE? (from Creatives Master)"];
  delete record["Name"];
  delete record["Email"];
  delete record["Magic Link"];
  console.log("After delete Record", record);
  return await base(process.env.CREATIVE_USER_TABLE!).update([
    {
      id: recordId,
      fields: record,
    },
  ]);
}

export async function getPendingScores() {
  const base = (await getConnectionAirTable()).base(process.env.SMART_CONTRACT_AIRTABLE_BASE!);
  try {
    console.log("inside get pending scores");
    return await base<ICreativesDirectorScoresAirtable>(process.env.CREATIVE_SCORES_TABLE!).select({
      view: process.env.CREATIVE_SCORES_VIEW!,
      filterByFormula: "AND({Transaction ID} = '', {Wallet Address}, {Submitted On}, NOT({Count Reviews Provided}))",
      sort: [{ field: "Submitted On", direction: "asc" }]
    }).all();
  } catch (err) {
    throw err;
  }
}
