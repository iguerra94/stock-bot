import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { loadConfig, loadEnv } from "../../dist/config/config.js";

const REQUIRED_ENV = {
  MARKETSTACK_BASE_URL: "https://api.marketstack.com/v1",
  MARKETSTACK_API_KEY: "test-key",
  LLM_BASE_URL: "https://example-llm.com/v1",
  LLM_API_KEY: "llm-key",
  LLM_MODEL: "gpt-test",
  TWILIO_ACCOUNT_SID: "AC123",
  TWILIO_AUTH_TOKEN: "token",
  TWILIO_WHATSAPP_FROM: "whatsapp:+1234567890",
  WHATSAPP_TO: "whatsapp:+1098765432",
  TWILIO_WHATSAPP_CONTENT_SID: "HX123",
  REPORTS_BUCKET: "reports-bucket",
  REPORTS_URL_TTL_SEC: "3600",
  WHATSAPP_NAME: "Test User"
};

function clearEnv(keys) {
  for (const key of keys) {
    delete process.env[key];
  }
}

async function withEnv(vars, fn) {
  const prev = { ...process.env };
  Object.assign(process.env, vars);
  try {
    return await fn();
  } finally {
    process.env = prev;
  }
}

describe("config", () => {
  it("loadEnv throws when required env is missing", () => {
    clearEnv(Object.keys(REQUIRED_ENV));
    assert.throws(() => loadEnv(), /Missing env var/);
  });

  it("loadEnv returns parsed env", () => {
    return withEnv(REQUIRED_ENV, async () => {
      const env = loadEnv();
      assert.equal(env.marketstackApiKey, REQUIRED_ENV.MARKETSTACK_API_KEY);
      assert.equal(env.reportsUrlTtlSec, 3600);
    });
  });

  it("loadConfig reads local tickers.json when TICKERS_BUCKET is empty", async () => {
    const filePath = path.resolve(process.cwd(), "tickers.json");
    const payload = {
      timezone: "America/Argentina/Buenos_Aires",
      currency: "USD",
      long_term_budget_monthly: 500,
      short_term_budget_weekly: 200,
      long_term: ["AAPL"],
      short_term: ["TSLA"]
    };

    fs.writeFileSync(filePath, JSON.stringify(payload), "utf-8");

    try {
      await withEnv({ TICKERS_BUCKET: "" }, async () => {
        const cfg = await loadConfig();
        assert.equal(cfg.currency, "USD");
        assert.deepEqual(cfg.long_term, ["AAPL"]);
      });
    } finally {
      fs.unlinkSync(filePath);
    }
  });
});
