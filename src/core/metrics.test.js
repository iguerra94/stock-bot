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

  it("classifies trend as bajista when 3m and 6m returns are both negative", () => {
    const series = buildSeries(220, 500, -1);
    const result = computeMetrics(series);
    assert.ok(result);
    assert.equal(result.trend, "bajista");
  });

  it("classifies trend as mixta when returns disagree", () => {
    const base = new Date("2024-01-01T00:00:00Z");
    const series = [];
    for (let i = 0; i < 181; i += 1) {
      const d = new Date(base);
      d.setUTCDate(d.getUTCDate() + i);
      let close = 100 + i * (200 / 90);
      if (i >= 90) close = 300 - ((i - 90) * (100 / 90));
      series.push({ date: d.toISOString(), close });
    }
    const result = computeMetrics(series);
    assert.ok(result);
    assert.equal(result.trend, "mixta");
  });

  it("filters invalid close values and still computes metrics", () => {
    const series = buildSeries(30, 100, 1);
    series.push({ date: "2024-02-15T00:00:00Z", close: Number.NaN });
    const result = computeMetrics(series);
    assert.ok(result);
    assert.equal(Number.isFinite(result.volatility), true);
  });
});
