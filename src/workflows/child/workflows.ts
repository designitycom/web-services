import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { childAirTableWF } from "../airtable/workflows";

const { parent, child } = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
  
export async function parentWF(
): Promise<string> {
    console.log('call parent wf');
    const childResult=await wf.executeChild(childWF,{
        args:[],
        workflowId:'parent-1',
        taskQueue:'child'
    });

    
    const childAirResult=await wf.executeChild(childAirTableWF,{
        args:[],
        workflowId:'parent-airtable-1',
        taskQueue:'airtable'
    });

    console.log('call parent activity in wf');
 const parentResult=await parent("test parent");

  return "ok";
}

export async function childWF(
): Promise<string> {
  
    console.log('call child wf');
    const resultChild=await child("test child");

  return "ok";
}
