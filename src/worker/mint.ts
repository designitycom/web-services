// @@@SNIPSTART typescript-hello-worker
import { Worker } from "@temporalio/worker";
import * as activities from "./../workflows/mint/activities";
import { createTemporalWorkerCon } from "../services/temporal";

async function run() {
  const connection = await createTemporalWorkerCon();
  const worker = await Worker.create({
    connection,
    namespace: process.env.TEMPORAL_NAMESPACE || "default",
    workflowsPath: require.resolve("./../workflows/mint/workflows"),
    activities,
    bundlerOptions: {
      // ignoreModules: ["path", "crypto", "stream", "events", "zlib", "util", "string_decoder"],
    },
    taskQueue: "mint",
  });
  await worker.run();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
// @@@SNIPEND
