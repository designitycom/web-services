import { getConnection, getKeyPair } from "../../../services/solana";
import fs from "fs"
import { Metaplex, Nft, NftWithToken, PublicKey, Sft, SftWithToken, bundlrStorage, keypairIdentity, toMetaplexFile } from "@metaplex-foundation/js";

export async function mintActivity(privateKey: string, fileName: string, name: string, description: string): Promise<Nft> {
  const connection = getConnection();
  const user = getKeyPair("AUTHORITY")
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    )
  const buffer = fs.readFileSync("uploads/images/" + fileName);
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });
  console.log("upload meta data====>uri:" + uri);
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: name,
      sellerFeeBasisPoints: 0,
    },
    { commitment: "finalized" },
  );
  return nft;
}
export async function updateMintActivity(privateKey: string, fileName: string, name: string, description: string, address: string): Promise<Sft | SftWithToken | Nft | NftWithToken> {
  const connection = getConnection();
  const user = getKeyPair("AUTHORITY")
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(user))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: "https://api.devnet.solana.com",
        timeout: 60000,
      }),
    )
  const buffer = fs.readFileSync("uploads/images/" + fileName);
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log(address);
  const { uri } = await metaplex.nfts().uploadMetadata({
    name: name,
    description: description,
    image: imageUri,
  });
  console.log("upload meta data====>uri:" + uri);
  const mintAddress = new PublicKey(address);
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
  return nft;
}
