# Stock Bot (WhatsApp)

Bot semanal en Node.js para enviar dos informes por WhatsApp:
- **Martes 20:00 (America/Argentina/Buenos_Aires)** → Long Term
- **Martes 20:30 (America/Argentina/Buenos_Aires)** → Short Term

## Requisitos
- Node.js 20+
- API key de Marketstack
- Cuenta Twilio WhatsApp habilitada para mensajes salientes
- API key de un LLM con endpoint compatible con OpenAI Chat Completions
- Un bucket S3 privado para guardar reportes
- Una plantilla de WhatsApp aprobada en Twilio (Content SID)

## Configuración
1. Copiar `.env.example` a `.env` y completar variables.
2. Subir `tickers.json` a tu bucket S3 privado y configurar su ubicación por env vars.

Variables de entorno:
- `MARKETSTACK_API_KEY`
- `MARKETSTACK_BASE_URL`
- `LLM_BASE_URL`
- `LLM_API_KEY`
- `LLM_MODEL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_WHATSAPP_CONTENT_SID`
- `TWILIO_WHATSAPP_FROM`
- `WHATSAPP_TO`
- `WHATSAPP_NAME`
- `TICKERS_BUCKET`
- `TICKERS_KEY`
- `REPORTS_BUCKET`
- `REPORTS_URL_TTL_SEC` (segundos, ej. `86400`)

### Plantilla de WhatsApp
El envío usa **plantillas aprobadas** para cumplir con la ventana de 24 horas de WhatsApp.
El template recomendado (una sola plantilla) usa estas variables:
- `{{1}}` nombre
- `{{2}}` fecha (`YYYY-MM-DD`)
- `{{3}}` link firmado al reporte completo
- `{{4}}` tipo (`Long Term` / `Short Term`)

Ejemplo de texto:
```
Hola {{1}}. Tu reporte {{4}} está listo ({{2}}).
Reporte completo: {{3}}
```

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

### Notas sobre `tickers.json`
- Se carga desde S3 usando `TICKERS_BUCKET` y `TICKERS_KEY`.

## Scripts
- `yarn build` (compila TypeScript a `dist/`)
- `yarn test` (compila y ejecuta tests con `node --test`)
- `yarn validate:tickers` (valida símbolos contra Marketstack)
- `yarn check:tickers` (verifica acceso a `tickers.json` y estructura mínima)
- `yarn run:long`
- `yarn run:short`

## Notas
- El análisis es informativo, con señales cautelosas.
- Si un ticker no tiene datos, se reporta y se omite.
- El bot consulta datos de los últimos 6 meses por ticker (EOD).
- El reporte completo se guarda en S3 y se comparte con un link firmado que expira.
- La Lambda necesita permiso `s3:GetObject` sobre `TICKERS_BUCKET`.

## Despliegue (AWS Lambda + EventBridge)
- El `serverless.yml` ya define dos schedules (martes 20:00 y 20:30 America/Argentina/Buenos_Aires).
- Deploy como Lambda con runtime Node.js (ver `serverless.yml`).
- Configurar variables de entorno en Lambda.
- Roles requeridos en GitHub Secrets:
  - `AWS_ROLE_ARN` (deploy role)
  - `AWS_LAMBDA_ROLE_ARN` (execution role)
  - `AWS_SCHEDULER_ROLE_ARN` (scheduler role)
- Otros secrets en GitHub Actions:
  - `AWS_REGION`
  - `SERVERLESS_ACCESS_KEY`
- El workflow de deploy se dispara cuando un PR a `main` es mergeado.
- El deploy de GitHub Actions corre `yarn test` (que compila y ejecuta los tests) antes de desplegar.
- El paquete de Lambda usa `dist/` y `node_modules` (ver `serverless.yml`).
