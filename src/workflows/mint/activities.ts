
import { getGrowthService, makeMetaplex } from "../../services/solana";
import { MintDTO } from "../../models/mintDto";
import { BigQuery } from "@google-cloud/bigquery";
import { Keypair, PublicKey } from "@solana/web3.js";
import { IGrowthMasterAirtable } from "../airtable/activities";

export async function getMetaplexNFT(nftAddress: string) {
  const m = makeMetaplex();
  try {
    return m.nfts().findByMint({
      mintAddress: new PublicKey(nftAddress),
    }, {
      commitment: "confirmed",
      confirmOptions: {
        commitment: "confirmed"
      }
    });
  } catch (err) {
    console.error(err);
    return null;
  }
}

export async function scoreAccountDTO(scoreAccount: any) {
  return {
    mint: scoreAccount.mint.toBase58() as string,
    applicant: scoreAccount.applicant.toBase58() as string,
    name: scoreAccount.name as string,
    level: scoreAccount.levels as Array<string>,
    scores: scoreAccount.scores as Array<string>,
    scores_sum: scoreAccount.scoresSum as Array<string>,
    reviews_received: scoreAccount.reviewsRecieved,
    reviews_sent: scoreAccount.reviewsSent
  }
}

export async function getScoreAccount(applicant: string) {
  const growth = getGrowthService();

  const scoreAccount = await growth.getScoreAccount(new PublicKey(applicant));
  if (scoreAccount) {
    return scoreAccountDTO(scoreAccount);
  }
  return null;
}

export async function register(name: string, applicant: string, mint: string, levels: number[]) {
  const growth = getGrowthService();

  let scoreAccount = await getScoreAccount(applicant);
  if (!scoreAccount) {
    const scoreAccountLoaded = await growth.register(name, new PublicKey(applicant), new PublicKey(mint), levels);
    scoreAccount = await scoreAccountDTO(scoreAccountLoaded);
  }

  return scoreAccount;
}

export async function submitScore(applicant: string, score: IGrowthMasterAirtable) {
  const growth = getGrowthService();

  console.log("activity", applicant, score);

  return await growth.submitScore(new PublicKey(applicant), score);
}

export async function verify(applicant: string) {
  const growth = getGrowthService();

  await growth.verify(new PublicKey(applicant));
}

export async function createRegisterMint() {
  const growth = getGrowthService();
  const mint = await growth.createRegisterMint(new Keypair());
  return mint.toBase58();
}







