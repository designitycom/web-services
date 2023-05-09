import { initializeKeypair } from "./initializeKeypair.js"
import { Connection, clusterApiUrl, PublicKey, Signer } from "@solana/web3.js"
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  NftWithToken,
} from "@metaplex-foundation/js"
import * as fs from "fs"
// declare type Metaplex = typeof import("@metaplex-foundation/js");
// declare type NftWithToken = typeof import("@metaplex-foundation/js");
export interface NftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
}

export interface CollectionNftData {
  name: string
  symbol: string
  description: string
  sellerFeeBasisPoints: number
  imageFile: string
  isCollection: boolean
  collectionAuthority: Signer
}

// example data for a new NFT
export const nftData = {
  name: "Name",
  symbol: "SYMBOL",
  description: "Description",
  sellerFeeBasisPoints: 0,
  imageFile: "solana.png",
}
export const uploadNFT = async (metaplex: Metaplex) => {
  console.log("start upload nft")
  // const { uri } = await metaplex.nfts().uploadMetadata({
  //   name: "Metadata NFT",

  // });

  // console.log("uri:"+uri)
  const { nft } = await metaplex.nfts().create({
    name: "Designity NFT",
    sellerFeeBasisPoints: 0,
    uri: "https://designity.com",
    symbol: "DESIGNITY"
  }, {
    commitment: "confirmed",
  });

  console.log(nft.mint.address.toBase58());
};
// example data for updating an existing NFT
export const updateNftData = {
  name: "Update",
  symbol: "UPDATE",
  description: "Update Description",
  sellerFeeBasisPoints: 100,
  imageFile: "success.png",
}

export async function uploadMetadata(
  metaplex: Metaplex,
  nftData: NftData
): Promise<string> {
  console.log('uploadMetadata ....');
  // file to buffer
  const buffer = fs.readFileSync("src/" + nftData.imageFile)
  console.log("uploadMetadata get file")
  // buffer to metaplex file
  const file = toMetaplexFile(buffer, nftData.imageFile)

  console.log("toMetaplexFile")

  // upload image and get image uri
  const imageUri = await metaplex.storage().upload(file)
  console.log("image uri:", imageUri)

  // upload metadata and get metadata uri (off chain metadata)
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
  })

  console.log("metadata uri:", uri)
  return uri
}

export async function createNft(
  metaplex: Metaplex,
  uri: string,
  nftData: NftData,
  collectionMint: PublicKey
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri, // metadata URI
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
      collection: collectionMint,
    },
    { commitment: "finalized" }
  )

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )

  await metaplex.nfts().verifyCollection({
    //this is what verifies our collection as a Certified Collection
    mintAddress: nft.mint.address,
    collectionMintAddress: collectionMint,
    isSizedCollection: true,
  })

  return nft
}

export async function createCollectionNft(
  metaplex: Metaplex,
  uri: string,
  data: CollectionNftData
): Promise<NftWithToken> {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: data.name,
      sellerFeeBasisPoints: data.sellerFeeBasisPoints,
      symbol: data.symbol,
      isCollection: true,
    },
    { commitment: "finalized" }
  )

  console.log(
    `Collection Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )

  return nft
}

// helper function update NFT
export async function updateNftUri(
  metaplex: Metaplex,
  uri: string,
  mintAddress: PublicKey
) {
  // fetch NFT data using mint address
  const nft = await metaplex.nfts().findByMint({ mintAddress })

  // update the NFT metadata
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" }
  )

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  )

  console.log(
    `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
  )
}