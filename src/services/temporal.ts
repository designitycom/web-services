
import { Connection, Client, ConnectionOptions } from "@temporalio/client";
import fs from "fs";
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
export async function createTemporalClient() {
    const connection = await Connection.connect(temporalConnConfig);
    const client = new Client({
      connection,
      namespace: process.env.TEMPORAL_NAMESPACE || "default",
    });
    return client;
  }

  
  