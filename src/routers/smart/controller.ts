import controller from "../controller";
import { Request, Response } from "express";
import * as anchor from "@coral-xyz/anchor";
import * as fs from "fs";
import * as path from "path";
import { Program } from "@coral-xyz/anchor";
import { Growth } from "../../types/growth";
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  createMint,
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
} from "@metaplex-foundation/js";
import { describe, it } from "node:test";

class SmartController extends controller {
  callSmart = async (req: Request, res: Response) => {
    
    const orgMint = Keypair.generate();

    const decodedAuthorityKey = new Uint8Array(
      JSON.parse(
        fs.readFileSync(path.join(__dirname, "../../../authority.json")).toString()
      )
    );

    let authority = Keypair.fromSecretKey(decodedAuthorityKey);
    this.myResponse(res, 200, null, "set workflow");
  };
} // end of MintController

export default new SmartController();
