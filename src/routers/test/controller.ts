import controller from "../controller";
import { Request, Response } from "express";
import * as path from "path";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
  Metadata,
} from "@metaplex-foundation/js";
import {
  Connection as conn,
  clusterApiUrl,
  Keypair,
  PublicKey,
} from "@solana/web3.js";
import {
  airdrop,
  createKeypair,
  getBalance,
  getConnection,
  getGrowthService,
  getKeyPair,
  initializeKeypair,
} from "../../services/solana";
import * as web3 from "@solana/web3.js";
import * as jose from "jose";
import fs from "fs";
import { Connection, Client, ConnectionOptions } from "@temporalio/client";
import {
  getStatus,
  isBlockedQuery,
  mint,
  signals,
  unblockSignal,
  updateMint,
} from "./workflow/workflows";
import { NativeConnection, Worker } from "@temporalio/worker";
import * as activities from "./workflow/activities";
import { nanoid } from "nanoid";
import { cli } from "winston/lib/winston/config";
import { BigQuery } from "@google-cloud/bigquery";
import { validationResult } from "express-validator";
import { GrowthService } from "../../services/growth";

let temporalConnConfig: ConnectionOptions;

if (
  process.env.NODE_ENV === "production" ||
  process.env.NODE_ENV === "sandbox"
) {
  temporalConnConfig = {
    address: process.env.TEMPORAL_ADDRESS!,
    tls: {
      clientCertPair: {
        crt: Buffer.from(
          fs.readFileSync(process.env.TEMPORAL_TLS_CRT!, "utf8")
        ),
        key: Buffer.from(
          fs.readFileSync(process.env.TEMPORAL_TLS_KEY!, "utf8")
        ),
      },
    },
  };
}

class TestController extends controller {

  growth = async (req: Request, res: Response) => {
    const g = getGrowthService();
    try {
      await g.createOrganization("Designity", [4, 1, 1, 1, 1, 2, 1, 1, 1, 1], [2], [[25, 50, 75], [25, 75]], "https://public.designity.software", 5);
    } catch (err) {
      console.error(err);
    }
  }
}

export default new TestController();
