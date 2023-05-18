import { proxyActivities } from '@temporalio/workflow';
import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';
import { waitForDebugger } from 'inspector';

const { mintActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});


export const getStatus = wf.defineQuery<number>('getStatus');

/** A workflow that simply calls an activity */
export async function mint(name: string): Promise<string> {
  let status = 0;

  wf.setHandler(getStatus, () => status);

  for (let i = 1; i <= 100; ++i) {
    await wf.sleep('1s');
    status += 10;
    console.log(`${i}%`);
  }
  return "workflow"
}