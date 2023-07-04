import { AirTableDTO } from "../../models/airTableDto";
import { getConnectionAirTable } from "../../services/airTable";



export async function getAllRecord(airTableDto: AirTableDTO): Promise<string> {
    const base=await getConnectionAirTable();
    base('Table 1').select({
        // Selecting the first 3 records in Grid view:
        maxRecords: 4,
        view: "Grid view"
    }).eachPage(function page(records, fetchNextPage) {
        // This function (`page`) will get called for each page of records.
    
        records.forEach(function(record) {
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


export async function getRecord(airTableDto: AirTableDTO): Promise<string> {
    const base=await getConnectionAirTable();
    console.log("record id:",airTableDto.recordId);
    base("Table 1").find(airTableDto.recordId, function (err, record) {
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
    base("Table 1").create(
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
    base("Table 1").update(
        [
          {
            id: airTableDto.recordId,
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
            console.log(record.get("Name"));
          });
        }
      );
    return "";
}


export async function deleteRecord(airTableDto: AirTableDTO): Promise<string> {
    const base=await getConnectionAirTable();
    base("Table 1").destroy(
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
