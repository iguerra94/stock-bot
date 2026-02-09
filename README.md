# Stock Bot (WhatsApp)

Bot semanal en Node.js para enviar dos informes por WhatsApp:
- **Lunes 17:00 (America/Argentina/Buenos_Aires)** → Long Term
- **Lunes 17:30 (America/Argentina/Buenos_Aires)** → Short Term

## Requisitos
- Node.js 20+
- API key de Marketstack
- Cuenta Twilio WhatsApp habilitada para mensajes salientes
- API key de un LLM con endpoint compatible con OpenAI Chat Completions

## Configuración
1. Copiar `.env.example` a `.env` y completar variables.
2. Editar `tickers.json` con tus listas y presupuestos.

Variables de entorno:
- `MARKETSTACK_API_KEY`
- `MARKETSTACK_BASE_URL` (opcional, default `https://api.marketstack.com/v1`)
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_FROM`
- `WHATSAPP_TO`

### Formato de `tickers.json`
Campos requeridos:
- `timezone` (ej: `America/Argentina/Buenos_Aires`)
- `currency` (ej: `USD`)
- `long_term_budget_monthly` (número)
- `short_term_budget_weekly` (número)
- `long_term` (array de tickers)
- `short_term` (array de tickers)

Opcionales:
- `short_term_can_suggest`: `strong_only` para sugerir nuevos tickers solo con señal fuerte.

## Scripts
- `npm run validate:tickers`
- `npm run run:long`
- `npm run run:short`

## Notas
- El análisis es informativo, con señales cautelosas.
- Si un ticker no tiene datos, se reporta y se omite.
- El bot consulta datos de los últimos 6 meses por ticker (EOD).

## Despliegue (AWS Lambda + EventBridge)
- El `serverless.yml` ya define dos schedules (lunes 17:00 y 17:30 America/Argentina/Buenos_Aires).
- Deploy como Lambda con runtime Node.js (ver `serverless.yml`).
- Configurar variables de entorno en Lambda.
- Empaquetar el proyecto con `node_modules`.
