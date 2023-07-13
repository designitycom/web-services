// @@@SNIPSTART typescript-hello-worker
import { Worker } from "@temporalio/worker";
import * as activities from "./../workflows/airtable/activities";
import { createTemporalWorkerCon } from "../services/temporal";

async function run() {
  const connection = await createTemporalWorkerCon();
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    workflowsPath: require.resolve("./../workflows/airtable/workflows"),
    activities,
    taskQueue: "airtable",
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
