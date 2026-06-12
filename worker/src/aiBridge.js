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
    throw new Error(`Cloudflare Proxy Error: [${response.status}] ${errText}`);
  }

  const json = await response.json();

  // Ensure resilient JSON extraction by stripping any outer blockquotes or token truncations
  let textOut = json.candidates[0].content.parts[0].text;
  const start = textOut.indexOf('{');
  const end = textOut.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    textOut = textOut.substring(start, end + 1);
  }

  return JSON.parse(textOut);
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
    throw new Error(`Cloudflare Proxy Error: [${response.status}] ${errText}`);
  }

  const json = await response.json();

  // Safety check fallback extraction via index slicing
  let textOut = json.choices[0].message.content;
  const start = textOut.indexOf('{');
  const end = textOut.lastIndexOf('}');
  if (start !== -1 && end !== -1) {
    textOut = textOut.substring(start, end + 1);
  }

  return JSON.parse(textOut);
}


// --- THE GENERATOR GATEWAY ---
export async function generateDailyContent(env) {
  let debugErrors = [];

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
        console.warn(`[API Bridge] ❌ ${model} failed, degrading to next step. Error:`, err.message);
      }
    }
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
      console.warn(`[API Bridge] ❌ Grok failed, degrading to next step. Error:`, err.message);
    }
  }

  // STAGE 3: OpenRouter Free Endpoints
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting OpenRouter (google/gemma-2-9b-it:free)...`);
      // Attempting Gemini Pro through OpenRouter as a final reliable free tier fallback mechanism
      const content = await tryOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, "google/gemma-2-9b-it:free");
      console.log(`[API Bridge] ✅ Successfully generated via OpenRouter`);
      return content;
    } catch (err) {
      debugErrors.push(`OpenRouter: ${err.message}`);
      console.warn(`[API Bridge] ❌ OpenRouter failed. Error:`, err.message);
    }
  }

  // STAGE 4: Cohere (Native Free Tier)
  if (env.COHERE_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting Cohere (command-r)...`);
      const content = await tryOpenAICompatible("https://api.cohere.com/v1/chat/completions", env.COHERE_API_KEY, "command-r");
      console.log(`[API Bridge] ✅ Successfully generated via Cohere`);
      return content;
    } catch (err) {
      debugErrors.push(`Cohere: ${err.message}`);
      console.warn(`[API Bridge] ❌ Cohere failed. Error:`, err.message);
    }
  }

  throw new Error("Extreme Outage: All AI Providers failed. Trace: " + debugErrors.join(" | "));
}
