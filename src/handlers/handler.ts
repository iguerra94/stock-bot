import "dotenv/config";
import { runJob } from "@core";

function parseArgs() {
  const args = process.argv.slice(2);
  const jobArg = args.find((a) => a.startsWith("--job="));
  if (!jobArg) return null;
  return jobArg.split("=")[1];
}

async function run() {
  const job = parseArgs();
  if (!job || !["long", "short"].includes(job)) {
    throw new Error("Usage: node src/handlers/handler --job=long|short");
  }

  await runJob(job);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
