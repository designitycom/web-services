
import { Connection as conn } from "@solana/web3.js";
export class MintDTO {
  wfId!: string;
  name!: string;
  description!:string;
  privateKey!:string;
  role!:string;
  fileName!:string;
  mintAddress!:string;
}
