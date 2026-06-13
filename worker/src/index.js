import { generateDailyContent, tryGemini, tryOpenAICompatible, tryCohere } from './aiBridge.js';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Max-Age": "86400",
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" }
  });
}

export default {
  // Cron: every 6 hours
  async scheduled(event, env) {
    console.log("Cron triggered:", event.cron);
    try {
      const content = await generateDailyContent(env);
      await env.GAME_STATE.put("daily_content", JSON.stringify(content));
      console.log("KV updated successfully");
    } catch (e) {
      console.error("Cron failed:", e.message);
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    // ── GET /api/daily ──────────────────────────────────────────────────
    if (url.pathname === "/api/daily") {
      try {
        let data = await env.GAME_STATE.get("daily_content", "json");
        if (!data) {
          console.log("KV empty — generating on-demand");
          data = await generateDailyContent(env);
          await env.GAME_STATE.put("daily_content", JSON.stringify(data));
        }
        return json(data);
      } catch (e) {
        console.error("/api/daily error:", e.message);
        return json({ error: e.message }, 500);
      }
    }

    // ── GET /api/debug ──────────────────────────────────────────────────
    // Tests every provider individually. Returns a full trace.
    // Remove or guard this endpoint before production launch.
    if (url.pathname === "/api/debug") {
      const report = {
        env_keys: {
          AI_API_KEY:        !!env.AI_API_KEY,
          GROK_API_KEY:      !!env.GROK_API_KEY,
          OPENROUTER_API_KEY: !!env.OPENROUTER_API_KEY,
          COHERE_API_KEY:    !!env.COHERE_API_KEY,
        },
        kv_bound: !!env.GAME_STATE,
        providers: {}
      };

      // Test Gemini
      for (const model of ["gemini-2.0-flash", "gemini-1.5-flash"]) {
        try {
          const r = await tryGemini(env, model);
          report.providers[`Gemini/${model}`] = { ok: true, questions: r.questions?.length };
          break; // stop on first success
        } catch (e) {
          report.providers[`Gemini/${model}`] = { ok: false, error: e.message };
        }
      }

      // Test Grok
      for (const model of ["grok-3-mini", "grok-2"]) {
        try {
          const r = await tryOpenAICompatible("https://api.x.ai/v1/chat/completions", env.GROK_API_KEY, model);
          report.providers[`Grok/${model}`] = { ok: true, questions: r.questions?.length };
          break;
        } catch (e) {
          report.providers[`Grok/${model}`] = { ok: false, error: e.message };
        }
      }

      // Test OpenRouter
      for (const model of ["mistralai/mistral-7b-instruct:free", "meta-llama/llama-3.2-3b-instruct:free"]) {
        try {
          const r = await tryOpenAICompatible("https://openrouter.ai/api/v1/chat/completions", env.OPENROUTER_API_KEY, model);
          report.providers[`OpenRouter/${model}`] = { ok: true, questions: r.questions?.length };
          break;
        } catch (e) {
          report.providers[`OpenRouter/${model}`] = { ok: false, error: e.message };
        }
      }

      // Test Cohere
      try {
        const r = await tryCohere(env);
        report.providers["Cohere/command-r"] = { ok: true, questions: r.questions?.length };
      } catch (e) {
        report.providers["Cohere/command-r"] = { ok: false, error: e.message };
      }

      return json(report);
    }

    // Root
    return new Response("FakeChecker AI Worker is active.", { headers: CORS });
  }
};
