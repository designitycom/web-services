import { proxyActivities } from "@temporalio/workflow";
import * as wf from "@temporalio/workflow";
import type * as activities from "./activities";
import { MintDTO } from "../../models/mintDto";
import { Nft, NftWithToken, Sft, SftWithToken } from "@metaplex-foundation/js";
import { UserDTO } from "../../models/userDto";

const { uploadImage, verifyNft, createNft, updateNft ,uploadMetaData, getAllNFT, getUserDto, getMintDtoFromBigQuery} = proxyActivities<
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
export const getUserNft = wf.defineQuery<Nft | Sft | SftWithToken | NftWithToken>("getUserNft");
export async function getAllNFTWF(userDTO: UserDTO): Promise<string> {
  wf.setHandler(getUserNft, () => userNFT);
  const userNFT = await getAllNFT(userDTO);
  return "ok";
}


export const getUserNftAfterCheck = wf.defineQuery<Nft | Sft | SftWithToken | NftWithToken | null>("getUserNftAfterCheck");
export async function checkUserThenCreateNftWF(userDTO:UserDTO):Promise<string>{
  let userNFTAfterCheck: Nft | Sft | SftWithToken | NftWithToken | null = null;
  wf.setHandler(getUserNftAfterCheck, () => userNFTAfterCheck);
  const userNFT = await getAllNFT(userDTO);
  console.log("userNFT>>>>", userNFT)
  if(userNFT == undefined){
    const mintDto = new MintDTO
    mintDto.fileName="index.jpg"
    mintDto.publicKey=userDTO.publicKey
    mintDto.email=userDTO.email
    const updatedMintDto=  await getMintDtoFromBigQuery(mintDto);
    const imageUri= await uploadImage(updatedMintDto)
    const uri = await uploadMetaData(updatedMintDto, imageUri)
    const createdNft = await createNft(updatedMintDto, uri)
    await verifyNft(createdNft.address.toString())
    console.log("mintwotkflow>checkUserThenCreateNftWF>createdNft>>>", createdNft)
    userNFTAfterCheck = createdNft
  }else{
    console.log("it is defined ")
    const mintDto = new MintDTO
    mintDto.email=userDTO.email;
    mintDto.fileName="index.jpg"
    mintDto.publicKey=userDTO.publicKey
    mintDto.mintAddress=userNFT.address.toString();
    console.log("mintFto.emal>>>", mintDto.email);
    const updatedMintDto=  await getMintDtoFromBigQuery(mintDto);
    console.log ("updatedMintDto >>>>", updatedMintDto)
    const imageUri= await uploadImage(updatedMintDto)
    const uri = await uploadMetaData(updatedMintDto, imageUri)
    const updatedNft= await updateNft(mintDto, uri);
    userNFTAfterCheck = updatedNft;
    console.log("userNFTAfterCheck updatedNft>>>", userNFTAfterCheck)
  }


return "ok"
}