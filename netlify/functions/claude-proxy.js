// Netlify serverless function for AWW Corpora.
// Proxies the website's AI requests to Google Gemini (free tier) so no per-use billing is needed.
// The API key is read from the GEMINI_API_KEY environment variable (set in the Netlify dashboard),
// so it is never exposed in the public HTML/JavaScript.
//
// It accepts the same request shape the website already sends ({ system, messages, max_tokens })
// and returns an Anthropic-style { content: [{ text }] } response, so the frontend works unchanged.
//
// To switch back to Claude later (e.g. once funded), replace this file with the Anthropic version
// and set ANTHROPIC_API_KEY instead. No frontend changes required.

exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: JSON.stringify({ error: "Method Not Allowed" }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Server is missing GEMINI_API_KEY environment variable." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return {
      statusCode: 400,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body." }),
    };
  }

  // Free-tier Gemini model. Overridable via env var without touching code.
  const model = process.env.GEMINI_MODEL || "gemini-2.5-flash";

  // Map the website's Anthropic-style messages -> Gemini "contents"
  const contents = (payload.messages || []).map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: typeof m.content === "string" ? m.content : "" }],
  }));

  const body = {
    contents,
    generationConfig: {
      maxOutputTokens: payload.max_tokens || 2000,
      temperature: 0.7,
    },
  };
  if (payload.system) {
    body.systemInstruction = { parts: [{ text: payload.system }] };
  }

  try {
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await resp.json();

    if (!resp.ok) {
      const msg = (data && data.error && data.error.message) || "Gemini API error";
      return {
        statusCode: resp.status,
        headers: { ...cors, "Content-Type": "application/json" },
        body: JSON.stringify({ error: msg, content: [{ text: "" }] }),
      };
    }

    // Extract generated text and strip any stray ``` code fences
    let text =
      (data.candidates &&
        data.candidates[0] &&
        data.candidates[0].content &&
        (data.candidates[0].content.parts || []).map((p) => p.text || "").join("")) ||
      "";
    text = text.replace(/^```(?:html)?\s*/i, "").replace(/\s*```$/i, "").trim();

    // Return in the Anthropic-style shape the website expects
    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ content: [{ text }] }),
    };
  } catch (err) {
    return {
      statusCode: 502,
      headers: { ...cors, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to reach Gemini API.", detail: String(err) }),
    };
  }
};
