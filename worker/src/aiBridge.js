// Multi-provider fallback matrix — updated model names for 2025/2026 free tiers

const AI_SYSTEM_PROMPT = `You are the core logic behind 'FakeChecker', a game about verifying football-related information as an intelligence clerk inside the Ministry of Verity. Generate detective-style verification cases and internal Ministry mail directives for the player.
Your questions must draw randomly from a diverse array of competitions:
- FIFA World Cup & UEFA European Championship
- UEFA Champions League & UEFA Europa League
- Domestic Leagues (England, Spain, France, Germany, Italy, Portugal, Scotland, Turkey, etc.)
- Georgian football history (e.g., Georgian national team, Dinamo Tbilisi 1981, Khvicha Kvaratskhelia, Giorgi Mamardashvili, etc.)

Output strictly as JSON containing:
{
  "batch_id": "2026-06-12T12:00:00Z",
  "questions": [
    {
      "id": "q_001",
      "type": "text",
      "headline": "A catchy news headline",
      "article": {
        "sourceName": "AI Football Archive",
        "publishedAt": "2026-06-12",
        "body": "The article body. It should contain enough ambiguity or evidence hooks for classification."
      },
      "evidence": [
        { "title": "Official Archive", "type": "official", "detail": "Short clue that helps classify the claim." }
      ],
      "redFlags": ["OPTIONAL_FLAG_NAME"],
      "mediaTag": null,
      "solution": {
        "verdict": "FAKE",
        "explanation": "Short reason why the verdict is correct."
      },
      "hint": "Optional short hint or explanation for the claim."
    }
  ],
  "emails": [
    {
      "id": "e_001",
      "label": "DIRECTIVE",
      "from": "INTELLIGENCE.DESK",
      "security": "INTERNAL",
      "subject": "Short Ministry directive about current information events",
      "body": [
        "Paragraph 1.",
        "Paragraph 2.",
        "Paragraph 3."
      ]
    }
  ]
}`;

const USER_PROMPT = "Generate 5 new global football verification cases and 2 internal Ministry mail directives in JSON format. Cases must use only TRUE or FAKE verdicts. Claims that are distorted, exaggerated, insufficiently confirmed, or rumor-based should use FAKE for this gamejam build. Mail directives must reference information events, source discipline, suspicious claims, classification policy, or active football intelligence themes. Use only the requested frontend schema. Output raw JSON only — no markdown, no code fences, no explanation.";

function extractJSON(raw, label) {
  if (raw == null) throw new Error(`${label}: field is ${raw === null ? "null" : "undefined"}`);
  let text = String(raw).replace(/```(?:json)?\s*([\s\S]*?)```/g, "$1");
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start)
    throw new Error(`${label}: no JSON object found. Preview: ${text.slice(0, 400)}`);
  try {
    return JSON.parse(text.substring(start, end + 1));
  } catch (e) {
    throw new Error(`${label}: JSON.parse failed — ${e.message}. Slice: ${text.substring(start, start + 400)}`);
  }
}

// TIER 1: Gemini
// Use only Flash Lite to keep generation on the intended low-cost/free-tier model.
export async function tryGemini(apiKey, modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT }] }],
      generationConfig: { maxOutputTokens: 1200, temperature: 0.7 }
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  if (!json.candidates?.length)
    throw new Error(`No candidates. blockReason: ${json.promptFeedback?.blockReason ?? "unknown"}`);
  if (json.candidates[0].finishReason && json.candidates[0].finishReason !== "STOP")
    throw new Error(`Bad finishReason: ${json.candidates[0].finishReason}`);
  return extractJSON(json.candidates[0]?.content?.parts?.[0]?.text, `Gemini[${modelName}]`);
}

// TIER 2/3: OpenAI-compatible (Grok, OpenRouter)
export async function tryOpenAICompat(url, apiKey, modelName) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: modelName,
      messages: [{ role: "user", content: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT }],
      max_tokens: 1200,
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  if (!json.choices?.length) throw new Error(`No choices. Body: ${JSON.stringify(json).slice(0, 300)}`);
  if (json.choices[0].finish_reason === "length") throw new Error("Output truncated (finish_reason: length)");
  return extractJSON(json.choices[0]?.message?.content, `[${modelName}]`);
}

// TIER 4: Cohere
// command-r was removed Sept 2025 — use command-r-08-2024 or command-r-plus-08-2024
export async function tryCohere(apiKey) {
  const res = await fetch("https://api.cohere.ai/v2/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: "command-r-08-2024",
      messages: [{ role: "user", content: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT }],
      max_tokens: 1200,
      temperature: 0.7
    })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = await res.json();
  // Cohere v2 response shape: json.message.content[0].text
  const raw = json?.message?.content?.[0]?.text ?? json?.text;
  return extractJSON(raw, "Cohere[command-r-08-2024]");
}

// MAIN GATEWAY
export async function generateDailyContent(env) {
  const errors = [];

  // Stage 1 — Gemini Flash Lite only
  if (env.AI_API_KEY) {
    for (const model of ["gemini-2.0-flash-lite"]) {
      try {
        console.log(`[Bridge] Trying Gemini/${model}`);
        const r = await tryGemini(env.AI_API_KEY, model);
        console.log(`[Bridge] ✅ Gemini/${model} OK`);
        return r;
      } catch (e) {
        errors.push(`Gemini/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ Gemini/${model}:`, e.message);
      }
    }
  } else { errors.push("Gemini: AI_API_KEY not bound"); }

  // Stage 2 — xAI Grok
  // IMPORTANT: get your key from https://console.x.ai — it must NOT start with "gs"
  // Free-tier models: grok-3-mini, grok-3-mini-fast
  if (env.GROK_API_KEY) {
    for (const model of ["grok-3-mini-fast", "grok-3-mini"]) {
      try {
        console.log(`[Bridge] Trying Grok/${model}`);
        const r = await tryOpenAICompat("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, model);
        console.log(`[Bridge] ✅ Grok/${model} OK`);
        return r;
      } catch (e) {
        errors.push(`Grok/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ Grok/${model}:`, e.message);
      }
    }
  } else { errors.push("Grok: GROK_API_KEY not bound"); }

  // Stage 3 — OpenRouter free endpoints (working models as of 2026)
  if (env.OPENROUTER_API_KEY) {
    for (const model of [
      "nex-agi/nex-n2-pro:free",
      "nvidia/nemotron-3.5-content-safety:free",
      "nvidia/nemotron-3-ultra-550b-a55b:free",
      "openrouter/owl-alpha",
      "nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
      "poolside/laguna-xs.2:free"
    ]) {
      try {
        console.log(`[Bridge] Trying OpenRouter/${model}`);
        const r = await tryOpenAICompat(
          "https://openrouter.ai/api/v1/chat/completions",
          env.OPENROUTER_API_KEY,
          model
        );
        console.log(`[Bridge] ✅ OpenRouter/${model} OK`);
        return r;
      } catch (e) {
        errors.push(`OpenRouter/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ OpenRouter/${model}:`, e.message);
      }
    }
  } else { errors.push("OpenRouter: OPENROUTER_API_KEY not bound"); }

  // Stage 4 — Cohere (v2 API, command-r-08-2024)
  if (env.COHERE_API_KEY) {
    try {
      console.log(`[Bridge] Trying Cohere/command-r-08-2024`);
      const r = await tryCohere(env.COHERE_API_KEY);
      console.log(`[Bridge] ✅ Cohere OK`);
      return r;
    } catch (e) {
      errors.push(`Cohere: ${e.message}`);
      console.warn(`[Bridge] ❌ Cohere:`, e.message);
    }
  } else { errors.push("Cohere: COHERE_API_KEY not bound"); }

  throw new Error("All providers failed:\n" + errors.join("\n"));
}

