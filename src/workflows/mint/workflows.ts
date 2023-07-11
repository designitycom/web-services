import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";

const { uploadImage, verifyNft, createNft, updateNft ,uploadMetaData} = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
export const getCreatedNft = wf.defineQuery<Nft | Sft | SftWithToken | NftWithToken>("getCreatedNft");

export async function createMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";
  wf.setHandler(getStatus, () => status);
  wf.setHandler(getCreatedNft, () => createdNft); 

  console.log(">> In workflow, uploading image started ");
  const imageUri = await uploadImage(mintDto);
  console.log(">> In workflow, image URI: ", imageUri);
  status = ">>In workflow, Image Uploaded";
  
  const uri = await uploadMetaData(mintDto,imageUri);
  status = ">>In workflow, Image URI recieved";
  console.log(">>In workflow, metadata added to image", uri);

  const createdNft = await createNft(mintDto, uri);
  console.log(">>In workflow, created NFT object: ", createdNft ); 
  status = ">>In workflow, NFT created";
  console.log(">>In workflow, veifying NFT in the collection");
  const result = await verifyNft(createdNft.address.toString());
  status = ">>In workflow, NFT verified";


  return "ok";
}
export const getUpdatedMintAddress = wf.defineQuery<Nft | Sft | SftWithToken | NftWithToken>("getUpdatedMintAddress");
export async function updateMintWF(mintDto: MintDTO): Promise<string> {
  let status = "start";  
  wf.setHandler(getStatus, () => status);
  wf.setHandler(getUpdatedMintAddress, () => updatedNft);

  console.log("update start step 1");
  const imageUri = await uploadImage(mintDto);
  console.log("start step 2", imageUri);
  status = "get uri";
  
  const uri = await uploadMetaData(mintDto,imageUri);
  console.log("start step 3", uri);
  status = "get uri";

  const updatedNft = await updateNft(mintDto, uri);
  console.log("start step 3", updatedNft);
  status = "create nft";
  
  return "ok";
}
