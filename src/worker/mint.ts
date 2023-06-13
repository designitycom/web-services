// @@@SNIPSTART typescript-hello-worker
import { NativeConnection, Worker } from '@temporalio/worker';
import fs from "fs"
import { Client, Connection, ConnectionOptions } from '@temporalio/client';

import * as activities from './../routers/test/workflow/activities';

let temporalConnConfig: ConnectionOptions;
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'sandbox') {
  temporalConnConfig = {
    address: process.env.TEMPORAL_ADDRESS!,
    tls: {
      clientCertPair: {
        crt: Buffer.from(fs.readFileSync(process.env.TEMPORAL_TLS_CRT!, 'utf8')),
        key: Buffer.from(fs.readFileSync(process.env.TEMPORAL_TLS_KEY!, 'utf8')),
      }
    },
  }
}

async function run() {
  // Step 1: Register Workflows and Activities with the Worker and connect to
  // the Temporal server.
  const connection = await Connection.connect(temporalConnConfig);
  const client = new Client({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || 'default'
    // namespace: 'foo.bar', // connects to 'default' namespace if not specified
  });
  const worker = await Worker.create({
    workflowsPath: require.resolve('./../routers/test/workflow/workflows'),
    activities,
    connection: await NativeConnection.connect({
      ...temporalConnConfig,
      metadata: undefined
    }),
    taskQueue: 'mint',
  });
  // Worker connects to localhost by default and uses console.error for logging.
  // Customize the Worker by passing more options to create():
  // https://typescript.temporal.io/api/classes/worker.Worker
  // If you need to configure server connection parameters, see docs:
  // https://docs.temporal.io/typescript/security#encryption-in-transit-with-mtls

  // Step 2: Start accepting tasks on the `hello-world` queue
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND