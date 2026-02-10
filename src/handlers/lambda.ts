import { runJob } from "@core";

export const handler = async (event) => {
  const job = event?.job;
  await runJob(job);
  return { ok: true, job };
};
