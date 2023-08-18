import { FieldSet } from "airtable";
import { AirTableDTO } from "../../models/airTableDto";
import { getConnectionAirTable } from "../../services/airTable";

export interface IGrowthMasterAirtable {
  Email: string;
  'Hard Skill (Calculated)': number;
  'Creativity_design_sense': number;
  'Accountability': number;
  'Attention_to_detail': number;
  'Communication_presentation': number;
  'Feedback_listening': number;
  'Leadership_guidance': number;
  'Management_organisation': number;
  'Strategic_thinking': number;
  'Team_collaboration': number;
  'Creative Director Email': string;
  'Creative Director Name': string;
  'Wallet Address': string[];
  Creatives: string[];
  id: string;
}


export async function findRecordWithEmail(airTableDTO: AirTableDTO): Promise<AirTableDTO> {
  console.log("find by email");
  const base = (await getConnectionAirTable()).base('appxprwH6zsJbTFyM');
  // TODO: switch to filter by formula
  let findRecord: any = null;
  await base('Creatives Softr Users').select({
    view: "Grid view",
    // filterByFormula: `{Email} = '${airTableDTO.email}'`
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
      const emailRecord = record.get('Email');
      // console.log(emailRecord, airTableDTO.email);
      if (emailRecord == airTableDTO.email) {
        // console.log(record);
        // console.log('find', record.get('Token Wallet ID'), record.id);
        findRecord = record;
        // console.log(record);
        return findRecord;
      }
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("aa", findRecord);
  if (findRecord) {
    airTableDTO.name = findRecord.fields.Name;
    airTableDTO.status = Number(findRecord.fields.Status);
    airTableDTO.level = Number(findRecord.fields.Level);
    airTableDTO.recordId = findRecord.id;
    airTableDTO.tokenAddress = findRecord.fields['Token Address'];
    airTableDTO.walletAddress = findRecord.fields['Wallet Address'];
    airTableDTO.magicLink = findRecord.fields['Magic Link'];
  } else {
    airTableDTO.magicLink = "Not-Found";
  }
  return airTableDTO;

}

export async function getCreativeWallet(airTableDto: AirTableDTO) {
  const base = (await getConnectionAirTable()).base("appBwrlSCBQDC9UCV");
  // console.log("record id:", airTableDto.recordId);
  const result = await base("Creatives").find(airTableDto.recordId);
  // console.log(result);
  const airtableDTO = new AirTableDTO();
  airtableDTO.email = result.get("Personal Email Address") as string;
  const record = await findRecordWithEmail(airtableDTO);
  return record.walletAddress;
}

export async function updateScoreTX(recId: string, tx: string) {
  const base = (await getConnectionAirTable()).base("appBwrlSCBQDC9UCV");

  await base("🧑‍🎨 Creatives Scores").update(recId, {
    "Transaction ID": tx,
  });
}



export async function updateRecord(baseId: string, airTableDto: AirTableDTO): Promise<string> {
  const base = (await getConnectionAirTable()).base(baseId);
  base("Creatives Softr Users").update(
    [
      {
        id: airTableDto.recordId,
        fields: {
          'Wallet Address': airTableDto.walletAddress,
          'Token Address': airTableDto.tokenAddress
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records!.forEach(function (record) {
        console.log(record.get("Name"));
      });
    }
  );
  return "";
}



export async function getPendingScores() {
  const base = (await getConnectionAirTable()).base('appBwrlSCBQDC9UCV');
  let allRecords: IGrowthMasterAirtable[] = [];
  try {

    await base("🧑‍🎨 Creatives Scores").select({
      view: "Grid view",
      // fields: ['Creativity_design_sense']
      filterByFormula: "AND({Transaction ID} = '', {Wallet Address})"
    }).eachPage(function page(records, fetchNextPage) {
      records.forEach((record) => {
        // console.log(record.fields);
        const rec: IGrowthMasterAirtable = record.fields as any;
        rec.id = record.id,
        rec.Email = record.get("Email") as string;
        allRecords.push(rec);
      });

      fetchNextPage();
    });
  } catch (err) {
    console.error(err);
  }

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log("processing ", allRecords.length);
  // allRecords = [];
  return allRecords;
}