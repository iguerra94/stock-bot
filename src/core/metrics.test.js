import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { computeMetrics } from "../../dist/core/metrics.js";

function buildSeries(count = 12, start = 100, step = 1) {
  const out = [];
  const base = new Date("2024-01-01T00:00:00Z");
  for (let i = 0; i < count; i += 1) {
    const d = new Date(base);
    d.setUTCDate(d.getUTCDate() + i);
    out.push({ date: d.toISOString(), close: start + i * step });
  }
  return out;
}

describe("computeMetrics", () => {
  it("returns null when not enough data", () => {
    const series = buildSeries(5);
    assert.equal(computeMetrics(series), null);
  });

  it("computes metrics for valid data", () => {
    const series = buildSeries(30, 100, 2);
    const result = computeMetrics(series);
    assert.ok(result);
    assert.equal(result.lastClose, 100 + 29 * 2);
    assert.equal(result.trend, "alcista");
  });
});
