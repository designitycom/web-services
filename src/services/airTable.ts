import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";
import { env } from "process";


export async function getConnectionAirTable():Promise<AirtableBase>{
    return new Airtable({apiKey: process.env.AIRTABLE_API}).base('appSI75gbLe4JzMKT');
}