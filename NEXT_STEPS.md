# Proximos pasos (Stock Bot)

## 1) Instalar dependencias
```bash
cd /Users/ivanflydevs/Documents/stock-bot
npm install
```

## 2) Configurar credenciales
Crear `.env` a partir de `.env.example` y completar:
- `MARKETSTACK_API_KEY`
- `LLM_BASE_URL`, `LLM_API_KEY`, `LLM_MODEL`
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, `WHATSAPP_TO`

## 3) Validar tickers en Marketstack
```bash
npm run validate:tickers
```

## 4) Probar ejecuciones locales
```bash
npm run run:long
npm run run:short
```

## 5) Despliegue (AWS Lambda + EventBridge)
- Crear dos reglas EventBridge:
  - Lunes 10:00 America/Argentina/Buenos_Aires → Long Term
  - Lunes 11:00 America/Argentina/Buenos_Aires → Short Term
- Subir Lambda con Node.js 18
- Configurar variables de entorno en Lambda
- Empaquetar con `node_modules`

## Notas
- El analisis es informativo con senales cautelosas.
- Si un ticker no tiene datos, se reporta y se omite.
- Presupuesto short term: 50 USD semanal.
- Presupuesto long term: 100 USD mensual.
