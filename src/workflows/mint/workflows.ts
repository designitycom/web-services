import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Nft, NftWithToken, PublicKey, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";
import { AirTableDTO } from "../../models/airTableDto";
import {
  findRecordWithEmailWF,
  updateRecordAirTableWF,
} from "../airtable/workflows";

import { getAllNFTWF } from "../user/workflows";

const {
  uploadImage,
  verifyNft,
  createNft,
  updateNft,
  uploadMetaData,
  getScoreAccount,
  register,
  // getAllNFT,
  // getUserDto,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: "1 minute",
});

export const getStatus = wf.defineQuery<string>("getStatus");
export const getCreatedNft = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getCreatedNft");

export async function createMintWF(
  mintDto: MintDTO
): Promise<Nft | Sft | SftWithToken | NftWithToken> {
  let status = "start";
  wf.setHandler(getStatus, () => status);
  wf.setHandler(getCreatedNft, () => createdNft);

  console.log(">> In workflow, uploading image started ");
  const imageUri = await uploadImage(mintDto);
  console.log(">> In workflow, image URI: ", imageUri);
  status = ">>In workflow, Image Uploaded";

  const uri = await uploadMetaData(mintDto, imageUri);
  status = ">>In workflow, Image URI recieved";
  console.log(">>In workflow, metadata added to image", uri);

  const createdNft = await createNft(mintDto, uri);
  console.log(">>In workflow, created NFT object: ", createdNft);
  status = ">>In workflow, NFT created";
  console.log(">>In workflow, veifying NFT in the collection");
  await verifyNft(createdNft.address.toString());
  status = ">>In workflow, NFT verified";
  return createdNft;
}

export const getUpdatedMintAddress = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getUpdatedMintAddress");
export async function updateMintWF(
  mintDto: MintDTO
): Promise<Nft | Sft | SftWithToken | NftWithToken> {
  let status = "start";
  wf.setHandler(getStatus, () => status);
  wf.setHandler(getUpdatedMintAddress, () => updatedNft);

  console.log("update start step 1");
  const imageUri = await uploadImage(mintDto);
  console.log("start step 2", imageUri);
  status = "get uri";

  const uri = await uploadMetaData(mintDto, imageUri);
  console.log("start step 3", uri);
  status = "get uri";

  const updatedNft = await updateNft(mintDto, uri);
  console.log("start step 3", updatedNft);
  status = "create nft";

  return updatedNft;
}
//-> userwf
// export const getStatus2 = wf.defineQuery<string>("getStatus");
// export const handleUserDTO = wf.defineQuery<UserDTO>("handleUserDTO");
// export async function checkEmailWF(userDTO: UserDTO): Promise<string> {
//   let status = "check email process started";

//   wf.setHandler(getStatus, () => status);
//   wf.setHandler(handleUserDTO, () => updatedUserDTO);

//   userDTO = await getUserDto(userDTO);


//   status = "check email process completed";

//   return "ok";
// }

export const getUserNft = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getUserNft");
export async function getAllNFTWFinMint(userDTO: UserDTO): Promise<string> { 
  wf.setHandler(getUserNft, () => userNFT);
  const userNFT = await wf.executeChild(getAllNFTWF, {
    args: [userDTO],
    workflowId: "child-"+userDTO.wfId,
    taskQueue: "user",
  });

  return "ok";
}

export const getUserNftAfterCheck = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken | null
>("getUserNftAfterCheck");
export async function checkUserThenCreateNftWF(
  userDTO: UserDTO
): Promise<string> {
  let userNFTAfterCheck: Nft | Sft | SftWithToken | NftWithToken | null = null;
  wf.setHandler(getUserNftAfterCheck, () => userNFTAfterCheck);
  console.log("checking score account");
  let scoreAccount = await getScoreAccount(userDTO.publicKey);
  console.log("scoreAccount>>>>", scoreAccount);
  if (scoreAccount == undefined) {
    const airTableDTO = new AirTableDTO();
    airTableDTO.email = userDTO.email;
    const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
      args: [airTableDTO],
      workflowId: "child-checkuser-"+userDTO.wfId,
      taskQueue: "airtable",
    });
    scoreAccount = await register(updatedAirTableDTO.name, userDTO.publicKey);
    airTableDTO.walletAddress = userDTO.publicKey;
    airTableDTO.tokenAddress = scoreAccount.mint.toBase58();
    await wf.executeChild(updateRecordAirTableWF, {
      args: [airTableDTO],
      workflowId: "child-"+airTableDTO.wfId,
      taskQueue: "airtable",
    });
    console.log("scoreAccount>>>", scoreAccount);
  }
  return "ok";
}

export const getUserMagicLinkFromAirtable = wf.defineQuery<string>(
  "getUserMagicLinkFromAirtable"
);
export async function getMagicLinkFromAirtableWF(
  userDTO: UserDTO
): Promise<string> {
  let logedinUserAiritableMagigLink = "";
  wf.setHandler(
    getUserMagicLinkFromAirtable,
    () => logedinUserAiritableMagigLink
  );  
  //--    
  const airTableDTO = new AirTableDTO();
  airTableDTO.email = userDTO.email;
  const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
    args: [airTableDTO],
    workflowId: "child-magiclink-"+userDTO.wfId,
    taskQueue: "airtable",
  });
  //--
  logedinUserAiritableMagigLink = updatedAirTableDTO.magicLink;
  console.log("MagicLinkFromAirtableWF>>>", logedinUserAiritableMagigLink);

  return "ok";
}
