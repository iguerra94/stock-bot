export function buildLongTermPrompt({ cfg, summary, missing }) {
  const lines = summary.map((s) => {
    return `- ${s.ticker}: cierre=${fmt(s.lastClose)} ${cfg.currency}, semana=${fmtPct(s.weeklyReturn)}, 3m=${fmtPct(s.threeMonthReturn)}, 6m=${fmtPct(s.sixMonthReturn)}, tendencia=${s.trend}, vol=${fmtPct(s.volatility)}`;
  });

  const missingLine = missing.length
    ? `\nTickers sin datos: ${missing.join(", ")}.`
    : "";

  return `Eres un analista financiero. Genera un resumen en español de largo plazo.\n\nContexto:\n- Horizonte: largo plazo.\n- Presupuesto mensual: ${cfg.long_term_budget_monthly} ${cfg.currency}.\n- No dar mandato explícito de compra/venta; usar señales con cautela.\n- Usa un lenguaje simple y cercano, sin tecnicismos.\n\nDatos semanales + tendencia 3/6 meses:\n${lines.join("\n")}${missingLine}\n\nEntrega:\n- Un resumen ejecutivo de 3-5 líneas con lenguaje claro para no expertos.\n- Por cada ticker: señal cautelosa (mantener/reforzar/revisar) + motivo explicado en palabras simples.\n- Indicar si la tendencia de 3/6 meses apoya mantener o ir acumulando poco a poco.\n- Mencionar riesgos clave o alertas macro si aplica, sin jerga.\n- Sugerir un uso tentativo del presupuesto mensual si hay señales claras, explicado de forma simple.\n- Cierre con recordatorio de que es informativo y no es consejo financiero.\n`;
}

export function buildShortTermPrompt({ cfg, summary, missing }) {
  const lines = summary.map((s) => {
    return `- ${s.ticker}: cierre=${fmt(s.lastClose)} ${cfg.currency}, semana=${fmtPct(s.weeklyReturn)}, 3m=${fmtPct(s.threeMonthReturn)}, 6m=${fmtPct(s.sixMonthReturn)}, tendencia=${s.trend}, vol=${fmtPct(s.volatility)}`;
  });

  const missingLine = missing.length
    ? `\nTickers sin datos: ${missing.join(", ")}.`
    : "";

  const suggestRule = cfg.short_term_can_suggest === "strong_only"
    ? "Solo sugerir nuevos tickers si la señal es fuerte y clara."
    : "Puedes sugerir nuevos tickers si ves oportunidades claras.";

  return `Eres un analista financiero. Genera un análisis short/medium term en español.\n\nContexto:\n- Horizonte: corto/medio plazo.\n- Presupuesto semanal disponible: ${cfg.short_term_budget_weekly} ${cfg.currency}.\n- No siempre se compra; prioriza señales y oportunidades.\n- ${suggestRule}\n- No dar mandato explícito de compra/venta; usar señales con cautela.\n- Usa un lenguaje simple y cercano, sin tecnicismos.\n\nDatos semanales + tendencia 3/6 meses:\n${lines.join("\n")}${missingLine}\n\nEntrega:\n- Resumen ejecutivo (3-5 líneas) enfocado en oportunidades, con lenguaje claro para no expertos.\n- Por cada ticker: señal cautelosa (posible compra/venta/esperar) + motivo explicado en palabras simples.\n- Si corresponde, 1-3 oportunidades adicionales con explicación breve y sin jerga.\n- Sugerir un uso tentativo del presupuesto (solo si hay señales fuertes) explicado de forma simple.\n- Cierre con recordatorio de que es informativo y no es consejo financiero.\n`;
}

function fmt(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "N/A";
  return n.toFixed(2);
}

function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "N/A";
  return `${n.toFixed(2)}%`;
}
