import "dotenv/config";
import { loadConfig } from "@config";

async function run() {
  const cfg = await loadConfig();
  const longCount = Array.isArray(cfg.long_term) ? cfg.long_term.length : 0;
  const shortCount = Array.isArray(cfg.short_term) ? cfg.short_term.length : 0;
  console.log(`[check] ok long_term=${longCount} short_term=${shortCount}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
