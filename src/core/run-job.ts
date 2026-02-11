import { loadConfig, loadEnv } from "@config";
import { fetchEodSeries } from "@services";
import { computeMetrics } from "./metrics";
import { buildLongTermPrompt, buildShortTermPrompt } from "./prompt";
import { generateWithLLM, sendWhatsAppTemplate, buildReportKey, createPresignedUrl, uploadReport } from "@services";

function formatDateISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export async function runJob(job) {
  if (!job || !["long", "short"].includes(job)) {
    throw new Error("job must be long or short");
  }

  console.log(`[run] start job=${job}`);
  const cfg = await loadConfig();
  const env = loadEnv();
  console.log("[run] config/env loaded");

  const tickers = job === "long" ? cfg.long_term : cfg.short_term;
  const missing = [];
  const summary = [];
  console.log(`[run] tickers=${tickers.length}`);

  for (const ticker of tickers) {
    try {
      console.log(`[market] fetching ${ticker}`);
      const series = await fetchEodSeries({
        baseUrl: env.marketstackBaseUrl,
        apiKey: env.marketstackApiKey,
        symbol: ticker,
        monthsBack: 6
      });

      const metrics = computeMetrics(series);
      if (!metrics) {
        missing.push(ticker);
        console.log(`[market] no-metrics ${ticker}`);
        continue;
      }

      summary.push({ ticker, ...metrics });
      console.log(`[market] ok ${ticker}`);
    } catch (err) {
      missing.push(ticker);
      console.log(`[market] error ${ticker}: ${err?.message || err}`);
    }
  }

  const prompt = job === "long"
    ? buildLongTermPrompt({ cfg, summary, missing })
    : buildShortTermPrompt({ cfg, summary, missing });

  console.log("[llm] generating report");
  const analysis = await generateWithLLM({
    baseUrl: env.llmBaseUrl,
    apiKey: env.llmApiKey,
    model: env.llmModel,
    prompt
  });
  console.log("[llm] report ready");

  const header = job === "long" ? "[Long Term] Informe semanal" : "[Short Term] Informe semanal";
  const body = `${header}\n\n${analysis}`;
  const reportDate = formatDateISO();
  const reportType = job === "long" ? "Long Term" : "Short Term";
  const reportKey = buildReportKey({ job, date: reportDate });

  console.log("[whatsapp] sending");
  await uploadReport({
    bucket: env.reportsBucket,
    key: reportKey,
    body
  });
  const reportUrl = await createPresignedUrl({
    bucket: env.reportsBucket,
    key: reportKey,
    expiresIn: env.reportsUrlTtlSec
  });
  const shortLink = `[Link](${reportUrl})`;

  const msgSid = await sendWhatsAppTemplate({
    accountSid: env.twilioAccountSid,
    authToken: env.twilioAuthToken,
    from: env.twilioFrom,
    to: env.whatsappTo,
    contentSid: env.twilioContentSid,
    contentVariables: {
      "1": env.whatsappName,
      "2": reportDate,
      "3": shortLink,
      "4": reportType
    }
  });
  console.log(`[whatsapp] sid=${msgSid} reportKey=${reportKey} ttl=${env.reportsUrlTtlSec}`);

  console.log(`[run] sent. missing=${missing.join(", ") || "none"}`);
}
