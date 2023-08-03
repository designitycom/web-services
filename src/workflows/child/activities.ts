import { FieldSet } from "airtable";
import { AirTableDTO } from "../../models/airTableDto";
import { getConnectionAirTable } from "../../services/airTable";



export async function parent(str: String): Promise<string> {
    console.log("call parent");
    return "parent:"+str;
}
  

export async function child(str:String): Promise<string> {
  
    console.log("call child");
    return "child:"+str;
}

