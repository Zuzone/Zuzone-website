/**
 * Zuzone edge worker.
 *
 * Serves the Vite build (SPA fallback) and adds what a static host cannot:
 *   GET  /calendar.ics        iCalendar feed of every pop-up city (subscribe in Google/Apple/Outlook)
 *   GET  /api/villages.json   public JSON of the directory
 *   POST /api/villages        add a village, gated by a Zupass-signed POD (verified here)
 *   POST /api/newsletter/subscribe  save a newsletter signup (honeypot + per-IP rate limit)
 *   GET  /api/zuthread.json   every village's X posts, newest first (KV; refreshed on demand at most every 4h)
 *   POST /api/zuthread/refresh  start a manual refresh (rate-limited); GET .../status to follow it
 *   GET  /:slug[/section]     index.html with per-village Open Graph tags so links unfurl on X/Telegram
 */
import { POD } from "@pcd/pod";
import { buildFeed, EXTRA_SOURCE_IDS, fetchAccount, handlesFromVillages } from "./zuthread.mjs";

const RESERVED = new Set(["newsletter", "why-zuzone", "why-zuzalu", "dossier", "admin", "auth", "profile", "notifications", "embed", "widget", "assets", "api", "calendar.ics", "og.png", "robots.txt", "favicon.ico", "favicon.png", "placeholder.svg", "tonconnect-manifest.json"]);
const SECTIONS = new Set(["about", "map", "residents", "scenius", "bulletin", "events", "treasury"]);
const VILLAGE_FIELDS = "id,name,logo_url,thumbnail_url,center,dates,location,description,village_type,website_url,twitter_url,telegram_url,instagram_url,apply_url,updated_at,hidden";
const CACHE_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === "/api/newsletter/subscribe") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (request.method === "POST") return newsletterSubscribe(request, env, ctx);
    }

    if (path === "/api/villages") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (request.method === "POST") return addVillage(request, env, ctx);
    }

    if (path === "/api/zuthread/_batch" && request.method === "POST") return zuthreadBatch(request, env, ctx);

    if (path === "/api/zuthread/refresh") {
      if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS });
      if (request.method === "POST") return zuthreadRefresh(env, ctx);
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    if (path === "/dossier" || path === "/dossier/") return Response.redirect(`${url.origin}/why-zuzone#dossier`, 301);
    if (path === "/why-zuzalu" || path === "/why-zuzalu/") return Response.redirect(`${url.origin}/why-zuzone${url.search}`, 301);
    if (path === "/calendar.ics") return calendarFeed(env, ctx, url.origin);
    if (path === "/api/villages.json") return villagesJson(env, ctx);
    if (path === "/api/_health") return health(env);
    if (path === "/api/zuthread.json") return zuthreadJson(request, env, ctx);
    if (path === "/api/zuthread/status") return zuthreadStatus(env);

    const slug = villageSlugFromPath(path);
    if (slug && wantsHtml(request)) {
      return villagePage(request, env, ctx, slug, url.origin);
    }

    return env.ASSETS.fetch(request);
  },
};

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "POST, OPTIONS",
  "access-control-allow-headers": "content-type",
  "access-control-max-age": "86400",
};

/** Reports whether the configured Supabase keys can reach the villages table (no secrets echoed). */
async function health(env) {
  const probe = async (key) => {
    if (!key) return "unset";
    const r = await fetch(`${env.SUPABASE_URL}/rest/v1/villages?select=id&limit=1`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });
    return r.status;
  };
  const [anon, service] = await Promise.all([probe(env.SUPABASE_ANON_KEY), probe(env.SUPABASE_SERVICE_ROLE_KEY)]);
  // Report what kind of key each secret is (never the key itself): a public read succeeds with
  // either, so the role claim is what shows whether writes will bypass row-level security.
  const kind = (key) => {
    if (!key) return "unset";
    if (key.startsWith("sb_secret_")) return "secret-key";
    if (key.startsWith("sb_publishable_")) return "publishable-key";
    try {
      const payload = JSON.parse(atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
      return `jwt:${payload.role}:${payload.ref}`;
    } catch {
      return "unrecognised";
    }
  };
  return json({ supabase_url: env.SUPABASE_URL, anon_key: anon, service_role_key: service, anon_kind: kind(env.SUPABASE_ANON_KEY), service_kind: kind(env.SUPABASE_SERVICE_ROLE_KEY), luma_sync: env.LUMA_API_KEY ? "configured" : "not configured" });
}

// ---------- newsletter signups ----------

const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,253}\.[a-z]{2,24}$/i;
const SUBSCRIBE_LIMIT = 5; // signups per IP per hour

/**
 * Save a signup to newsletter_subscribers. Always answers the same way for new and existing
 * addresses, so the form can't be used to check who is subscribed. Bots filling the hidden
 * `website` field get a fake success.
 */
async function newsletterSubscribe(request, env, ctx) {
  let body;
  try { body = await request.json(); } catch { return json({ error: "Invalid request" }, 400); }
  if (body?.website) return json({ ok: true });

  const email = String(body?.email || "").trim().toLowerCase();
  if (email.length > 254 || !EMAIL_RE.test(email)) return json({ error: "Please enter a valid email address." }, 422);

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  const ipHash = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`newsletter:${ip}`)))]
    .slice(0, 12).map((b) => b.toString(16).padStart(2, "0")).join("");
  const rateKey = `sub-rate:${ipHash}:${new Date().toISOString().slice(0, 13)}`;
  const used = Number((await env.ZUTHREAD.get(rateKey)) || 0);
  if (used >= SUBSCRIBE_LIMIT) return json({ error: "Too many attempts. Please try again later." }, 429);
  ctx.waitUntil(env.ZUTHREAD.put(rateKey, String(used + 1), { expirationTtl: 3700 }));

  if (!env.SUPABASE_SERVICE_ROLE_KEY) return json({ error: "Signups are not configured." }, 503);
  const source = String(body?.source || "home").slice(0, 60);
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "content-type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify({ email, source }),
  });
  if (!res.ok) {
    console.error("newsletter insert failed", res.status, (await res.text()).slice(0, 300));
    return json({ error: "Something went wrong. Please try again." }, 502);
  }
  // Forward to Luma in the background; the signup is already safe in our table either way
  ctx.waitUntil(syncSubscribersToLuma(env).catch((e) => console.error("luma sync failed", String(e))));
  return json({ ok: true });
}

/**
 * Import every not-yet-synced subscriber into the Zuzone Luma calendar, so Luma newsletters
 * reach them (Luma handles sending and unsubscribes). Runs after each signup, which also
 * backfills anyone who signed up before LUMA_API_KEY was set. Needs Luma Plus on the calendar;
 * the API key itself identifies the calendar. Tag defaults to "Zuzone newsletter".
 */
async function syncSubscribersToLuma(env) {
  if (!env.LUMA_API_KEY || !env.SUPABASE_SERVICE_ROLE_KEY) return;
  const sb = { apikey: env.SUPABASE_SERVICE_ROLE_KEY, Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}` };
  const rows = await (await fetch(
    `${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?select=id,email&luma_synced_at=is.null&unsubscribed_at=is.null&order=created_at.asc&limit=100`,
    { headers: sb },
  )).json();
  if (!Array.isArray(rows) || !rows.length) return;

  const tag = env.LUMA_CONTACT_TAG || "Zuzone newsletter";
  const importContacts = (withTag) => fetch("https://public-api.luma.com/v1/calendars/contacts/import", {
    method: "POST",
    headers: { "x-luma-api-key": env.LUMA_API_KEY, "content-type": "application/json" },
    body: JSON.stringify({ contacts: rows.map((r) => ({ email: r.email })), ...(withTag ? { tags: [tag] } : {}) }),
  });
  let res = await importContacts(true);
  // If the tag doesn't exist on the calendar yet, still get the people in
  if (!res.ok && res.status !== 401 && res.status !== 403) res = await importContacts(false);

  const patch = res.ok
    ? { luma_synced_at: new Date().toISOString(), luma_error: null }
    : { luma_error: `${res.status} ${(await res.text()).slice(0, 200)}` };
  await fetch(`${env.SUPABASE_URL}/rest/v1/newsletter_subscribers?id=in.(${rows.map((r) => r.id).join(",")})`, {
    method: "PATCH",
    headers: { ...sb, "content-type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify(patch),
  });
  if (!res.ok) console.error("luma import failed", patch.luma_error);
}

// ---------- add village (Zupass-gated) ----------

const POD_MAX_AGE_MS = 15 * 60 * 1000;
const URL_RE = /^https?:\/\/[^\s]{3,500}$/i;

function json(body, status = 200, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", ...CORS, ...extra },
  });
}

/**
 * Anyone with a Zupass can add a village. The client asks Zupass to sign a POD
 * { zuzone: "add-village", village_id, village_name, ts }; we verify the EdDSA
 * signature, check the POD matches the submitted village and is fresh, then insert.
 * The signer's public key is stored alongside the row so entries stay accountable.
 */
async function addVillage(request, env, ctx) {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Invalid JSON body" }, 400);
  }
  const { pod: jsonPod, village: raw, dryRun } = body || {};
  if (!jsonPod || !raw) return json({ error: "Expected { pod, village }" }, 400);

  // 1. Verify the Zupass signature
  let pod;
  try {
    pod = POD.fromJSON(jsonPod);
    if (!pod.verifySignature()) return json({ error: "Zupass signature is invalid" }, 401);
  } catch (e) {
    return json({ error: `Malformed POD: ${e.message || e}` }, 400);
  }
  const entries = pod.content.asEntries();
  const claim = {
    zuzone: entries.zuzone?.value,
    village_id: entries.village_id?.value,
    ts: entries.ts?.value,
  };
  if (claim.zuzone !== "add-village") return json({ error: "POD is not an add-village authorisation" }, 401);
  const ts = typeof claim.ts === "bigint" ? Number(claim.ts) : Number(claim.ts);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > POD_MAX_AGE_MS) {
    return json({ error: "Zupass authorisation expired, sign in again" }, 401);
  }

  // 2. Validate the village payload
  const v = validateVillage(raw);
  if (v.error) return json({ error: v.error }, 422);
  if (claim.village_id !== v.village.id) return json({ error: "POD was signed for a different village id" }, 401);

  // Submissions arrive hidden and wait for the Zuzone team to approve them (see README)
  const row = { ...v.village, zupass_public_key: pod.signerPublicKey, hidden: true };
  if (dryRun) return json({ ok: true, dryRun: true, signer: pod.signerPublicKey, village: row });

  // 3. Insert (service role if configured, else anon — RLS decides)
  const insertWith = (key, payload) =>
    fetch(`${env.SUPABASE_URL}/rest/v1/villages`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "content-type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(payload),
    });
  // Prefer the service role key; if it is missing or rejected (wrong project, rotated),
  // fall back to the anon key so RLS decides.
  const insert = async (payload) => {
    if (env.SUPABASE_SERVICE_ROLE_KEY) {
      const r = await insertWith(env.SUPABASE_SERVICE_ROLE_KEY, payload);
      if (r.status !== 401 && r.status !== 403) return r;
    }
    return insertWith(env.SUPABASE_ANON_KEY, payload);
  };
  let res = await insert(row);
  if (res.status === 400) {
    const err = await res.clone().json().catch(() => ({}));
    // Column not yet added by the migration: insert without it rather than fail
    if (err?.code === "42703" || /zupass_public_key/.test(err?.message || "")) {
      const { zupass_public_key, ...withoutKey } = row; // hidden stays set
      res = await insert(withoutKey);
    }
  }
  if (res.status === 409) return json({ error: "A village with this id already exists" }, 409);
  if (!res.ok) {
    const err = await res.text();
    return json({ error: `Insert failed (${res.status})`, detail: err.slice(0, 400) }, 502);
  }
  const inserted = await res.json();
  // Bust the edge cache so the feed/API/OG pick the new row up immediately
  ctx.waitUntil(caches.default.delete(villagesCacheKey(env)));
  return json({ ok: true, village: inserted[0] || row, signer: pod.signerPublicKey }, 201);
}

function validateVillage(raw) {
  const s = (x, max) => (typeof x === "string" ? x.trim().slice(0, max) : "");
  const id = s(raw.id, 120);
  if (!/^[a-z0-9][a-z0-9-]{1,118}$/.test(id)) return { error: "Invalid village id" };
  const name = s(raw.name, 160);
  if (name.length < 2) return { error: "Village name is required" };
  const center = raw.center;
  if (!Array.isArray(center) || center.length !== 2 || !center.every((n) => typeof n === "number" && Number.isFinite(n))) {
    return { error: "center must be [lng, lat]" };
  }
  const [lng, lat] = center;
  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return { error: "center out of range" };
  const village_type = raw.village_type === "permanent" ? "permanent" : "popup";
  const url = (x) => {
    const u = s(x, 500);
    return u && URL_RE.test(u) ? u : null;
  };
  return {
    village: {
      id,
      name,
      location: s(raw.location, 200) || "Location",
      center: [lng, lat],
      dates: s(raw.dates, 64) || (village_type === "permanent" ? "Permanent" : "Coming soon"),
      description: s(raw.description, 2000) || `Welcome to ${name}`,
      village_type,
      website_url: url(raw.website_url),
      logo_url: url(raw.logo_url),
      thumbnail_url: url(raw.thumbnail_url),
      twitter_url: url(raw.twitter_url),
      instagram_url: url(raw.instagram_url),
      telegram_url: url(raw.telegram_url),
      created_by: typeof raw.created_by === "string" && /^[0-9a-f-]{36}$/i.test(raw.created_by) ? raw.created_by : null,
    },
  };
}

// ---------- ZuThread ----------

const ZUTHREAD_KEY = "feed:v1";
const ZUTHREAD_LOCK = "refresh-lock";
const ZUTHREAD_STATUS = "refresh-status";
const ZUTHREAD_STAMP = "refresh-stamp";
const ZUTHREAD_TTL_MS = 4 * 60 * 60 * 1000; // auto-refresh at most every 4h (~$0.03 per refresh via monid)
// The refresh button is public, and every press costs real money, so it is rate limited twice:
const ZUTHREAD_COOLDOWN_MS = 10 * 60 * 1000; // one manual refresh per 10 minutes, site-wide
const ZUTHREAD_DAILY_CAP = 20; // and at most 20 a day (~$0.60 ceiling)

// Accounts pulled per Worker invocation. Each costs up to 9 subrequests (1 run + 8 polls),
// so 4 stays under the free plan's 50 with room to spare; the rest is handed to a fresh
// invocation through the SELF service binding, which gets its own budget.
const ZUTHREAD_BATCH = 4;

async function jobToken(env, startedAt) {
  const bytes = new TextEncoder().encode(`${env.MONID_API_KEY}:${startedAt}`);
  return [...new Uint8Array(await crypto.subtle.digest("SHA-256", bytes))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Begin a refresh: work out which accounts to pull, then run the first batch. */
async function refreshZuthread(env, ctx) {
  if (!env.MONID_API_KEY) return { skipped: "MONID_API_KEY not set" };
  const targets = handlesFromVillages(await fetchVillages(env, ctx));
  await runRefreshBatch(env, ctx, { started_at: new Date().toISOString(), targets, results: [] });
  return { ok: true };
}

/**
 * Pull the next batch. The job travels in the request body rather than KV, because KV is only
 * eventually consistent and the next invocation starts milliseconds later.
 */
async function runRefreshBatch(env, ctx, job) {
  const batch = job.targets.slice(job.results.length, job.results.length + ZUTHREAD_BATCH);
  job.results.push(...(await Promise.all(batch.map((t) => fetchAccount(t, env.MONID_API_KEY)))));

  if (job.results.length < job.targets.length) {
    await setRefreshStatus(env, { state: "running", started_at: job.started_at, progress: `${job.results.length}/${job.targets.length}` });
    const res = await env.SELF.fetch("https://zuzone.internal/api/zuthread/_batch", {
      method: "POST",
      headers: { "content-type": "application/json", "x-job-token": await jobToken(env, job.started_at) },
      body: JSON.stringify(job),
    });
    if (!res.ok) throw new Error(`batch handoff failed (${res.status})`);
    return;
  }

  const feed = buildFeed(job.results);
  const ok = feed.sources.filter((x) => !x.error).length;
  if (!ok) {
    // Keep the previous feed if every account failed (rate limit, outage)
    await setRefreshStatus(env, { state: "error", error: `Every account failed: ${(feed.sources[0]?.error || "").slice(0, 160)}` });
  } else {
    await env.ZUTHREAD.put(ZUTHREAD_KEY, JSON.stringify(feed));
    await setRefreshStatus(env, { state: "done", posts: feed.count, sources: ok, total: feed.sources.length });
  }
  await env.ZUTHREAD.delete(ZUTHREAD_LOCK);
}

/** Internal: continue a refresh in a fresh invocation. Only the worker itself can sign the token. */
async function zuthreadBatch(request, env, ctx) {
  if (!env.MONID_API_KEY) return new Response("not configured", { status: 503 });
  let job;
  try { job = await request.json(); } catch { return new Response("bad job", { status: 400 }); }
  if (!job?.started_at || request.headers.get("x-job-token") !== (await jobToken(env, job.started_at))) {
    return new Response("forbidden", { status: 403 });
  }
  ctx.waitUntil(
    runRefreshBatch(env, ctx, job).catch(async (e) => {
      await setRefreshStatus(env, { state: "error", error: String(e.message || e).slice(0, 300) });
      await env.ZUTHREAD.delete(ZUTHREAD_LOCK);
    }),
  );
  return new Response("accepted", { status: 202 });
}

/**
 * Filter a stored feed down to villages that are currently public. The feed was built from
 * whatever villages existed at refresh time, so this runs on every read: hiding a village takes
 * effect immediately, without paying for a refresh. A handle shared by several villages (Edge City,
 * The Mu) is re-attributed to one that is still visible.
 */
async function visibleFeed(body, env, ctx) {
  let feed;
  try { feed = JSON.parse(body); } catch { return body; }
  let visible;
  try { visible = new Map((await fetchVillages(env, ctx)).map((v) => [v.id, v])); } catch { return body; }
  const posts = [];
  for (const p of feed.posts || []) {
    const ids = (p.villages || [p.village_id]).filter((id) => visible.has(id) || EXTRA_SOURCE_IDS.has(id));
    if (!ids.length) continue;
    if (!visible.has(p.village_id) && !EXTRA_SOURCE_IDS.has(p.village_id)) {
      const v = visible.get(ids[0]);
      p.village_id = v.id; p.village_name = v.name; p.village_logo = v.logo_url || null;
    }
    p.villages = ids;
    posts.push(p);
  }
  const sources = (feed.sources || [])
    .map((src) => ({ ...src, villages: (src.villages || []).filter((id) => visible.has(id) || EXTRA_SOURCE_IDS.has(id)) }))
    .filter((src) => src.villages.length)
    .map((src) => ({ ...src, posts: posts.filter((p) => p.handle === src.handle).length }));
  return JSON.stringify({ ...feed, posts, sources, count: posts.length });
}

async function setRefreshStatus(env, patch) {
  await env.ZUTHREAD.put(ZUTHREAD_STATUS, JSON.stringify({ at: new Date().toISOString(), ...patch }), { expirationTtl: 86400 });
}

/** GET /api/zuthread/status — how the last (or running) refresh is doing. */
async function zuthreadStatus(env) {
  const raw = (await env.ZUTHREAD.get(ZUTHREAD_STATUS)) || '{"state":"idle"}';
  const last = Number((await env.ZUTHREAD.get(ZUTHREAD_STAMP)) || 0);
  const cooling = Math.max(0, Math.ceil((last + ZUTHREAD_COOLDOWN_MS - Date.now()) / 1000));
  return new Response(JSON.stringify({ ...JSON.parse(raw), configured: !!env.MONID_API_KEY, retry_after_s: cooling }), {
    headers: { "content-type": "application/json; charset=utf-8", ...CORS, "cache-control": "no-store" },
  });
}

/**
 * POST /api/zuthread/refresh — pull every village's timeline again, now.
 * Pulling ~20 accounts takes longer than one request may last, so the work runs in the
 * background and the client follows GET /api/zuthread/status.
 */
async function zuthreadRefresh(env, ctx) {
  if (!env.MONID_API_KEY) {
    return json({ error: "Live refresh is not configured on this deployment.", reason: "not_configured" }, 503, CORS);
  }

  const now = Date.now();
  const last = Number((await env.ZUTHREAD.get(ZUTHREAD_STAMP)) || 0);
  const waitS = Math.ceil((last + ZUTHREAD_COOLDOWN_MS - now) / 1000);
  if (waitS > 0) {
    return json({ error: "The thread was just refreshed.", reason: "cooldown", retry_after_s: waitS }, 429, { ...CORS, "retry-after": String(waitS) });
  }

  const capKey = `spend:${new Date().toISOString().slice(0, 10)}`;
  const used = Number((await env.ZUTHREAD.get(capKey)) || 0);
  if (used >= ZUTHREAD_DAILY_CAP) {
    return json({ error: "Daily refresh limit reached. The thread still updates on its own.", reason: "daily_cap" }, 429, CORS);
  }

  if (await env.ZUTHREAD.get(ZUTHREAD_LOCK)) {
    return json({ started: false, reason: "busy", state: "running" }, 202, CORS);
  }

  await env.ZUTHREAD.put(ZUTHREAD_LOCK, "1", { expirationTtl: 600 });
  await env.ZUTHREAD.put(ZUTHREAD_STAMP, String(now));
  await env.ZUTHREAD.put(capKey, String(used + 1), { expirationTtl: 172800 });
  await setRefreshStatus(env, { state: "running", started_at: new Date(now).toISOString() });

  ctx.waitUntil(
    refreshZuthread(env, ctx).catch(async (e) => {
      await setRefreshStatus(env, { state: "error", error: String(e.message || e).slice(0, 300) });
      await env.ZUTHREAD.delete(ZUTHREAD_LOCK);
    }),
  );

  return json({ started: true, state: "running" }, 202, CORS);
}

/**
 * Stale-while-revalidate: serve KV (or the static snapshot) immediately; if the feed is older
 * than ZUTHREAD_TTL_MS and a monid key is configured, refresh in the background under a lock.
 * No cron needed (the account's free cron quota is used up elsewhere).
 */
async function zuthreadJson(request, env, ctx) {
  const headers = { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*", "cache-control": "public, max-age=300" };
  let body = await env.ZUTHREAD.get(ZUTHREAD_KEY);
  let source = "kv";
  if (!body) {
    const asset = await env.ASSETS.fetch(new Request(new URL("/zuthread.json", request.url)));
    body = asset.ok ? await asset.text() : null;
    source = "static";
  }
  let generatedAt = 0;
  try { generatedAt = new Date(JSON.parse(body || "{}").generated_at || 0).getTime(); } catch { /* ignore */ }
  const stale = !body || Date.now() - generatedAt > ZUTHREAD_TTL_MS;
  if (stale && env.MONID_API_KEY) {
    ctx.waitUntil((async () => {
      if (await env.ZUTHREAD.get(ZUTHREAD_LOCK)) return;
      await env.ZUTHREAD.put(ZUTHREAD_LOCK, "1", { expirationTtl: 600 });
      await setRefreshStatus(env, { state: "running", started_at: new Date().toISOString(), auto: true });
      await refreshZuthread(env, ctx).catch(async (e) => {
        await setRefreshStatus(env, { state: "error", error: String(e.message || e).slice(0, 300) });
        await env.ZUTHREAD.delete(ZUTHREAD_LOCK);
      });
    })());
  }
  if (!body) return json({ generated_at: null, count: 0, sources: [], posts: [] });
  body = await visibleFeed(body, env, ctx);
  return new Response(body, { headers: { ...headers, "x-zuthread-source": source, "x-zuthread-stale": String(stale) } });
}

// ---------- routing helpers ----------

function villageSlugFromPath(path) {
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0 || parts.length > 2) return null;
  const [slug, section] = parts;
  if (RESERVED.has(slug) || slug.includes(".")) return null;
  if (section && !SECTIONS.has(section)) return null;
  if (!/^[a-z0-9][a-z0-9_-]*$/i.test(slug)) return null;
  return slug;
}

function wantsHtml(request) {
  const accept = request.headers.get("accept") || "";
  const dest = request.headers.get("sec-fetch-dest") || "";
  if (dest && dest !== "document") return false;
  return accept.includes("text/html") || accept === "*/*" || accept === "";
}

// ---------- data ----------

function villagesCacheKey(env) {
  return new Request(`${env.SUPABASE_URL}/rest/v1/villages?select=${VILLAGE_FIELDS}&order=created_at.asc`);
}

async function fetchVillages(env, ctx) {
  const cache = caches.default;
  const cacheKey = villagesCacheKey(env);
  let res = await cache.match(cacheKey);
  if (!res) {
    res = await fetch(cacheKey, {
      headers: { apikey: env.SUPABASE_ANON_KEY, Authorization: `Bearer ${env.SUPABASE_ANON_KEY}` },
    });
    if (!res.ok) throw new Error(`supabase ${res.status}`);
    res = new Response(res.body, res);
    res.headers.set("Cache-Control", `public, max-age=${CACHE_TTL}`);
    ctx.waitUntil(cache.put(cacheKey, res.clone()));
  }
  const rows = await res.json();
  return rows.filter((v) => !v.hidden && !String(v.id).startsWith("_")).map(({ hidden, ...v }) => v);
}

async function villagesJson(env, ctx) {
  try {
    const villages = await fetchVillages(env, ctx);
    return new Response(JSON.stringify({ count: villages.length, generated_at: new Date().toISOString(), villages }, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "access-control-allow-origin": "*",
        "cache-control": `public, max-age=${CACHE_TTL}`,
      },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 502, headers: { "content-type": "application/json" } });
  }
}

// ---------- per-village Open Graph ----------

async function villagePage(request, env, ctx, slug, origin) {
  const assetReq = new Request(new URL("/index.html", origin), { headers: request.headers });
  const assetRes = await env.ASSETS.fetch(assetReq);
  if (!assetRes.ok) return env.ASSETS.fetch(request);

  let village = null;
  try {
    const villages = await fetchVillages(env, ctx);
    village = villages.find((v) => v.id === slug) || null;
  } catch {
    /* fall through to untouched SPA shell */
  }
  if (!village) {
    return new Response(assetRes.body, assetRes);
  }

  const html = await assetRes.text();
  const title = `${village.name} — Zuzone`;
  const descBits = [village.dates, village.location].filter((s) => s && s !== "x");
  const description = truncate(
    `${descBits.join(" · ")}${descBits.length ? ". " : ""}${stripHtml(village.description || "")}`.trim() || "A pop-up city on Zuzone.",
    280,
  );
  const image = village.thumbnail_url || village.logo_url || `${origin}/og.png`;
  const pageUrl = `${origin}/${village.id}`;

  const out = html
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(description)}$2`)
    .replace(/(<meta property="og:image" content=")[^"]*(")/, `$1${esc(image)}$2`)
    .replace(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${esc(image)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${esc(pageUrl)}$2`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/?>/, `<link rel="canonical" href="${esc(pageUrl)}" />`);

  const headers = new Headers(assetRes.headers);
  headers.set("content-type", "text/html; charset=utf-8");
  headers.set("cache-control", `public, max-age=${CACHE_TTL}`);
  headers.delete("content-length");
  return new Response(out, { status: 200, headers });
}

// ---------- iCalendar feed ----------

async function calendarFeed(env, ctx, origin) {
  let villages;
  try {
    villages = await fetchVillages(env, ctx);
  } catch (e) {
    return new Response(`Feed temporarily unavailable: ${e}`, { status: 502 });
  }
  const now = new Date();
  const stamp = icsDateTime(now);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Zuzone//Pop-up cities//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Zuzone · Pop-up cities",
    "X-WR-CALDESC:Every pop-up city and permanent hub on zuzone, as all-day events. Updates automatically.",
    "REFRESH-INTERVAL;VALUE=DURATION:PT12H",
    "X-PUBLISHED-TTL:PT12H",
  ];
  let count = 0;
  for (const v of villages) {
    const range = parseDateRange(v.dates, now.getFullYear());
    if (!range) continue;
    const [lng, lat] = Array.isArray(v.center) ? v.center : [null, null];
    const desc = [stripHtml(v.description || ""), v.website_url ? `Website: ${v.website_url}` : "", `On Zuzone: ${origin}/${v.id}`]
      .filter(Boolean)
      .join("\n\n");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${v.id}@zuzone`,
      `DTSTAMP:${stamp}`,
      `DTSTART;VALUE=DATE:${icsDate(range.start)}`,
      `DTEND;VALUE=DATE:${icsDate(addDays(range.end, 1))}`,
      `SUMMARY:${icsText(v.name)}`,
      `DESCRIPTION:${icsText(desc)}`,
      `LOCATION:${icsText(v.location || "")}`,
      `URL:${origin}/${v.id}`,
      ...(typeof lat === "number" && typeof lng === "number" ? [`GEO:${lat};${lng}`] : []),
      `LAST-MODIFIED:${icsDateTime(new Date(v.updated_at || now))}`,
      "TRANSP:TRANSPARENT",
      "END:VEVENT",
    );
    count++;
  }
  lines.push("END:VCALENDAR");
  const body = lines.map(fold).join("\r\n") + "\r\n";
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": 'inline; filename="zuzone-popup-cities.ics"',
      "cache-control": `public, max-age=${CACHE_TTL}`,
      "access-control-allow-origin": "*",
      "x-zuzone-events": String(count),
    },
  });
}

const MONTHS = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };

/**
 * Parses the free-form `dates` strings used in the directory, e.g.
 *   "May 30 - Jun 27, 2026" · "Apr 2 - 8, 2026" · "Nov 11, 2026 - Jan 5, 2027" · "Nov 9 - Dec 9"
 * Returns { start: Date, end: Date } (UTC midnight) or null for "Permanent", "Coming soon", junk.
 */
export function parseDateRange(str, fallbackYear) {
  if (!str) return null;
  const lower = str.toLowerCase();
  if (/permanent|coming|tba|tbd/.test(lower)) return null;
  const halves = str.split(/\s*[–—-]\s*/);
  if (halves.length < 2) return null;
  const a = parsePart(halves[0]);
  const b = parsePart(halves.slice(1).join(" "));
  if (!a || !b) return null;
  if (a.month == null && b.month == null) return null;
  const startMonth = a.month ?? b.month;
  const endMonth = b.month ?? a.month;
  const endYear = b.year ?? a.year ?? fallbackYear;
  let startYear = a.year ?? (startMonth > endMonth ? endYear - 1 : endYear);
  const start = new Date(Date.UTC(startYear, startMonth, a.day ?? 1));
  const end = new Date(Date.UTC(endYear, endMonth, b.day ?? daysInMonth(endYear, endMonth)));
  if (isNaN(start) || isNaN(end) || end < start) return null;
  return { start, end };
}

function parsePart(s) {
  const m = s.match(/([a-zA-Z]{3,})/);
  const yearM = s.match(/(\d{4})/);
  const dayM = s.replace(/\d{4}/, "").match(/(\d{1,2})/);
  const month = m ? MONTHS[m[1].slice(0, 3).toLowerCase()] : undefined;
  if (m && month === undefined) return null;
  return { month: month ?? null, day: dayM ? parseInt(dayM[1], 10) : null, year: yearM ? parseInt(yearM[1], 10) : null };
}

function daysInMonth(y, m) {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}
function addDays(d, n) {
  return new Date(d.getTime() + n * 86400000);
}
function icsDate(d) {
  return d.toISOString().slice(0, 10).replace(/-/g, "");
}
function icsDateTime(d) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}
function icsText(s) {
  return String(s).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\;").replace(/,/g, "\\,");
}
function fold(line) {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out = [];
  let cur = "";
  let curBytes = 0;
  for (const ch of line) {
    const b = new TextEncoder().encode(ch).length;
    const limit = out.length === 0 ? 75 : 74;
    if (curBytes + b > limit) {
      out.push(cur);
      cur = "";
      curBytes = 0;
    }
    cur += ch;
    curBytes += b;
  }
  if (cur) out.push(cur);
  return out.join("\r\n ");
}

// ---------- misc ----------

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function stripHtml(s) {
  return String(s).replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
}
function truncate(s, n) {
  return s.length > n ? s.slice(0, n - 1).trimEnd() + "…" : s;
}
