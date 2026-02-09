import "dotenv/config";
import { loadConfig, loadEnv } from "./config.js";
import { validateSymbol } from "./marketstack.js";

async function run() {
  const cfg = loadConfig();
  const env = loadEnv();
  const all = [...new Set([...cfg.long_term, ...cfg.short_term])];

  const results = [];
  for (const ticker of all) {
    const { ok } = await validateSymbol({
      baseUrl: env.marketstackBaseUrl,
      apiKey: env.marketstackApiKey,
      symbol: ticker
    });
    results.push({ ticker, ok });
  }

  for (const r of results) {
    console.log(`${r.ticker}: ${r.ok ? "OK" : "NO DATA"}`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
