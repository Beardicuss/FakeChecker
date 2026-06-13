import { generateDailyContent, tryGemini, tryOpenAICompat, tryCohere } from './aiBridge.js';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function jsonResp(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

export default {
  async scheduled(event, env) {
    console.log("Cron triggered:", event.cron);
    try {
      const content = await generateDailyContent(env);
      await env.GAME_STATE.put("daily_content", JSON.stringify(content));
      console.log("KV updated OK");
    } catch (e) {
      console.error("Cron failed:", e.message);
    }
  },

  async fetch(request, env) {
    const { pathname } = new URL(request.url);

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // /api/daily
    if (pathname === "/api/daily") {
      try {
        let data = await env.GAME_STATE.get("daily_content", "json");
        if (!data) {
          console.log("KV empty — seeding");
          data = await generateDailyContent(env);
          await env.GAME_STATE.put("daily_content", JSON.stringify(data));
        }
        return jsonResp(data);
      } catch (e) {
        console.error("/api/daily error:", e.message);
        return jsonResp({ error: e.message }, 500);
      }
    }

    // /api/debug — remove before launch
    if (pathname === "/api/debug") {
      const report = {
        env_keys: {
          AI_API_KEY:         !!env.AI_API_KEY,
          GROK_API_KEY:       !!env.GROK_API_KEY,
          OPENROUTER_API_KEY: !!env.OPENROUTER_API_KEY,
          COHERE_API_KEY:     !!env.COHERE_API_KEY,
        },
        kv_bound: !!env.GAME_STATE,
        providers: {}
      };

      if (env.AI_API_KEY) {
        for (const model of ["gemini-2.0-flash-lite", "gemini-1.5-flash-8b", "gemini-2.0-flash"]) {
          try {
            const r = await tryGemini(env.AI_API_KEY, model);
            report.providers[`Gemini/${model}`] = { ok: true, questions: r.questions?.length };
            break;
          } catch (e) {
            report.providers[`Gemini/${model}`] = { ok: false, error: e.message };
          }
        }
      }

      if (env.GROK_API_KEY) {
        for (const model of ["grok-3-mini-fast", "grok-3-mini"]) {
          try {
            const r = await tryOpenAICompat("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, model);
            report.providers[`Grok/${model}`] = { ok: true, questions: r.questions?.length };
            break;
          } catch (e) {
            report.providers[`Grok/${model}`] = { ok: false, error: e.message };
          }
        }
      }

      if (env.OPENROUTER_API_KEY) {
        for (const model of [
          "google/gemma-3-27b-it:free",
          "meta-llama/llama-3.1-8b-instruct:free",
          "deepseek/deepseek-r1-0528:free"
        ]) {
          try {
            const r = await tryOpenAICompat("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, model);
            report.providers[`OpenRouter/${model}`] = { ok: true, questions: r.questions?.length };
            break;
          } catch (e) {
            report.providers[`OpenRouter/${model}`] = { ok: false, error: e.message };
          }
        }
      }

      if (env.COHERE_API_KEY) {
        try {
          const r = await tryCohere(env.COHERE_API_KEY);
          report.providers["Cohere/command-r-08-2024"] = { ok: true, questions: r.questions?.length };
        } catch (e) {
          report.providers["Cohere/command-r-08-2024"] = { ok: false, error: e.message };
        }
      }

      return jsonResp(report);
    }

    return new Response("FakeChecker AI Worker is active.", { headers: CORS });
  }
};
