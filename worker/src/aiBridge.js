// Multi-provider fallback matrix with full null-safety and debug tracing.

const AI_SYSTEM_PROMPT = `You are the core logic behind 'FakeChecker', generating true/false scenarios for a player.
Output strictly as JSON containing:
{
  "batch_id": "2026-06-12T12:00:00Z",
  "questions": [
    {
      "id": "q_001",
      "headline": "A catchy news headline",
      "content": "The actual full text of the article claiming something crazy.",
      "hints": ["Hint 1", "Hint 2"],
      "is_fake": true,
      "difficulty": 2
    }
  ],
  "emails": [
    {
      "id": "e_001",
      "sender": "Director <mgmt@ministry.gov>",
      "subject": "Performance Review",
      "body": "Text of the email"
    }
  ]
}`;

const USER_PROMPT = "Generate 5 new questions and 1 random email in JSON format. Output raw JSON only, no markdown, no code fences, no explanation.";

/**
 * Extracts and parses the first valid JSON object from a model response string.
 * Handles: undefined input, markdown fences, surrounding prose.
 */
function extractJSON(raw, label) {
  if (raw == null) {
    throw new Error(`${label}: response field is ${raw === null ? "null" : "undefined"}`);
  }

  let text = String(raw);

  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  text = text.replace(/```(?:json)?[\s\S]*?```/g, (match) => {
    // Keep the inner content without the fences
    return match.replace(/```(?:json)?/g, "").replace(/```/g, "");
  });

  const start = text.indexOf('{');
  const end   = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${label}: no JSON object found. Response preview: ${text.slice(0, 400)}`);
  }

  const slice = text.substring(start, end + 1);

  try {
    return JSON.parse(slice);
  } catch (e) {
    throw new Error(`${label}: JSON.parse failed — ${e.message}. Slice preview: ${slice.slice(0, 400)}`);
  }
}

// --- TIER 1: GOOGLE GEMINI ---
// Free tier reliable models: gemini-1.5-flash, gemini-2.0-flash
// gemini-2.5-flash and gemini-2.5-pro REQUIRE billing to be enabled
export async function tryGemini(env, modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.AI_API_KEY}`;

  const payload = {
    contents: [{ parts: [{ text: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT }] }],
    generationConfig: { maxOutputTokens: 1200, temperature: 0.7 }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const json = await response.json();

  // Safety filter or quota block returns no candidates
  if (!json.candidates || json.candidates.length === 0) {
    const reason = json.promptFeedback?.blockReason ?? "unknown (quota or safety)";
    throw new Error(`No candidates returned. blockReason: ${reason}`);
  }

  const finishReason = json.candidates[0]?.finishReason;
  if (finishReason && finishReason !== "STOP") {
    throw new Error(`Bad finishReason: ${finishReason}`);
  }

  const raw = json.candidates[0]?.content?.parts?.[0]?.text;
  return extractJSON(raw, `Gemini[${modelName}]`);
}

// --- TIER 2/3: OPENAI-COMPATIBLE (Grok / OpenRouter) ---
export async function tryOpenAICompatible(url, apiKey, modelName) {
  const payload = {
    model: modelName,
    messages: [{ role: "user", content: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT }],
    max_tokens: 1200,
    temperature: 0.7
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const json = await response.json();

  if (!json.choices || json.choices.length === 0) {
    throw new Error(`No choices in response: ${JSON.stringify(json).slice(0, 300)}`);
  }

  const finishReason = json.choices[0]?.finish_reason;
  if (finishReason === "length") {
    throw new Error(`Output was truncated (finish_reason: length) — increase max_tokens or reduce prompt`);
  }

  const raw = json.choices[0]?.message?.content;
  return extractJSON(raw, `OpenAI-compat[${modelName}]`);
}

// --- TIER 4: COHERE ---
export async function tryCohere(env) {
  const payload = {
    message: AI_SYSTEM_PROMPT + "\n\n" + USER_PROMPT,
    model: "command-r",
    temperature: 0.7
  };

  const response = await fetch("https://api.cohere.ai/v1/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${env.COHERE_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errText.slice(0, 300)}`);
  }

  const json = await response.json();
  const raw = json?.text;
  return extractJSON(raw, "Cohere[command-r]");
}

// --- MAIN GATEWAY ---
export async function generateDailyContent(env) {
  const errors = [];

  // STAGE 1: Gemini
  // NOTE: gemini-2.5-flash requires billing. Free tier = gemini-1.5-flash / gemini-2.0-flash
  if (env.AI_API_KEY) {
    for (const model of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
      try {
        console.log(`[Bridge] Trying Gemini: ${model}`);
        const result = await tryGemini(env, model);
        console.log(`[Bridge] ✅ Gemini ${model} OK`);
        return result;
      } catch (e) {
        errors.push(`Gemini/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ Gemini ${model}:`, e.message);
      }
    }
  } else {
    errors.push("Gemini: AI_API_KEY not bound");
  }

  // STAGE 2: Grok
  // Free tier model is grok-3-mini or grok-2 depending on your plan
  if (env.GROK_API_KEY) {
    for (const model of ["grok-3-mini", "grok-2"]) {
      try {
        console.log(`[Bridge] Trying Grok: ${model}`);
        const result = await tryOpenAICompatible("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, model);
        console.log(`[Bridge] ✅ Grok ${model} OK`);
        return result;
      } catch (e) {
        errors.push(`Grok/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ Grok ${model}:`, e.message);
      }
    }
  } else {
    errors.push("Grok: GROK_API_KEY not bound");
  }

  // STAGE 3: OpenRouter
  if (env.OPENROUTER_API_KEY) {
    for (const model of ["mistralai/mistral-7b-instruct:free", "meta-llama/llama-3.2-3b-instruct:free"]) {
      try {
        console.log(`[Bridge] Trying OpenRouter: ${model}`);
        const result = await tryOpenAICompatible(
          "https://openrouter.ai/api/v1/chat/completions",
          env.OPENROUTER_API_KEY,
          model
        );
        console.log(`[Bridge] ✅ OpenRouter ${model} OK`);
        return result;
      } catch (e) {
        errors.push(`OpenRouter/${model}: ${e.message}`);
        console.warn(`[Bridge] ❌ OpenRouter ${model}:`, e.message);
      }
    }
  } else {
    errors.push("OpenRouter: OPENROUTER_API_KEY not bound");
  }

  // STAGE 4: Cohere
  if (env.COHERE_API_KEY) {
    try {
      console.log(`[Bridge] Trying Cohere command-r`);
      const result = await tryCohere(env);
      console.log(`[Bridge] ✅ Cohere OK`);
      return result;
    } catch (e) {
      errors.push(`Cohere: ${e.message}`);
      console.warn(`[Bridge] ❌ Cohere:`, e.message);
    }
  } else {
    errors.push("Cohere: COHERE_API_KEY not bound");
  }

  throw new Error("All providers failed:\n" + errors.join("\n"));
}
