import { Keypair, clusterApiUrl } from "@solana/web3.js";
import { Connection as conn } from "@solana/web3.js";
import { getConnection, getKeyPair, makeMetaplex } from "../../services/solana";
import fs from "fs";
import {
  Metaplex,
  Nft,
  NftWithToken,
  PublicKey,
  Sft,
  SftWithToken,
  bundlrStorage,
  keypairIdentity,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import { MintDTO } from "../../models/mintDto";

export async function uploadImage(mintDto: MintDTO): Promise<string> {
  const metaplex = makeMetaplex(mintDto.privateKey);
  console.log("make metaplex");
  const buffer = fs.readFileSync("uploads/images/" + mintDto.fileName);
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log("storage upload file");
  return imageUri;
}

export async function uploadMetaData(
  mintDto: MintDTO,
  imageUri: string) {
    const metaplex = makeMetaplex(mintDto.privateKey);
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: mintDto.name,
      description: mintDto.description,
      image: imageUri,
      role: mintDto.role,
    });
    console.log("upload meta data====>uri:" + uri);
    return uri;
}

export async function createNft(
  mintDto: MintDTO,
  uri: string
): Promise<string> {
  const metaplex = makeMetaplex(mintDto.privateKey);
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: mintDto.name,
      sellerFeeBasisPoints: 0,
      collection: new PublicKey(process.env.DESIGNITY_COLLECTION_ADDRESS!),
    },
    { commitment: "finalized" }
  );
  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );
  return nft.address.toString();
}

export async function updateNft(mintDto: MintDTO, uri: string) {
  const metaplex = makeMetaplex(mintDto.privateKey);
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

  return nft.address.toString();
}
export async function verifyNft(nftAddress: string) {

  const metaplexDesignitty=makeMetaplex(process.env.DESIGNITY_PRIVATE_KEY!)
  const result = await metaplexDesignitty.nfts().verifyCollection({
    //this is what verifies our collection as a Certified Collection
    mintAddress: new PublicKey(nftAddress),
    collectionMintAddress: new PublicKey(
      process.env.DESIGNITY_COLLECTION_ADDRESS!
    ),
    isSizedCollection: true,
  });
  console.log("verify result:",result);
  return result;
}
