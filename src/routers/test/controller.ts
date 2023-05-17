import controller from "../controller"
import { Request, Response } from "express";
import { Metaplex, keypairIdentity, bundlrStorage, toMetaplexFile } from "@metaplex-foundation/js";
import { Connection as conn, clusterApiUrl, Keypair, PublicKey } from "@solana/web3.js";
import { airdrop, createKeypair, getBalance, getKeyPair, initializeKeypair } from "../../services/solana";
import * as web3 from "@solana/web3.js"
import * as jose from 'jose'
import fs from "fs"


class TestController extends controller {
  check = async (req: Request, res: Response) => {

    const idToken = req.body.idToken
    const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
      algorithms: ["ES256"],
    });
    res.send((jwtDecoded.payload as any).wallets[0].public_key)

  }

  mint = async (req: Request, res: Response) => {
    // const idToken=req.body.idToken
    // const jwks = jose.createRemoteJWKSet(new URL("https://api.openlogin.com/jwks"));
    // const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    //   algorithms: ["ES256"],
    // });
    const name =req.body.name;
    console.log("nftname >>>>>>"+name);
    const description = req.body.description;
    console.log("nft description>>>>>"+ description);
    const privateKey = req.body.privateKey;
    // console.log((jwtDecoded.payload as any).wallets[0].public_key);
    // console.log((jwtDecoded.payload as any).wallets[0]);
    console.log(privateKey);
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
    const buffer = fs.readFileSync("uploads/images/index.jpg");
    console.log("make buffer");
    const file = toMetaplexFile(buffer, "image.png");
    console.log("to metaplex file");
    const imageUri = await metaplex.storage().upload(file);
    console.log("storage upload file");
    const { uri } = await metaplex.nfts().uploadMetadata({
      name: name,
      description: description,
      image: imageUri,
    });
    console.log("upload meta data====>uri:" + uri);
    const { nft } = await metaplex.nfts().create(
      {
        uri: uri,
        name: "My NFT",
        sellerFeeBasisPoints: 0,
      },
      { commitment: "finalized" },
    );
    console.log("create nft");
    console.log(`Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`);
    res.send("done");
  }


}

export default new TestController