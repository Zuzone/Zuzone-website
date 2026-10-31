/**
 * Vercel Function that runs the Zuzone edge layer (server/index.mjs).
 *
 * server/index.mjs was written for Cloudflare Workers and expects a few platform bindings.
 * This file provides Vercel + Supabase equivalents so the route logic stays unchanged:
 *   env.ASSETS    -> fetch the static build from this same deployment
 *   env.SELF      -> call this deployment again (used to split long ZuThread refreshes)
 *   env.ZUTHREAD  -> key/value store in the Supabase table public.edge_kv (service role only)
 *   caches.default -> small in-memory cache per function instance
 *   ctx.waitUntil -> @vercel/functions waitUntil
 *
 * vercel.json rewrites every non-static path here; the original path is kept in request.url.
 */
import { waitUntil } from "@vercel/functions";
import edge from "../server/index.mjs";

// ---------- caches.default ----------

if (!globalThis.caches) {
  const store = new Map();
  globalThis.caches = {
    default: {
      async match(req) {
        const key = typeof req === "string" ? req : req.url;
        const hit = store.get(key);
        if (!hit) return undefined;
        if (Date.now() > hit.expires) { store.delete(key); return undefined; }
        return new Response(hit.body, { status: hit.status, headers: hit.headers });
      },
      async put(req, res) {
        const key = typeof req === "string" ? req : req.url;
        const maxAge = Number(/max-age=(\d+)/.exec(res.headers.get("cache-control") || "")?.[1] || 0);
        if (!maxAge) return;
        store.set(key, { body: await res.text(), status: res.status, headers: [...res.headers], expires: Date.now() + maxAge * 1000 });
      },
      async delete(req) {
        return store.delete(typeof req === "string" ? req : req.url);
      },
    },
  };
}

// ---------- env ----------

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

/** Workers-KV-shaped store backed by public.edge_kv. Without a service key it stores nothing. */
const kv = {
  headers() {
    return { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, "content-type": "application/json" };
  },
  async get(key) {
    if (!SERVICE_KEY) return null;
    const now = encodeURIComponent(new Date().toISOString());
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/edge_kv?select=value&key=eq.${encodeURIComponent(key)}&or=(expires_at.is.null,expires_at.gt.${now})`,
      { headers: this.headers() },
    );
    if (!res.ok) return null;
    const rows = await res.json();
    return rows[0]?.value ?? null;
  },
  async put(key, value, opts = {}) {
    if (!SERVICE_KEY) return;
    const expires_at = opts.expirationTtl ? new Date(Date.now() + opts.expirationTtl * 1000).toISOString() : null;
    await fetch(`${SUPABASE_URL}/rest/v1/edge_kv?on_conflict=key`, {
      method: "POST",
      headers: { ...this.headers(), Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({ key, value: String(value), expires_at }),
    });
    // Occasionally sweep expired rows (rate-limit counters and locks pile up otherwise).
    if (Math.random() < 0.02) {
      await fetch(`${SUPABASE_URL}/rest/v1/edge_kv?expires_at=lt.${encodeURIComponent(new Date().toISOString())}`, {
        method: "DELETE",
        headers: { ...this.headers(), Prefer: "return=minimal" },
      }).catch(() => {});
    }
  },
  async delete(key) {
    if (!SERVICE_KEY) return;
    await fetch(`${SUPABASE_URL}/rest/v1/edge_kv?key=eq.${encodeURIComponent(key)}`, {
      method: "DELETE",
      headers: { ...this.headers(), Prefer: "return=minimal" },
    });
  },
};

// Marks the function's own static-file fetches. If one of those reaches the function, the file
// does not exist (static files are served before rewrites), so answer 404 instead of looping.
const ASSET_PROBE = "x-zuzone-asset-probe";

function envFor(origin) {
  return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
    MONID_API_KEY: process.env.MONID_API_KEY,
    LUMA_API_KEY: process.env.LUMA_API_KEY,
    LUMA_CONTACT_TAG: process.env.LUMA_CONTACT_TAG,
    PUBLIC_SITE_URL: process.env.PUBLIC_SITE_URL || "https://zuzone.org",
    ZUTHREAD: kv,
    // Static files win over rewrites on Vercel, so fetching a real file path returns the file.
    // Anything else would be rewritten back to this function, so it gets the SPA shell instead.
    ASSETS: {
      fetch(input) {
        const url = new URL(typeof input === "string" ? input : input.url, origin);
        const last = url.pathname.split("/").pop() || "";
        const path = last.includes(".") ? url.pathname : "/index.html";
        return fetch(new URL(path, origin), { headers: { accept: "*/*", [ASSET_PROBE]: "1" } });
      },
    },
    SELF: {
      fetch(input, init) {
        const url = new URL(typeof input === "string" ? input : input.url);
        return fetch(new URL(url.pathname + url.search, origin), init);
      },
    },
  };
}

async function handle(request) {
  if (request.headers.get(ASSET_PROBE)) return new Response("Not found", { status: 404 });
  const origin = new URL(request.url).origin;
  return edge.fetch(request, envFor(origin), { waitUntil });
}

export const GET = handle;
export const HEAD = handle;
export const POST = handle;
export const OPTIONS = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
