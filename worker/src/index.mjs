/**
 * Zuzone edge worker.
 *
 * Serves the Vite build (SPA fallback) and adds what a static host cannot:
 *   GET /calendar.ics        iCalendar feed of every pop-up city (subscribe in Google/Apple/Outlook)
 *   GET /api/villages.json   public JSON of the directory
 *   GET /:slug[/section]     index.html with per-village Open Graph tags so links unfurl on X/Telegram
 */

const RESERVED = new Set(["admin", "auth", "profile", "notifications", "embed", "widget", "assets", "api", "calendar.ics", "og.png", "robots.txt", "favicon.ico", "favicon.png", "placeholder.svg", "tonconnect-manifest.json"]);
const SECTIONS = new Set(["about", "map", "residents", "scenius", "bulletin", "events", "treasury"]);
const VILLAGE_FIELDS = "id,name,logo_url,thumbnail_url,center,dates,location,description,village_type,website_url,twitter_url,telegram_url,instagram_url,apply_url,updated_at";
const CACHE_TTL = 300;

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method !== "GET" && request.method !== "HEAD") {
      return env.ASSETS.fetch(request);
    }

    if (path === "/calendar.ics") return calendarFeed(env, ctx, url.origin);
    if (path === "/api/villages.json") return villagesJson(env, ctx);

    const slug = villageSlugFromPath(path);
    if (slug && wantsHtml(request)) {
      return villagePage(request, env, ctx, slug, url.origin);
    }

    return env.ASSETS.fetch(request);
  },
};

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

async function fetchVillages(env, ctx) {
  const cache = caches.default;
  const cacheKey = new Request(`${env.SUPABASE_URL}/rest/v1/villages?select=${VILLAGE_FIELDS}&order=created_at.asc`);
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
  return rows.filter((v) => !String(v.id).startsWith("_"));
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
