// This file isolates the configuration for the Gemini API
// Expects an official Gemini API key via env.AI_API_KEY

const AI_MODEL = "gemini-flash-latest";
const AI_SYSTEM_PROMPT = `You are the core logic behind 'FakeChecker', generating true/false scenarios for a player.
Output strictly as JSON containing:
{
  "batch_id": "ISO8601 timestamp string",
  "questions": [
    {
      "id": "q_001",
      "headline": "Headline of the article/claim",
      "content": "A detailed paragraph containing the claim.",
      "hints": ["Hint 1", "Hint 2"],
      "is_fake": true/false,
      "difficulty": 1, 2, or 3
    }
  ],
  "emails": [
    {
      "id": "e_001",
      "sender": "Mgmt",
      "subject": "Performance Review",
      "body": "Your errors are noticed."
    }
  ]
}`;

export async function generateDailyContent(env) {
  if (!env.AI_API_KEY) {
    throw new Error("Missing AI_API_KEY environment secret.");
  }

  const payload = {
    contents: [{
      parts: [{ text: AI_SYSTEM_PROMPT + "\n\nGenerate 5 new questions and 1 random email in JSON format. Do not use blockquotes, only output raw JSON string." }]
    }],
    generationConfig: {
      maxOutputTokens: 1200,
      temperature: 0.7
    }
  };

  // Utilizing Gemini 1.5 Flash via REST endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${AI_MODEL}:generateContent?key=${env.AI_API_KEY}`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Request Failed: ${response.status} - ${err}`);
  }

  const json = await response.json();

  // Parse the generated text safely, stripping any Gemini markdown blockquotes
  let textOut = json.candidates[0].content.parts[0].text;

  const jsonMatch = textOut.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    textOut = jsonMatch[1];
  }

  return JSON.parse(textOut);
}
