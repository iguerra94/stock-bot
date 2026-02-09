import { DateTime } from "luxon";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function fetchEodSeries({
  baseUrl,
  apiKey,
  symbol,
  monthsBack = 6
}) {
  const base = baseUrl.replace(/\/+$/, "");
  const end = DateTime.now().toUTC().toISODate();
  const start = DateTime.now().toUTC().minus({ months: monthsBack }).toISODate();

  const url = new URL(`${base}/eod`);
  url.searchParams.set("access_key", apiKey);
  url.searchParams.set("symbols", symbol);
  url.searchParams.set("date_from", start);
  url.searchParams.set("date_to", end);
  url.searchParams.set("limit", "1000");

  console.log(`[marketstack] request symbol=${symbol} range=${start}..${end}`);
  const res = await fetch(url.toString());
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Marketstack error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const rows = data?.data || [];
  console.log(`[marketstack] ok symbol=${symbol} rows=${rows.length}`);

  // Respect 5 req/s limit in free tier
  await sleep(250);

  return rows.map((r) => ({
    date: r.date,
    close: r.close
  }));
}

export async function validateSymbol({ baseUrl, apiKey, symbol }) {
  const base = baseUrl.replace(/\/+$/, "");
  const url = new URL(`${base}/tickers/${symbol}`);
  url.searchParams.set("access_key", apiKey);

  const res = await fetch(url.toString());
  if (!res.ok) return { ok: false };
  const data = await res.json();
  if (data?.error) return { ok: false, error: data.error };

  const payload = data?.data ?? data;
  if (Array.isArray(payload)) return { ok: payload.length > 0 };
  if (payload && typeof payload === "object") {
    return payload.symbol
      ? { ok: payload.symbol.toUpperCase() === symbol.toUpperCase() }
      : { ok: true };
  }
  return { ok: false };
}
