# Stock Bot (WhatsApp)

Bot semanal en Node.js para enviar dos informes por WhatsApp:
- **Lunes 10:00** → Long Term
- **Lunes 11:00** → Short Term

## Requisitos
- Node.js 18+
- API key de Marketstack
- Cuenta Twilio WhatsApp
- API key de un LLM con endpoint compatible con OpenAI Chat Completions

## Configuración
1. Copiar `.env.example` a `.env` y completar variables.
2. Editar `tickers.json` con tus listas y presupuestos.

## Scripts
- `npm run validate:tickers`
- `npm run run:long`
- `npm run run:short`

## Notas
- El análisis es informativo, con señales cautelosas.
- Si un ticker no tiene datos, se reporta y se omite.

## Despliegue (AWS Lambda + EventBridge)
- Crear dos reglas EventBridge (lunes 10:00 y 11:00 America/Argentina/Buenos_Aires).
- Deploy como Lambda con Node.js 18.
- Configurar variables de entorno en Lambda.
- Empaquetar el proyecto con `node_modules`.
