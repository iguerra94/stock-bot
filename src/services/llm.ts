export async function generateWithLLM({ baseUrl, apiKey, model, prompt }) {
  const url = new URL(`${baseUrl}/chat/completions`);

  console.log(`[llm] request model=${model} prompt_chars=${prompt.length}`);
  const res = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: "Eres un asistente experto en análisis financiero." },
        { role: "user", content: prompt }
      ],
      temperature: 0.4
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`LLM error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("LLM response missing content");
  console.log(`[llm] response chars=${content.length}`);
  return content.trim();
}
