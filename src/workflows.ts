import { proxyActivities } from '@temporalio/workflow';
import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities.js';
import { waitForDebugger } from 'inspector';

const { greet } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export const getProgress = wf.defineQuery<number>('getProgress');

/** A workflow that simply calls an activity */
export async function example(name: string): Promise<string> {
  let currentProgress = 0;

  wf.setHandler(getProgress, () => currentProgress);

  for (let i = 1; i <= 10; ++i) {
    await wf.sleep('1s');
    currentProgress += 10;
    console.log(`${i * 10}%`);
  }
  return "workflow"
}