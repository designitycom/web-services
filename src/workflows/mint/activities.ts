
import { getGrowthService, makeMetaplex } from "../../services/solana";
import { MintDTO } from "../../models/mintDto";
import { BigQuery } from "@google-cloud/bigquery";
import { Keypair, PublicKey } from "@solana/web3.js";

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

export async function verify(nftAddress: string) {
  // TODO: verify with growth service
}

export async function scoreAccountDTO(scoreAccount: any) {
  return {
    mint: scoreAccount.mint.toBase58() as string,
    applicant: scoreAccount.applicant.toBase58() as string,
    name: scoreAccount.name as string,
    level:scoreAccount.level as string,
    scores:scoreAccount.score as string,
    scores_sum:scoreAccount.scores_sum as string
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
    const storeAccount2 = await growth.register(name, new PublicKey(applicant), new PublicKey(mint), levels);
    scoreAccount = await scoreAccountDTO(storeAccount2);
  }

  return scoreAccount;
}

export async function createRegisterMint() {
  const growth = getGrowthService();
  const mint = await growth.createRegisterMint(new Keypair());
  return mint.toBase58();
}


// ------------------------------------------------>

//end of getAllNFT

export async function getMintDtoFromBigQuery(mintDTO: MintDTO): Promise<any> {
  const bigquery = new BigQuery({
    keyFilename: process.env.BIGQUERY_SERVICEACCOUNT || "bigquery-sa.json",
    projectId: "designitybigquerysandbox",
    scopes: [
      "https://www.googleapis.com/auth/cloud-platform",
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/bigquery",
    ],
  });
  // ASH-> define the query
  const query = `SELECT *
  FROM \`${process.env.GCP_PROJECT_ID}.${process.env.BIGQUERY_EMAILS_DATASET}.${process.env.BIGQUERY_EMAILS_TABLE}\`
  LIMIT 100`;

  // console.log(query);
  const options = {
    query: query,
    location: "US",
  };

  //Run the query
  const [rows] = await bigquery.query(options);

  const result = rows.find((row) => row.Email == mintDTO.email);
  if (result != undefined) {
    mintDTO.role = result.Role;
    mintDTO.level = result.Level;
    mintDTO.name = result.Name;
  } else {

  }
  console.log("userDTO in activity", mintDTO);

  return mintDTO;
}




