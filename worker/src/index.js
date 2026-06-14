import { filterFootballContent, generateDailyContent } from './aiBridge.js';

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Max-Age": "86400",
};

const LEADERBOARD_KEY = "leaderboard_entries";
const MAX_LEADERBOARD_ROWS = 100;

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
    const parsed = filterFootballContent(JSON.parse(cached));
    return parsed?.questions?.length ? parsed : null;
  } catch {
    return null;
  }
}

async function writeGeneratedDailyContent(env) {
  const content = filterFootballContent(await generateDailyContent(env));
  if (!content?.questions?.length) {
    throw new Error("AI generated no valid football questions; KV not updated.");
  }
  await env.GAME_STATE.put("daily_content", JSON.stringify(content));
  return content;
}

function sanitizeText(value, fallback = "") {
  return String(value || fallback).trim().replace(/\s+/g, " ").slice(0, 32);
}

function normalizeLeaderboardEntry(raw) {
  if (!raw || typeof raw !== "object") return null;

  const agentId = sanitizeText(raw.agentId);
  const agentName = sanitizeText(raw.agentName, "Agent");
  const avatarId = sanitizeText(raw.avatarId, "user");
  const score = Number(raw.score);
  const completedAt = raw.completedAt ? new Date(raw.completedAt) : new Date();

  if (!agentId || !Number.isFinite(score) || score < 0 || Number.isNaN(completedAt.getTime())) {
    return null;
  }

  return {
    agentId,
    agentName,
    avatarId,
    score: Math.round(score),
    trust: Math.max(0, Math.min(100, Math.round(Number(raw.trust) || 0))),
    processed: Math.max(0, Math.round(Number(raw.processed) || 0)),
    correctCount: Math.max(0, Math.round(Number(raw.correctCount) || 0)),
    wrongCount: Math.max(0, Math.round(Number(raw.wrongCount) || 0)),
    skipCount: Math.max(0, Math.round(Number(raw.skipCount) || 0)),
    completedAt: completedAt.toISOString(),
  };
}

function sortLeaderboardRows(rows) {
  return [...rows].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime();
  });
}

function filterLeaderboardRows(rows, range) {
  if (range === "global") return rows;

  const now = Date.now();
  const maxAgeMs = range === "daily"
    ? 24 * 60 * 60 * 1000
    : 7 * 24 * 60 * 60 * 1000;

  return rows.filter(row => {
    const completedAt = new Date(row.completedAt).getTime();
    return Number.isFinite(completedAt) && now - completedAt <= maxAgeMs;
  });
}

async function readLeaderboard(env, range = "global") {
  const cached = await env.GAME_STATE?.get(LEADERBOARD_KEY);
  if (!cached) return [];

  try {
    const rows = JSON.parse(cached);
    if (!Array.isArray(rows)) return [];
    return sortLeaderboardRows(filterLeaderboardRows(rows, range)).slice(0, 20);
  } catch {
    return [];
  }
}

async function writeLeaderboardEntry(env, entry) {
  const normalized = normalizeLeaderboardEntry(entry);
  if (!normalized) {
    return { ok: false, error: "Invalid leaderboard entry" };
  }

  const cached = await env.GAME_STATE?.get(LEADERBOARD_KEY);
  let rows = [];

  try {
    rows = cached ? JSON.parse(cached) : [];
    if (!Array.isArray(rows)) rows = [];
  } catch {
    rows = [];
  }

  const withoutCurrentAgent = rows.filter(row => row.agentId !== normalized.agentId);
  const previousBest = rows.find(row => row.agentId === normalized.agentId);
  const entryToStore = previousBest && previousBest.score > normalized.score
    ? previousBest
    : normalized;

  const nextRows = sortLeaderboardRows([...withoutCurrentAgent, entryToStore]).slice(0, MAX_LEADERBOARD_ROWS);
  await env.GAME_STATE.put(LEADERBOARD_KEY, JSON.stringify(nextRows));

  return { ok: true, entry: entryToStore, rows: nextRows.slice(0, 20) };
}

export default {
  async scheduled(event, env) {
    console.log("Cron triggered:", event.cron);
    try {
      await writeGeneratedDailyContent(env);
      console.log("KV updated OK");
    } catch (e) {
      console.error("Cron failed:", e.message);
    }
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });

    if (pathname === "/api/daily") {
      try {
        const data = await readCachedDailyContent(env);
        if (!data) {
          return jsonResp({
            batch_id: "empty-cache",
            questions: [],
            emails: [],
            message: "No prepared content has been generated yet."
          });
        }
        return jsonResp(data);
      } catch (e) {
        console.error("/api/daily error:", e.message);
        return jsonResp({ batch_id: new Date().toISOString(), questions: [], emails: [] });
      }
    }

    if (pathname === "/api/leaderboard" && request.method === "GET") {
      const range = url.searchParams.get("range") || "global";
      const safeRange = ["global", "daily", "weekly"].includes(range) ? range : "global";
      return jsonResp({ rows: await readLeaderboard(env, safeRange) });
    }

    if (pathname === "/api/leaderboard" && request.method === "POST") {
      try {
        const body = await request.json();
        const result = await writeLeaderboardEntry(env, body);
        return jsonResp(result, result.ok ? 200 : 400);
      } catch (e) {
        console.error("/api/leaderboard error:", e.message);
        return jsonResp({ ok: false, error: "Could not save leaderboard entry" }, 500);
      }
    }

    return new Response("FakeChecker AI Worker is active.", { headers: CORS });
  }
};
