import * as web3 from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
import { Keypair, Connection as conn } from "@solana/web3.js";
import * as jose from "jose";
import {
  Metaplex,
  PublicKey,
  bundlrStorage,
  keypairIdentity,
} from "@metaplex-foundation/js";
import { BN } from "bn.js";
import { GrowthService } from "./growth";
dotenv.config();
//test git
export async function airdrop(connection: web3.Connection, sol: number) {
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);
  const airdropSignature = await connection.requestAirdrop(
    keypairFromSecretKey.publicKey,
    sol * web3.LAMPORTS_PER_SOL
  );
  const latestBlockHash = await connection.getLatestBlockhash();

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  });
  const balance = await connection.getBalance(keypairFromSecretKey.publicKey);
  return balance;
}
export async function getBalance(connection: web3.Connection) {
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);
  const balance = await connection.getBalance(keypairFromSecretKey.publicKey);
  return balance;
}
export async function createKeypair(
  connection: web3.Connection,
  secretKeyAddress: string
): Promise<web3.Keypair> {
  const secret = JSON.parse(secretKeyAddress ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);

  return keypairFromSecretKey;
}
export function getGrowthService() {
  const c = getConnection();
  const decodedAuthorityKey = new Uint8Array(
    JSON.parse(
      fs.readFileSync(process.env.AUTHORITY_KEY_ADDRESS as string).toString()
    )
  );
  let authority = Keypair.fromSecretKey(decodedAuthorityKey);

  return new GrowthService(c, getKeyPair("AUTHORITY"), getKeyPair("MINT"));
}
const fromHexString = (hexString: string) =>
  Uint8Array.from(
    hexString!.match(/.{1,2}/g)!.map((byte) => parseInt(byte, 16))
  );
export function initializeKeypair(connection: web3.Connection): web3.Keypair {
  if (!process.env.PRIVATE_KEY) {
    console.log("Creating .env file");
    const signer = web3.Keypair.generate();
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`);
    airdropSolIfNeeded(signer, connection);

    return signer;
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[];
  const secretKey = Uint8Array.from(secret);
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey);

  // airdropSolIfNeeded(keypairFromSecretKey, connection)
  return keypairFromSecretKey;
}
export function getKeyPair(keyName: "AUTHORITY" | "MINT") {
  const decodedMintKey = new Uint8Array(
    JSON.parse(
      fs
        .readFileSync(process.env[`${keyName}_KEY_ADDRESS`] as string)
        .toString()
    )
  );
  return Keypair.fromSecretKey(decodedMintKey);
}
export function getConnection(cluster = process.env.SOLANA_CLUSTER) {
  return new conn(cluster as string);
}
export function makeMetaplex() {
  const connection = getConnection();
  const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(getKeyPair("AUTHORITY")));
  /*const metaplex = Metaplex.make(connection)
    .use(keypairIdentity(getKeyPair("AUTHORITY")))
    .use(
      bundlrStorage({
        address: "https://devnet.bundlr.network",
        providerUrl: process.env.SOLANA_CLUSTER,
        timeout: 60000,
      })
    );*/

  return metaplex;
}

export function makeSimpleMetaplex() {
  const connection = getConnection();
  const metaplex = new Metaplex(connection);
  return metaplex;
}
export function publicKeyFromBn(bn: string) {
  const bigNumber = new BN(bn, 16);
  const decoded = { _bn: bigNumber };
  return new PublicKey(decoded);
}

export async function getWalletPublicKeyFromIdToken(idToken: string) {
  const jwks = jose.createRemoteJWKSet(
    new URL("https://api.openlogin.com/jwks")
  );
  const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    algorithms: ["ES256"],
  });
  return publicKeyFromBn(
    (jwtDecoded.payload as any).wallets[0].public_key
  ).toBase58();
}

export async function getEmailFromIdToken(idToken: string) {
  const jwks = jose.createRemoteJWKSet(
    new URL("https://api.openlogin.com/jwks")
  );
  const jwtDecoded = await jose.jwtVerify(idToken, jwks, {
    algorithms: ["ES256"],
  });
  return (jwtDecoded.payload as any).email;
}

async function airdropSolIfNeeded(
  signer: web3.Keypair,
  connection: web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);

  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...");
    console.log(web3.LAMPORTS_PER_SOL + " sol");
    console.log("public key" + signer.publicKey.toString());
    try {
      const airdropSignature = await connection.requestAirdrop(
        signer.publicKey,
        web3.LAMPORTS_PER_SOL
      );
      console.log("Airdropping sended");

      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: airdropSignature,
      });

      const newBalance = await connection.getBalance(signer.publicKey);
      console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL);
    } catch (er) {
      console.log("Error Here: " + er);
    }
  }
}
