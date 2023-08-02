import { FieldSet } from "airtable";
import { AirTableDTO } from "../../models/airTableDto";
import { getConnectionAirTable } from "../../services/airTable";



export async function getAllRecord(airTableDto: AirTableDTO): Promise<string> {
    const base=await getConnectionAirTable();
    base('Creatives Master').select({
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
    
        records.forEach(function(record) {
          // console.log(record);
            console.log('Retrieved', record.get('Current Role'), record.id);
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


export async function findRecordWithEmail(email:String): Promise<FieldSet|null> {
  const base=await getConnectionAirTable();
  let findRecord=null;
  await base('Creatives Master').select({
      view: "Grid view"
  }).eachPage(async function page(records, fetchNextPage) {
      // This function (`page`) will get called for each page of records.
  
      records.forEach(function(record) {
        // console.log(record);

        const emailRecord=record.get('Personal Email Address');
        if(emailRecord==email){
          console.log('find', record.get('Token Wallet ID'), record.id);
          findRecord=record;
          return findRecord;
        }
      });
  
      // To fetch the next page of records, call `fetchNextPage`.
      // If there are more records, `page` will get called again.
      // If there are no more records, `done` will get called.
      fetchNextPage();
  
  }, function done(err) {
      if (err) { console.error(err); return; }
  });
  
  await new Promise((resolve) => setTimeout(resolve, 2000));
  return findRecord;
}

export async function getRecord(airTableDto: AirTableDTO): Promise<string> {
    const base=await getConnectionAirTable();
    console.log("record id:",airTableDto.recordId);
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
    const base=await getConnectionAirTable();
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
    const base=await getConnectionAirTable();
    base("Creatives Master").update(
        [
          {
            id: airTableDto.recordId,
            fields: {
              'Token Wallet ID': 'aaaa',
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
    const base=await getConnectionAirTable();
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
