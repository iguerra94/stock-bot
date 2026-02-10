import fs from "node:fs";
import path from "node:path";

export function loadConfig() {
  const filePath = path.resolve(process.cwd(), "tickers.json");
  console.log(`[config] loading ${filePath}`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const cfg = JSON.parse(raw);

  const required = [
    "timezone",
    "currency",
    "long_term_budget_monthly",
    "short_term_budget_weekly",
    "long_term",
    "short_term"
  ];

  for (const key of required) {
    if (cfg[key] === undefined) {
      throw new Error(`Missing config key: ${key}`);
    }
  }

  if (!Array.isArray(cfg.long_term) || !Array.isArray(cfg.short_term)) {
    throw new Error("long_term and short_term must be arrays");
  }

  console.log("[config] ok");
  return cfg;
}

export function loadEnv() {
  const env = process.env;
  const required = [
    "MARKETSTACK_BASE_URL",
    "MARKETSTACK_API_KEY",
    "LLM_BASE_URL",
    "LLM_API_KEY",
    "LLM_MODEL",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_WHATSAPP_FROM",
    "WHATSAPP_TO",
    "TWILIO_WHATSAPP_CONTENT_SID",
    "REPORTS_BUCKET",
    "REPORTS_URL_TTL_SEC",
    "WHATSAPP_NAME"
  ];

  for (const key of required) {
    if (!env[key]) {
      throw new Error(`Missing env var: ${key}`);
    }
  }

  console.log("[env] ok");
  const reportsUrlTtlSec = Number.parseInt(env.REPORTS_URL_TTL_SEC, 10);
  if (!Number.isFinite(reportsUrlTtlSec) || reportsUrlTtlSec <= 0) {
    throw new Error("REPORTS_URL_TTL_SEC must be a positive integer");
  }

  return {
    marketstackApiKey: env.MARKETSTACK_API_KEY,
    marketstackBaseUrl: env.MARKETSTACK_BASE_URL,
    llmBaseUrl: env.LLM_BASE_URL,
    llmApiKey: env.LLM_API_KEY,
    llmModel: env.LLM_MODEL,
    twilioAccountSid: env.TWILIO_ACCOUNT_SID,
    twilioAuthToken: env.TWILIO_AUTH_TOKEN,
    twilioFrom: env.TWILIO_WHATSAPP_FROM,
    whatsappTo: env.WHATSAPP_TO,
    twilioContentSid: env.TWILIO_WHATSAPP_CONTENT_SID,
    whatsappName: env.WHATSAPP_NAME,
    reportsBucket: env.REPORTS_BUCKET,
    reportsUrlTtlSec
  };
}
