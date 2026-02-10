import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildReportKey } from "../../dist/services/report-storage.js";

describe("report storage", () => {
  it("builds report key with job and date", () => {
    const key = buildReportKey({ job: "long", date: "2024-01-02" });
    assert.equal(key, "reports/long/2024-01-02/report.txt");
  });
});
