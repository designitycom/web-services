import { FieldSet } from "airtable";
import { AirTableDTO } from "../../models/airTableDto";
import { getConnectionAirTable } from "../../services/airTable";



export async function getAllRecord(airTableDto: AirTableDTO): Promise<string> {
  const base = await getConnectionAirTable();
  base('Creatives Softr Users').select({
    view: "Grid view"
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
      // console.log(record);
      console.log('Retrieved', record.get('Name'), record.id);
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();

  }, function done(err) {
    if (err) { console.error(err); return; }
  });
  return "";
}


export async function findRecordWithEmail(airTableDTO: AirTableDTO): Promise<AirTableDTO> {
  const base = await getConnectionAirTable();
  // base("").select().eachPage();
  let findRecord: any = null;
  await base('Creatives Softr Users').select({
    view: "Grid view",
  }).eachPage(function page(records, fetchNextPage) {
    // This function (`page`) will get called for each page of records.

    records.forEach(function (record) {
      const emailRecord = record.get('Email');
      console.log(emailRecord, airTableDTO.email);
      if (emailRecord == airTableDTO.email) {
        console.log('find', record.get('Token Wallet ID'), record.id);
        findRecord = record;
        console.log(record);
        return findRecord;
      }
    });

    // To fetch the next page of records, call `fetchNextPage`.
    // If there are more records, `page` will get called again.
    // If there are no more records, `done` will get called.
    fetchNextPage();
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  if (findRecord) {
    airTableDTO.name = findRecord.fields.Name;
    airTableDTO.role = Number(findRecord.fields.Role);
    airTableDTO.level = Number(findRecord.fields.Level);
    airTableDTO.recordId = findRecord.id;
    airTableDTO.tokenAddress = findRecord.fields['Token Address'];
    airTableDTO.walletAddress = findRecord.fields['Wallet Address'];
    airTableDTO.magicLink = findRecord.fields['Magic Link'];
  }else{
    airTableDTO.magicLink="Not-Fount";
  }
  return airTableDTO;

}

export async function getRecord(airTableDto: AirTableDTO): Promise<string> {
  const base = await getConnectionAirTable();
  console.log("record id:", airTableDto.recordId);
  base("Creatives Master").find(airTableDto.recordId, function (err, record) {
    if (err) {
      console.error(err);
      return;
    }
    console.log("Retrieved", record!.get("Name"));
  });
  return "";
}

export async function createRecord(airTableDto: AirTableDTO): Promise<string> {
  const base = await getConnectionAirTable();
  base("Creatives Master").create(
    [
      {
        fields: {
          Name: airTableDto.name,
          Notes: airTableDto.notes,
          Assignee: {
            id: "usrOz3PeABd8QrPH2",
            email: "mehdidehdar89@gmail.com",
            name: "mehdi dehdar",
          },
          Status: airTableDto.status,
        },
      },
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return;
      }
      records!.forEach(function (record) {
        console.log(record.getId());
      });
    }
  );
  return "";
}


export async function updateRecord(airTableDto: AirTableDTO): Promise<string> {
  const base = await getConnectionAirTable();
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


export async function deleteRecord(airTableDto: AirTableDTO): Promise<string> {
  const base = await getConnectionAirTable();
  base("Creatives Master").destroy(
    [airTableDto.recordId],
    function (err, deletedRecords) {
      if (err) {
        console.error(err);
        return;
      }
      console.log("Deleted", deletedRecords!.length, "records");
    }
  );
  return "";
}

export async function childAirtable(str: String): Promise<string> {

  console.log("call child airtable");
  return "child-airtable:" + str;
}
