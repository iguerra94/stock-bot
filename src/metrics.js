export function computeMetrics(series) {
  const sorted = [...series]
    .filter((r) => Number.isFinite(r.close))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (sorted.length < 10) {
    console.log(`[metrics] insufficient data rows=${sorted.length}`);
    return null;
  }

  const last = sorted[sorted.length - 1];
  const lastClose = last.close;

  const closeAtOrBefore = (daysBack) => {
    const targetDate = new Date(last.date);
    targetDate.setUTCDate(targetDate.getUTCDate() - daysBack);

    for (let i = sorted.length - 1; i >= 0; i--) {
      const d = new Date(sorted[i].date);
      if (d <= targetDate) return sorted[i].close;
    }
    return sorted[0].close;
  };

  const weeklyClose = closeAtOrBefore(7);
  const threeMonthClose = closeAtOrBefore(90);
  const sixMonthClose = closeAtOrBefore(180);

  const pct = (now, then) => ((now - then) / then) * 100;

  const weeklyReturn = pct(lastClose, weeklyClose);
  const threeMonthReturn = pct(lastClose, threeMonthClose);
  const sixMonthReturn = pct(lastClose, sixMonthClose);

  const returns = [];
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1].close;
    const cur = sorted[i].close;
    if (prev > 0) returns.push((cur - prev) / prev);
  }
  const avg = returns.reduce((a, b) => a + b, 0) / (returns.length || 1);
  const variance = returns.reduce((a, b) => a + (b - avg) ** 2, 0) / (returns.length || 1);
  const volatility = Math.sqrt(variance) * 100;

  const trend = classifyTrend(threeMonthReturn, sixMonthReturn);

  console.log(`[metrics] ok last=${lastClose.toFixed(2)} trend=${trend}`);
  return {
    lastClose,
    weeklyReturn,
    threeMonthReturn,
    sixMonthReturn,
    volatility,
    trend
  };
}

function classifyTrend(three, six) {
  if (three > 0 && six > 0) return "alcista";
  if (three < 0 && six < 0) return "bajista";
  return "mixta";
}
