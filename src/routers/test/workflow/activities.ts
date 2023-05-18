import { clusterApiUrl } from "@solana/web3.js";
import { Connection as conn} from "@solana/web3.js";
import { getKeyPair } from "../../../services/solana";
import fs from "fs"
import { Metaplex, bundlrStorage, keypairIdentity, toMetaplexFile } from "@metaplex-foundation/js";

export async function mintActivity(name: string): Promise<string> {
    return `Hello, ${name}!`;
  }

export async function makeMetaplex(privateKey:string) {
    const connection = new conn(clusterApiUrl("devnet"))
    const user = await getKeyPair(privateKey, connection)
    console.log("PublicKey:", user.publicKey.toBase58())
    const metaplex = Metaplex.make(connection)
      .use(keypairIdentity(user))
      .use(
        bundlrStorage({
          address: "https://devnet.bundlr.network",
          providerUrl: "https://api.devnet.solana.com",
          timeout: 60000,
        }),
      )
    console.log("make metaplex");
    return metaplex;
}

export async function imageuri(metaplex:Metaplex,fileName:string){
  console.log("make metaplex");
  const buffer = fs.readFileSync("uploads/images/"+fileName);
  console.log("make buffer");
  const file = toMetaplexFile(buffer, "image.png");
  console.log("to metaplex file");
  const imageUri = await metaplex.storage().upload(file);
  console.log("storage upload file");
}

export async function createNft(metaplex:Metaplex,name:string,description:string,imageUri:string) {
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