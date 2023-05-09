import * as web3 from "@solana/web3.js"
import * as fs from "fs"
import dotenv from "dotenv"
dotenv.config()

export async function airdrop(
  connection: web3.Connection,
  sol : number
){
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  const airdropSignature = await connection.requestAirdrop(
    keypairFromSecretKey.publicKey,
    sol*web3.LAMPORTS_PER_SOL
  )
  const latestBlockHash = await connection.getLatestBlockhash()

  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airdropSignature,
  })
  const balance = await connection.getBalance(keypairFromSecretKey.publicKey)
  return balance
}
export async function getBalance(
  connection: web3.Connection
){
  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  const balance = await connection.getBalance(keypairFromSecretKey.publicKey)
  return balance

}
export async function createKeypair(
  connection: web3.Connection,
  secretKeyAddress:string
): Promise<web3.Keypair> {

  const secret = JSON.parse(secretKeyAddress ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  
  return keypairFromSecretKey
}
export function initializeKeypair(
  connection: web3.Connection
): web3.Keypair {
  if (!process.env.PRIVATE_KEY) {
    console.log("Creating .env file")
    const signer = web3.Keypair.generate()
    fs.writeFileSync(".env", `PRIVATE_KEY=[${signer.secretKey.toString()}]`)
    airdropSolIfNeeded(signer, connection)

    return signer
  }

  const secret = JSON.parse(process.env.PRIVATE_KEY ?? "") as number[]
  const secretKey = Uint8Array.from(secret)
  const keypairFromSecretKey = web3.Keypair.fromSecretKey(secretKey)
  
  airdropSolIfNeeded(keypairFromSecretKey, connection)
  return keypairFromSecretKey
}

async function airdropSolIfNeeded(
  signer: web3.Keypair,
  connection: web3.Connection
) {
  const balance = await connection.getBalance(signer.publicKey)
  console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL)

  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...")
    console.log(web3.LAMPORTS_PER_SOL+" sol")
    console.log("public key"+signer.publicKey.toString())
    try{

    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      web3.LAMPORTS_PER_SOL
    )
    console.log("Airdropping sended")

    const latestBlockHash = await connection.getLatestBlockhash()

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    })

    const newBalance = await connection.getBalance(signer.publicKey)
    console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL)
    }catch(er){
        console.log('Error Here: '+er)
    }
  }
}