import Airtable from "airtable";
import { AirtableBase } from "airtable/lib/airtable_base";


export async function getConnectionAirTable():Promise<AirtableBase>{
    return new Airtable({apiKey: process.env.AIRTABLE_API}).base('appxprwH6zsJbTFyM');
}