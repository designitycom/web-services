import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";
import { AirTableDTO } from "../../models/airTableDto";
import {
  findRecordWithEmailWF,
  updateRecordAirTableWF,
} from "../airtable/workflows";

const {
  uploadImage,
  verifyNft,
  createNft,
  updateNft,
  uploadMetaData,
  getAllNFT,
  getUserDto,
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
export async function updateMintWF(mintDto: MintDTO): Promise< Nft | Sft | SftWithToken | NftWithToken> {
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

//ASH------------------------------->
export const getStatus2 = wf.defineQuery<string>("getStatus");
export const handleUserDTO = wf.defineQuery<UserDTO>("handleUserDTO");
export async function checkEmailWF(userDTO: UserDTO): Promise<string> {
  let status = "check email process started";

  wf.setHandler(getStatus, () => status);
  wf.setHandler(handleUserDTO, () => userDTO);

  userDTO = await getUserDto(userDTO);

  status = "check email process completed";

  return "ok";
}
//---------------------------------------------------------
export const getUserNft = wf.defineQuery<
  Nft | Sft | SftWithToken | NftWithToken
>("getUserNft");
export async function getAllNFTWF(userDTO: UserDTO): Promise<string> {
  wf.setHandler(getUserNft, () => userNFT);
  const userNFT = await getAllNFT(userDTO);
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
  const userNFT = await getAllNFT(userDTO);
  console.log("userNFT>>>>", userNFT);
  if (userNFT == undefined) {
    const mintDto = new MintDTO();
    const airTableDTO = new AirTableDTO();
    mintDto.fileName = "index.jpg";
    mintDto.publicKey = userDTO.publicKey;
    mintDto.email = userDTO.email;
    airTableDTO.email = userDTO.email;
    const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
      args: [airTableDTO],
      workflowId: "parent-airtable-1",
      taskQueue: "airtable",
    });
    mintDto.name = updatedAirTableDTO.name;
    mintDto.role = updatedAirTableDTO.role;
    mintDto.level = updatedAirTableDTO.level;
    const createdNft = await wf.executeChild(createMintWF, {
      args: [mintDto],
      workflowId: "parent-1",
      taskQueue: "mint",
    });
    console.log("createdMint>>>", createdNft);

    userNFTAfterCheck = createdNft;
    airTableDTO.walletAddress = userDTO.publicKey;
    airTableDTO.tokenAddress = createdNft.address.toString();
    airTableDTO.recordId = updatedAirTableDTO.recordId;
    await wf.executeChild(updateRecordAirTableWF, {
      args: [airTableDTO],
      workflowId: "parent-airtable-1",
      taskQueue: "airtable",
    });
  } else {
    console.log("it is defined ");
    const airTableDTO = new AirTableDTO();
    airTableDTO.email = userDTO.email;
    const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
      args: [airTableDTO],
      workflowId: "parent-airtable-1",
      taskQueue: "airtable",
    });
    const mintDto = new MintDTO();
    mintDto.email = userDTO.email;
    mintDto.fileName = "index.jpg";
    mintDto.publicKey = userDTO.publicKey;
    mintDto.name=updatedAirTableDTO.name
    mintDto.role=updatedAirTableDTO.role
    mintDto.level=updatedAirTableDTO.level
    mintDto.mintAddress=updatedAirTableDTO.tokenAddress
    const updatedNft = await wf.executeChild(updateMintWF, {
      args: [mintDto],
      workflowId: "parent-1",
      taskQueue: "mint",
    });
    userNFTAfterCheck = updatedNft;

  }
  return "ok";
}

export const getUserMagicLinkFromAirtable = wf.defineQuery<string>("getUserMagicLinkFromAirtable");
export async function getMagicLinkFromAirtableWF (userDTO:UserDTO):Promise<string>{
  let logedinUserAiritableMagigLink= "";
  wf.setHandler(getUserMagicLinkFromAirtable, () => logedinUserAiritableMagigLink);
  //--
  const airTableDTO = new AirTableDTO
  airTableDTO.email=userDTO.email
  const updatedAirTableDTO = await wf.executeChild(findRecordWithEmailWF, {
    args: [airTableDTO],
    workflowId: "parent-airtable-1",
    taskQueue: "airtable",
  });
  //--
   logedinUserAiritableMagigLink= updatedAirTableDTO.magicLink
  console.log("MagicLinkFromAirtableWF>>>", logedinUserAiritableMagigLink)

  return "ok"
}
