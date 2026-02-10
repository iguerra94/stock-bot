# Stock Bot (WhatsApp)

Bot semanal en Node.js para enviar dos informes por WhatsApp:
- **Martes 09:00 (America/Argentina/Buenos_Aires)** → Long Term
- **Martes 09:30 (America/Argentina/Buenos_Aires)** → Short Term

## Requisitos
- Node.js 20+
- API key de Marketstack
- Cuenta Twilio WhatsApp habilitada para mensajes salientes
- API key de un LLM con endpoint compatible con OpenAI Chat Completions
- Un bucket S3 privado para guardar reportes
- Una plantilla de WhatsApp aprobada en Twilio (Content SID)

## Configuración
1. Copiar `.env.example` a `.env` y completar variables.
2. Editar `tickers.json` con tus listas y presupuestos.

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
- `REPORTS_BUCKET`
- `REPORTS_URL_TTL_SEC` (segundos, ej. `86400`)

### Plantilla de WhatsApp
El envío usa **plantillas aprobadas** para cumplir con la ventana de 24 horas de WhatsApp.
El template recomendado (una sola plantilla) usa estas variables:
- `{{1}}` nombre
- `{{2}}` fecha (`YYYY-MM-DD`)
- `{{3}}` resumen corto
- `{{4}}` link firmado al reporte completo
- `{{5}}` tipo (`Long Term` / `Short Term`)

Ejemplo de texto:
```
Hola {{1}}, tu reporte semanal está listo ({{2}}).
Tipo: {{5}}
Resumen: {{3}}
Reporte completo: {{4}}
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

## Scripts
- `npm run validate:tickers`
- `npm run run:long`
- `npm run run:short`

## Notas
- El análisis es informativo, con señales cautelosas.
- Si un ticker no tiene datos, se reporta y se omite.
- El bot consulta datos de los últimos 6 meses por ticker (EOD).
- El reporte completo se guarda en S3 y se comparte con un link firmado que expira.

## Despliegue (AWS Lambda + EventBridge)
- El `serverless.yml` ya define dos schedules (martes 09:00 y 09:30 America/Argentina/Buenos_Aires).
- Deploy como Lambda con runtime Node.js (ver `serverless.yml`).
- Configurar variables de entorno en Lambda.
- Roles requeridos en GitHub Secrets:
  - `AWS_ROLE_ARN` (deploy role)
  - `AWS_LAMBDA_ROLE_ARN` (execution role)
  - `AWS_SCHEDULER_ROLE_ARN` (scheduler role)
- Empaquetar el proyecto con `node_modules`.
