
import {  getKeyPair, makeMetaplex, makeSimpleMetaplex } from "../../services/solana";
import fs from "fs";
import {
  Nft,
  NftWithToken,
  PublicKey,
  Sft,
  SftWithToken,
  Metadata,
  keypairIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { MintDTO } from "../../models/mintDto";
import { UserDTO } from "../../models/userDto";
import { BigQuery } from "@google-cloud/bigquery";
import { getConnectionAirTable } from "../../services/airTable";
import { FieldSet } from "airtable";
import { AirTableDTO } from "../../models/airTableDto";

export async function uploadImage(mintDto: MintDTO): Promise<string> {
  const metaplex = makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!);
  console.log("In activities  make metaplex");
  const buffer = fs.readFileSync("uploads/images/" + mintDto.fileName);
  console.log("In activities  make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("In activities  to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log("In activities  storage upload file");
  return imageUri;
}

export async function uploadMetaData(
  mintDto: MintDTO,
  imageUri: string) {
    const metaplex = makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!);
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: mintDto.name,
      description: mintDto.description,
      image: imageUri,
      role: mintDto.role,
    });
    console.log("In activities , upload meta data====>uri:" + uri);
    return uri;
}

export async function createNft(
  mintDto: MintDTO,
  uri: string
): Promise<Nft | Sft | SftWithToken | NftWithToken> {
  const metaplex = makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!);
  const keyPairDesignity=getKeyPair(process.env.DESIGNITY_PRIVATE_KEY!);
  const designityPK=new PublicKey(process.env.COLLECTION_ADDRESS!);
  const userPK=new PublicKey(mintDto.publicKey);
  console.log("In activities userPK", userPK)
  console.log("In activities  create mint activity PK:",mintDto.publicKey);
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: mintDto.name,
      sellerFeeBasisPoints: 0,
      mintAuthority:keyPairDesignity,
      updateAuthority:keyPairDesignity,
      tokenOwner:userPK,
      collection: designityPK,
    },
    { commitment: "finalized" }
  );
  console.log(
    `In activities  Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );
  return nft;
}

export async function updateNft(mintDto: MintDTO, uri: string):Promise<Nft | Sft | SftWithToken | NftWithToken> {
  const metaplex = makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!);
  const mintAddress = new PublicKey(mintDto.mintAddress);
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress });

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" }
  );

  return nft;
}
export async function verifyNft(nftAddress: string) {

  const metaplexDesignitty=makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!)
  const result = await metaplexDesignitty.nfts().verifyCollection({
    //this is what verifies our collection as a Certified Collection
    mintAddress: new PublicKey(nftAddress),
    collectionMintAddress: new PublicKey(
      process.env.COLLECTION_ADDRESS!
    ),
    isSizedCollection: true,
  });
  console.log("In activities  verify result:",result);
  return result;
}

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
  FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_EMAILS_DATASET}.${process.env.BIGQUERY_EMAILS_TABLE}\`
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
// ------------------------------------------------>

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
} //end of getAllNFT

export async function getMintDtoFromBigQuery(mintDTO: MintDTO): Promise<any> {
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
  FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_EMAILS_DATASET}.${process.env.BIGQUERY_EMAILS_TABLE}\`
  LIMIT 100`;

  // console.log(query);
  const options = {
    query: query,
    location: "US",
  };

  //Run the query
  const [rows] = await bigquery.query(options);

  const result = rows.find((row) => row.Email == mintDTO.email);
  if (result != undefined) {
    mintDTO.role = result.Role;
    mintDTO.level = result.Level;
    mintDTO.name = result.Name;
  }else{
    
  }
  console.log("userDTO in activity", mintDTO);

  return mintDTO;
}




