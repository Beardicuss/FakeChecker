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

  // Strip native Gemini markdown blockquotes
  let textOut = json.candidates[0].content.parts[0].text;
  const jsonMatch = textOut.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    textOut = jsonMatch[1];
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

  // Safety check fallback extraction
  let textOut = json.choices[0].message.content;
  const jsonMatch = textOut.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    textOut = jsonMatch[1];
  }

  return JSON.parse(textOut);
}


// --- THE GENERATOR GATEWAY ---
export async function generateDailyContent(env) {
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
        console.warn(`[API Bridge] ❌ ${model} failed, degrading to next step. Error:`, err.message);
      }
    }
  }

  // STAGE 2: xAI Grok (Native Free Tier)
  if (env.GROK_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting xAI Grok (grok-beta)...`);
      const content = await tryOpenAICompatible("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, "grok-beta");
      console.log(`[API Bridge] ✅ Successfully generated via Grok`);
      return content;
    } catch (err) {
      console.warn(`[API Bridge] ❌ Grok failed, degrading to next step. Error:`, err.message);
    }
  }

  // STAGE 3: OpenRouter Free Endpoints
  if (env.OPENROUTER_API_KEY) {
    try {
      console.log(`[API Bridge] Attempting OpenRouter (gemini-2.0-pro-exp-02-05:free)...`);
      // Attempting Gemini Pro through OpenRouter as a final reliable free tier fallback mechanism
      const content = await tryOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, "google/gemini-2.0-pro-exp-02-05:free");
      console.log(`[API Bridge] ✅ Successfully generated via OpenRouter`);
      return content;
    } catch (err) {
      console.warn(`[API Bridge] ❌ OpenRouter failed. Error:`, err.message);
    }
  }

  throw new Error("Extreme Outage: All AI Providers (Gemini, Grok, and OpenRouter) in the fallback matrix failed completely.");
}
