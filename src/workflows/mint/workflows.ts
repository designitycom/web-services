import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Connection as conn } from "@solana/web3.js";

const { uploadImage, verifyNft, createNft, updateNft ,uploadMetaData} = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
export const getMintAddress = wf.defineQuery<string>("getMintAddress");

export async function createMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";
  let mintAddress = "";

  wf.setHandler(getStatus, () => status);
  wf.setHandler(getMintAddress, () => mintAddress);

  console.log(">> In workflow, uploading image started ");
  const imageUri = await uploadImage(mintDto);
  console.log(">> In workflow, image URI: ", imageUri);
  status = ">>In workflow, Image Uploaded";
  
  const uri = await uploadMetaData(mintDto,imageUri);
  status = ">>In workflow, Image URI recieved";
  console.log(">>In workflow, metadata added to image", uri);

  const nftAddress = await createNft(mintDto, uri);
  console.log(">>In workflow, NFT address: ", nftAddress);
  status = ">>In workflow, NFT created";
  mintAddress=nftAddress;
  console.log(">>In workflow, veifying NFT in the collection");
  const result = await verifyNft(nftAddress);
  status = ">>In workflow, NFT verified";

  // console.log("address:" + nft.address);

  return "ok";
}
export const getUpdatedMintAddress = wf.defineQuery<string>("getMintAddress");
export async function updateMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";  
  let mintAddress = mintDto.mintAddress;

  wf.setHandler(getStatus, () => status);
  wf.setHandler(getUpdatedMintAddress, () => mintAddress);

  console.log("update start step 1");
  const imageUri = await uploadImage(mintDto);
  console.log("start step 2", imageUri);
  status = "get uri";
  
  const uri = await uploadMetaData(mintDto,imageUri);
  console.log("start step 3", uri);
  status = "get uri";

  const nftAddress = await updateNft(mintDto, uri);
  console.log("start step 3", nftAddress);
  status = "create nft";
  


  // console.log("address:" + nft.address);

  return "ok";
}
