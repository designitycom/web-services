import controller from "../controller";
import { Request, Response } from "express";

import {
  getGrowthService,
} from "../../services/solana";
import fs from "fs";
import {  ConnectionOptions } from "@temporalio/client";

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
      await g.createOrganization("Designity", [4, 1, 1, 1, 1, 2, 1, 1, 1, 1], [2], [[25, 50, 75], [25, 75]], "https://public.designity.software", 15, 10520000);
    } catch (err) {
      console.error(err);
    }
  }
}

export default new TestController();
