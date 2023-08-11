import { BigQuery } from "@google-cloud/bigquery";
import { Request, Response } from "express";
import { UserDTO } from "../../models/userDto";
import * as jose from "jose";
import { Connection as solanaCon, PublicKey } from "@solana/web3.js";
import {
  getKeyPair,
  makeMetaplex,
  makeSimpleMetaplex,
} from "../../services/solana";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  Metadata,
  Nft,
  Sft,
  SftWithToken,
  NftWithToken,
} from "@metaplex-foundation/js";

// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>BigQuery
export async function getUserDto(userDTO: UserDTO): Promise<UserDTO> {
  const bigquery = new BigQuery({
    keyFilename: process.env.BIGQUERY_SERVICEACCOUNT || "bigquery-sa.json",
    projectId: "designitybigquerysandbox",
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/bigquery",
    ],
  });
  // ASH-> define the query
  const query = `SELECT *
  FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_EMAILS_DATASET}.${process.env. BIGQUERY_EMAILS_TABLE}\`
  LIMIT 100`;

  // console.log(query);
  const options = {
    query: query,
    location: "US",
  };

  //Run the query
  const [rows] = await bigquery.query(options);

  const result = rows.find((row) => row.Email == userDTO.email);
  if (result != undefined) {
    userDTO.role = result.Role;
    userDTO.level = result.Level;
    userDTO.name = result.Name;
  }else{
    
  }
  console.log("userDTO in activity", userDTO);

  return userDTO;
}
// >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>Get All NFT

export async function getAllNFT(
  userDTO: UserDTO
): Promise<Nft | Sft | SftWithToken | NftWithToken> {
  console.log("publickey in minyworkflow> getAllNft>>>",userDTO.publicKey )
  const metaplex = makeSimpleMetaplex();
  const result = await metaplex.nfts().findAllByOwner({
    owner: new PublicKey(userDTO.publicKey),
  });
  console.log("mintActivity>getAllNft>result>>> ", result)
  const designityCollection = new PublicKey(
    process.env.COLLECTION_ADDRESS!
  ).toBase58();
  const userNftCollection = result.filter((metadata) => {
    return (
      metadata.collection !== null &&
      metadata.collection.verified &&
      metadata.collection.address.toBase58() === designityCollection
    );
  });

  const loadedNfts = await Promise.all(
    userNftCollection.map((metadata) => {
      return metaplex.nfts().load({ metadata: metadata as Metadata });
    })
  );
  console.log("loaded NFT: ", loadedNfts[0]);

  return loadedNfts[0];
}  //end of getAllNFT
