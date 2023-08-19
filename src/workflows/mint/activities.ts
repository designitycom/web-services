
import { Keypair, PublicKey } from "@solana/web3.js";
import { Record } from "airtable";

import { getGrowthService, makeMetaplex } from "../../services/solana";
import { ICreativesScoresAirtable, ISoftrCreativesUser } from "../airtable/activities";

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

  const scoreAccount = await growth.getScoreAccount(new PublicKey(applicant));
  return {
    scores: scoreAccount?.scores,
    reviews_sent: scoreAccount?.reviewsSent,
    reviews_recieved: scoreAccount?.reviewsRecieved,
    name: scoreAccount?.name,
    mint: scoreAccount?.mint.toBase58(),
    applicant: scoreAccount?.applicant.toBase58(),
    levels: scoreAccount?.levels,
    last_update: scoreAccount?.lastUpdate,
  }
}

export async function register(record: Record<ISoftrCreativesUser>, mint: string) {
  const growth = getGrowthService();
  const applicant = record.fields["Wallet Address"];
  let scoreAccount = await getScoreAccount(applicant);
  if (!scoreAccount) {
    console.log("register",)
    await growth.register(record, new PublicKey(mint));
    scoreAccount = await getScoreAccount(applicant);
  }

  return scoreAccount;
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
  return mint.toBase58();
}







