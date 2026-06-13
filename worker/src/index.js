import { generateDailyContent } from './aiBridge.js';

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

async function readCachedDailyContent(env) {
  const cached = await env.GAME_STATE?.get("daily_content");
  if (!cached) return null;

  try {
    return JSON.parse(cached);
  } catch {
    return null;
  }
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
    const { hostname, pathname } = new URL(request.url);
    const isLocalRequest = hostname === "127.0.0.1" || hostname === "localhost";

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    // /api/daily
    if (pathname === "/api/daily") {
      try {
        let data = await readCachedDailyContent(env);
        if (!data && isLocalRequest) {
          return jsonResp({ batch_id: new Date().toISOString(), questions: [], emails: [] });
        }
        if (!data) {
          console.log("KV empty — seeding");
          data = await generateDailyContent(env);
          await env.GAME_STATE.put("daily_content", JSON.stringify(data));
        }
        return jsonResp(data);
      } catch (e) {
        console.error("/api/daily error:", e.message);
        return jsonResp({ batch_id: new Date().toISOString(), questions: [], emails: [] });
      }
    }

    return new Response("FakeChecker AI Worker is active.", { headers: CORS });
  }
};
