// This file isolates the configuration for the multi-provider fallback matrix.
// If a service throws a 503/404, it gracefully degrades to the next API chain.

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

/**
 * Extracts and parses the first valid JSON object from a raw string.
 * Handles: undefined input, markdown code fences, leading/trailing garbage.
 * Throws a descriptive error if no valid JSON is found.
 */
function extractJSON(raw, providerLabel) {
  if (raw === undefined || raw === null) {
    throw new Error(`${providerLabel}: response text field is undefined/null`);
  }

  let text = String(raw);

  // Strip markdown code fences (```json ... ``` or ``` ... ```)
  text = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "");

  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');

  if (start === -1 || end === -1 || end < start) {
    throw new Error(`${providerLabel}: no JSON object found in response. Raw (first 300 chars): ${text.slice(0, 300)}`);
  }

  const slice = text.substring(start, end + 1);

  try {
    return JSON.parse(slice);
  } catch (parseErr) {
    throw new Error(`${providerLabel}: JSON.parse failed — ${parseErr.message}. Slice (first 300 chars): ${slice.slice(0, 300)}`);
  }
}

// --- TIER 1: GOOGLE NATIVE REST ---
async function tryGemini(env, modelName) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${env.AI_API_KEY}`;

  const payload = {
    contents: [{
      parts: [{ text: AI_SYSTEM_PROMPT + "\n\nGenerate 5 new questions and 1 random email in JSON format. Do not use blockquotes, only output raw JSON string." }]
    }],
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.7
    }
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini [${modelName}] HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const json = await response.json();

  // Validate Gemini-specific structure before touching it
  const candidate = json?.candidates?.[0];
  if (!candidate) {
    const reason = json?.promptFeedback?.blockReason || "no candidates returned";
    throw new Error(`Gemini [${modelName}]: empty candidates — ${reason}`);
  }

  const raw = candidate?.content?.parts?.[0]?.text;
  return extractJSON(raw, `Gemini [${modelName}]`);
}

// --- TIER 2/3: OPENAI COMPATIBLE (xAI Grok & OpenRouter) ---
async function tryOpenAICompatible(url, apiKey, modelName) {
  const payload = {
    model: modelName,
    messages: [{
      role: "user",
      content: AI_SYSTEM_PROMPT + "\n\nGenerate 5 new questions and 1 random email in JSON format. Do not use blockquotes, only output raw JSON string."
    }],
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
    throw new Error(`OpenAI-compat [${modelName}] HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const json = await response.json();

  // Validate OpenAI-compatible structure
  const choice = json?.choices?.[0];
  if (!choice) {
    throw new Error(`OpenAI-compat [${modelName}]: no choices in response`);
  }

  const finishReason = choice?.finish_reason;
  if (finishReason === "length") {
    console.warn(`[API Bridge] ⚠️ [${modelName}] hit max_tokens — output may be truncated`);
  }

  const raw = choice?.message?.content;
  return extractJSON(raw, `OpenAI-compat [${modelName}]`);
}

// --- TIER 4: NATIVE COHERE API ---
async function tryCohere(env) {
  const payload = {
    message: AI_SYSTEM_PROMPT + "\n\nGenerate 5 new questions and 1 random email in JSON format. Do not use blockquotes, only output raw JSON string.",
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
    throw new Error(`Cohere HTTP ${response.status}: ${errText.slice(0, 200)}`);
  }

  const json = await response.json();

  const raw = json?.text;
  return extractJSON(raw, "Cohere");
}

// --- THE GENERATOR GATEWAY ---
export async function generateDailyContent(env) {
  const debugErrors = [];

  // STAGE 1: Iterate available Gemini AI versions natively
  if (env.AI_API_KEY) {
    const geminiTier = [
      "gemini-2.5-flash",
      "gemini-2.0-flash",
      "gemini-flash-latest"
    ];

    for (const model of geminiTier) {
      try {
        console.log(`[API Bridge] Attempting Native Gemini: ${model}...`);
        const content = await tryGemini(env, model);
        console.log(`[API Bridge] ✅ Successfully generated via ${model}`);
        return content;
      } catch (err) {
        debugErrors.push(`Gemini ${model}: ${err.message}`);
        console.warn(`[API Bridge] ❌ ${model} failed, degrading. Error:`, err.message);
      }
    }
  } else {
    console.warn("[API Bridge] AI_API_KEY not set — skipping Gemini tier");
  }

  // STAGE 2: xAI Grok (Native Free Tier)
  if (env.GROK_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting xAI Grok (grok-2)...`);
      const content = await tryOpenAICompatible("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, "grok-2");
      console.log(`[API Bridge] ✅ Successfully generated via Grok`);
      return content;
    } catch (err) {
      debugErrors.push(`Grok: ${err.message}`);
      console.warn(`[API Bridge] ❌ Grok failed, degrading. Error:`, err.message);
    }
  } else {
    console.warn("[API Bridge] GROK_API_KEY not set — skipping Grok tier");
  }

  // STAGE 3: OpenRouter Free Endpoints
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting OpenRouter (mistralai/mistral-7b-instruct:free)...`);
      const content = await tryOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, "mistralai/mistral-7b-instruct:free");
      console.log(`[API Bridge] ✅ Successfully generated via OpenRouter`);
      return content;
    } catch (err) {
      debugErrors.push(`OpenRouter: ${err.message}`);
      console.warn(`[API Bridge] ❌ OpenRouter failed. Error:`, err.message);
    }
  } else {
    console.warn("[API Bridge] OPENROUTER_API_KEY not set — skipping OpenRouter tier");
  }

  // STAGE 4: Cohere (Native Free Tier)
  if (env.COHERE_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting Cohere (command-r)...`);
      const content = await tryCohere(env);
      console.log(`[API Bridge] ✅ Successfully generated via Cohere`);
      return content;
    } catch (err) {
      debugErrors.push(`Cohere: ${err.message}`);
      console.warn(`[API Bridge] ❌ Cohere failed. Error:`, err.message);
    }
  } else {
    console.warn("[API Bridge] COHERE_API_KEY not set — skipping Cohere tier");
  }

  throw new Error("Extreme Outage: All AI Providers failed.\n" + debugErrors.join("\n"));
}