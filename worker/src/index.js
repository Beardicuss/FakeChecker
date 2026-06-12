import { generateDailyContent } from './aiBridge.js';

// Core HTTP Router and Cron Job Orchestrator
export default {
    /**
     * Scheduled CRON execution (This runs every 6 hours autonomously)
     */
    async scheduled(event, env) {
        console.log("Cron triggered at:", event.cron);
        try {
            // Wait for AI bridge to generate JSON content 
            const newContent = await generateDailyContent(env);

            // Write generated JSON block into KV Cache
            await env.GAME_STATE.put("daily_content", JSON.stringify(newContent));
            console.log("Successfully cached new AI content to GAME_STATE KV");

        } catch (error) {
            console.error("Scheduled AI fetch failed:", error);
        }
    },

    /**
     * Public HTTP API (This is how the React Game pulls the JSON)
     */
    async fetch(request, env) {
        const url = new URL(request.url);

        // Required CORS to allow the Vite React app to fetch from this worker
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": "86400",
        };

        // Preflight OPTIONS for CORS
        if (request.method === "OPTIONS") {
            return new Response(null, { headers: corsHeaders });
        }

        // Endpoint: Fetch Daily Game State
        if (url.pathname === "/api/daily") {
            try {
                // Fetch cached state straight from Cloudflare KV
                const data = await env.GAME_STATE.get("daily_content", "json");

                if (!data) {
                    console.log("KV is empty on GET! Generating initial seed block on the fly.");
                    const newContent = await generateDailyContent(env);
                    await env.GAME_STATE.put("daily_content", JSON.stringify(newContent));

                    return new Response(JSON.stringify(newContent), {
                        headers: { ...corsHeaders, "Content-Type": "application/json" }
                    });
                }
                return new Response(JSON.stringify(data), {
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            } catch (err) {
                return new Response(JSON.stringify({ error: err.message }), {
                    status: 500,
                    headers: { ...corsHeaders, "Content-Type": "application/json" }
                });
            }
        }

        // Fallback root page
        return new Response("FakeChecker AI Worker API is active.", {
            headers: corsHeaders
        });
    }
};
