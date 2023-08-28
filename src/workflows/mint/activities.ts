
import { Keypair, PublicKey } from "@solana/web3.js";

import { getGrowthService, makeMetaplex } from "../../services/solana";
import { ICreativesScoresAirtable, ISoftrCreativesUser } from "../airtable/activities";

function wait(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}

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

export async function getScoreAccount(applicant: string) {
  const growth = getGrowthService();

  try {
    const scoreAccount = await growth.getScoreAccount(new PublicKey(applicant));
    return {
      scores: scoreAccount?.scores,
      scores_sum: scoreAccount?.scoresSum,
      reviews_sent: scoreAccount?.reviewsSent,
      reviews_recieved: scoreAccount?.reviewsRecieved,
      name: scoreAccount?.name,
      mint: scoreAccount?.mint.toBase58(),
      applicant: scoreAccount?.applicant.toBase58(),
      levels: [...scoreAccount?.levels],
      last_update: scoreAccount?.lastUpdate.toNumber(),
    }
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function register(fields: ISoftrCreativesUser, mint: string) {
  const growth = getGrowthService();
  try {
    return await growth.register(fields, new PublicKey(mint));
  } catch (err) {
    console.log(err);
    return undefined;
  }
}

export async function submitScore(score: ICreativesScoresAirtable) {
  const growth = getGrowthService();

  console.log("submit score", score.id, score);

  return await growth.submitScore(score);
}

export async function verify(applicant: string) {
  const growth = getGrowthService();

  await growth.verify(new PublicKey(applicant));
}

export async function createRegisterMint() {
  const growth = getGrowthService();
  const mint = await growth.createRegisterMint(new Keypair());
  await wait(1);
  return mint.toBase58();
}







