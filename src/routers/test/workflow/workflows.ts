import { proxyActivities } from '@temporalio/workflow';
import * as wf from '@temporalio/workflow';
// Only import the activity types
import type * as activities from './activities';
import { waitForDebugger } from 'inspector';
import { Nft } from '@metaplex-foundation/js';

const { mintActivity, updateMintActivity } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});


export const getStatus = wf.defineQuery<string>('getStatus');


/** A workflow that simply calls an activity */
export async function mint(privateKey: string, fileName: string, name: string, description: string): Promise<string> {
  let status = "start";

  wf.setHandler(getStatus, () => status);

  // for (let i = 1; i <= 100; ++i) {
  //   await wf.sleep('1s');
  //   status += 10;
  //   console.log(`${i}%`);
  // }
  console.log("start step 1");
  // const metaPlex=await makeMetaplex(privateKey);
  const nft = await mintActivity(privateKey, fileName, name, description);
  console.log("start step 2");
  status = "done";
  // const imageuri=await imageUri(metaPlex,fileName);
  // const nft=await createNft(metaPlex,name,description,imageuri);
  console.log("address:" + nft.address);
  // return nft;
  return "ok";
}


/** A workflow that simply calls an activity */
export async function updateMint(privateKey: string, fileName: string, name: string, description: string, address: string): Promise<string> {
  // let status = 0;

  // wf.setHandler(getStatus, () => status);

  // for (let i = 1; i <= 100; ++i) {
  //   await wf.sleep('1s');
  //   status += 10;
  //   console.log(`${i}%`);
  // }
  console.log("start step 1");
  // const metaPlex=await makeMetaplex(privateKey);
  const nft = await updateMintActivity(privateKey, fileName, name, description, address);
  console.log("start step 2");
  // const imageuri=await imageUri(metaPlex,fileName);
  // const nft=await createNft(metaPlex,name,description,imageuri);
  console.log("address:" + nft.address);
  // return nft;
  return "ok";
}

export const unblockSignal = wf.defineSignal('unblock');
export const isBlockedQuery = wf.defineQuery<boolean>('isBlocked');
export async function signals():Promise<void>{
  let isBlocked = true;
  wf.setHandler(unblockSignal, () => void (isBlocked = false));
  wf.setHandler(isBlockedQuery, () => isBlocked);
  console.log('Blocked');
  try {
    await wf.condition(() => !isBlocked); 
    console.log('Unblocked');
  } catch (err) {
    if (err instanceof wf.CancelledFailure) { 
      console.log('Cancelled');
    }
    throw err;
  }
}