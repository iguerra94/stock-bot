import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildLongTermPrompt, buildShortTermPrompt } from "../../dist/core/prompt.js";

const cfg = {
  currency: "USD",
  long_term_budget_monthly: 500,
  short_term_budget_weekly: 200,
  short_term_can_suggest: "strong_only"
};

const summary = [
  {
    ticker: "AAPL",
    lastClose: 150,
    weeklyReturn: 1.5,
    threeMonthReturn: 4.2,
    sixMonthReturn: 9.8,
    volatility: 2.1,
    trend: "alcista"
  }
];

describe("prompts", () => {
  it("builds long term prompt with summary and missing tickers", () => {
    const text = buildLongTermPrompt({
      cfg,
      summary,
      missing: ["TSLA"]
    });
    assert.ok(text.includes("AAPL"));
    assert.ok(text.includes("Tickers sin datos: TSLA"));
    assert.ok(text.includes("largo plazo"));
  });

  it("builds short term prompt with suggestion rule", () => {
    const text = buildShortTermPrompt({
      cfg,
      summary,
      missing: []
    });
    assert.ok(text.includes("corto/medio plazo"));
    assert.ok(text.includes("Solo sugerir nuevos tickers"));
  });
});
