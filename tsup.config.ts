import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    "handlers/handler": "src/handlers/handler.ts",
    "handlers/lambda": "src/handlers/lambda.ts",
    "core/metrics": "src/core/metrics.ts",
    "core/prompt": "src/core/prompt.ts",
    "config/config": "src/config/config.ts",
    "services/report-storage": "src/services/report-storage.ts",
    "validators/check-tickers-config": "src/validators/check-tickers-config.ts",
    "validators/validate-tickers": "src/validators/validate-tickers.ts"
  },
  format: ["esm"],
  target: "node20",
  outDir: "dist",
  sourcemap: true,
  clean: true,
  bundle: true,
  splitting: false,
  platform: "node",
  external: [
    "@aws-sdk/client-s3",
    "@aws-sdk/s3-request-presigner",
    "dotenv",
    "luxon",
    "twilio"
  ],
  alias: {
    "@config": "src/config/index.ts",
    "@core": "src/core/index.ts",
    "@services": "src/services/index.ts",
    "@handlers": "src/handlers/index.ts",
    "@validators": "src/validators/index.ts"
  }
});
