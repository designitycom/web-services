// @@@SNIPSTART typescript-hello-worker
import { NativeConnection, Worker } from '@temporalio/worker';
import fs from "fs"
import { Client, Connection, ConnectionOptions } from '@temporalio/client';

import * as activities from "./../workflows/mint/activities";

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

async function run() {
  const connection = await NativeConnection.connect({
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
  });
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    workflowsPath: require.resolve("./../workflows/mint/workflows"),
    activities,
    taskQueue: "mint",
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND