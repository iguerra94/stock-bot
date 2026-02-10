import twilio from "twilio";

const DEFAULT_MAX_LEN = 1500;

function maskPhone(value) {
  if (!value) return value;
  const raw = String(value);
  const digits = raw.replace(/\D/g, "");
  const tail = digits.slice(-4);
  return tail ? raw.replace(digits, `****${tail}`) : raw;
}

function chunkByLength(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  const paragraphs = text.split(/\n{2,}/);

  let current = "";

  for (const para of paragraphs) {
    const candidate = current ? `${current}\n\n${para}` : para;
    if (candidate.length <= maxLen) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (para.length <= maxLen) {
      current = para;
      continue;
    }

    // Fallback: hard split long paragraphs
    for (let i = 0; i < para.length; i += maxLen) {
      chunks.push(para.slice(i, i + maxLen));
    }
  }

  if (current) chunks.push(current);
  return chunks;
}

export async function sendWhatsApp({
  accountSid,
  authToken,
  from,
  to,
  body,
  maxLen = DEFAULT_MAX_LEN
}) {
  const client = twilio(accountSid, authToken);
  const parts = chunkByLength(body, maxLen);
  const sids = [];

  console.log(`[whatsapp] from=${maskPhone(from)} to=${maskPhone(to)} parts=${parts.length}`);

  for (const part of parts) {
    const msg = await client.messages.create({ from, to, body: part });
    sids.push(msg.sid);
  }

  return sids;
}

export async function sendWhatsAppTemplate({
  accountSid,
  authToken,
  from,
  to,
  contentSid,
  contentVariables
}) {
  const client = twilio(accountSid, authToken);
  const msg = await client.messages.create({
    from,
    to,
    contentSid,
    contentVariables: JSON.stringify(contentVariables)
  });

  return msg.sid;
}
