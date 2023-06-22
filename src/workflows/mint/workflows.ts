import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Connection as conn } from "@solana/web3.js";

const { imageUri, verifyNft, createNft, updateNft } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
export const getData = wf.defineQuery<Map<string, any>>("getData");

export async function createMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";
  let data = new Map();

  wf.setHandler(getStatus, () => status);
  wf.setHandler(getData, () => data);

  console.log("update start step 1");
  const uri = await imageUri(mintDto);
  console.log("start step 2", uri);
  status = "get uri";
  data.set("uri", uri);
  const nftAddress = await createNft(mintDto, uri);
  console.log("start step 3", nftAddress);
  status = "create nft";
  data.set("nft", nftAddress);
  const result = await verifyNft(nftAddress);
  console.log("start step 4");
  status = "nft verified";

  // console.log("address:" + nft.address);

  return "ok";
}

export async function updateMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";
  let data = new Map();

  wf.setHandler(getStatus, () => status);
  wf.setHandler(getData, () => data);

  console.log("update start step 1");
  const uri = await imageUri(mintDto);
  console.log("start step 2", uri);
  status = "get uri";
  data.set("uri", uri);
  const nftAddress = await updateNft(mintDto, uri);
  console.log("start step 3", nftAddress);
  status = "create nft";
  data.set("nft", nftAddress);
  const result = await verifyNft(nftAddress);
  console.log("start step 4");
  status = "nft verified";

  // console.log("address:" + nft.address);

  return "ok";
}
