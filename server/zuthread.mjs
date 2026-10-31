/**
 * ZuThread — every village's X posts, newest first.
 *
 * Data comes from the TikHub "user post" endpoint via monid (api.monid.ai), ~$0.0015 per
 * account per refresh. The worker cron refreshes into KV; scripts/zuthread-refresh.mjs
 * builds the same JSON locally (via the monid CLI) as a static fallback in public/.
 */

export const ZUTHREAD_MAX_POSTS = 300;
export const ZUTHREAD_MAX_AGE_DAYS = 120;

/** Villages whose twitter_url points at a person or junk; null = skip, string = use this handle. */
export const HANDLE_OVERRIDES = {};

/**
 * Personal accounts that must never appear in the thread — not as a source, not as the author
 * of a repost, not as a quoted post. Lowercase handles. (Owner request 2026-09-16.)
 */
export const EXCLUDED_HANDLES = new Set(["james_of_arc"]);
const excluded = (h) => !!h && EXCLUDED_HANDLES.has(String(h).toLowerCase());
/** True when a normalized feed post involves an excluded account. */
export function isExcludedPost(p) {
  return excluded(p?.handle) || excluded(p?.author?.handle) || excluded(p?.quoted?.handle);
}

/**
 * Accounts that belong in the thread without being a village. Their pseudo-village ids are
 * always treated as visible, and the client links them to the home page.
 */
export const EXTRA_SOURCES = [
  { handle: "zuzones", villages: [{ id: "zuzone", name: "Zuzone", logo: "/favicon.ico" }] },
];
export const EXTRA_SOURCE_IDS = new Set(EXTRA_SOURCES.flatMap((x) => x.villages.map((v) => v.id)));

/** Extract an X screen name from a profile or status URL; null for anything else. */
export function handleFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  const m = url.match(/^https?:\/\/(?:www\.|mobile\.)?(?:x|twitter)\.com\/(@?[A-Za-z0-9_]{1,15})(?:[/?#]|$)/i);
  if (!m) return null;
  const h = m[1].replace(/^@/, "");
  if (/^(home|search|explore|i|intent|share|hashtag|settings)$/i.test(h)) return null;
  return h;
}

/** villages[] → [{ handle, villages: [{id,name,logo}] }], one entry per distinct handle. */
export function handlesFromVillages(villages) {
  const byHandle = new Map();
  // Newest entries first so a shared account (Edge City, ZuCity…) is attributed to its latest village
  for (const v of [...villages].sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))) {
    let handle;
    if (Object.prototype.hasOwnProperty.call(HANDLE_OVERRIDES, v.id)) handle = HANDLE_OVERRIDES[v.id];
    else handle = handleFromUrl(v.twitter_url);
    if (!handle || excluded(handle)) continue;
    const key = handle.toLowerCase();
    if (!byHandle.has(key)) byHandle.set(key, { handle, villages: [] });
    byHandle.get(key).villages.push({ id: v.id, name: v.name, logo: v.logo_url || null });
  }
  const extras = EXTRA_SOURCES.filter((x) => !byHandle.has(x.handle.toLowerCase()));
  return [...extras, ...byHandle.values()];
}

// ---------- monid client (server side) ----------

const MONID_API = "https://api.monid.ai";
const TIKHUB_ENDPOINT = "/api/v1/twitter/web/fetch_user_post_tweet";

/**
 * Start a TikHub run through monid and wait for it. monid has no server-side wait, so this
 * polls; the schedule is budgeted because every request counts against the Worker's
 * per-invocation subrequest limit (50 on the free plan). A typical run finishes in ~5s, so
 * the first poll waits 5s: usually 3 requests per account, never more than 1 + maxPolls.
 */
export async function fetchUserPosts(handle, apiKey, { fetchImpl = fetch, firstPollMs = 5000, pollMs = 2000, maxPolls = 8 } = {}) {
  const headers = { Authorization: `Bearer ${apiKey}`, "content-type": "application/json" };
  const res = await fetchImpl(`${MONID_API}/v1/run`, {
    method: "POST",
    headers,
    body: JSON.stringify({ provider: "tikhub", endpoint: TIKHUB_ENDPOINT, input: { queryParams: { screen_name: handle } } }),
  });
  if (!res.ok) throw new Error(`monid run ${res.status}: ${(await res.text()).slice(0, 200)}`);
  let run = await res.json();
  for (let polls = 0; run.status !== "COMPLETED"; polls++) {
    if (["FAILED", "STOPPED", "BLOCKED", "TIME_OUT"].includes(run.status)) throw new Error(`monid run ${run.status}`);
    if (polls >= maxPolls) throw new Error("monid run timeout");
    await new Promise((r) => setTimeout(r, polls === 0 ? firstPollMs : pollMs));
    const poll = await fetchImpl(`${MONID_API}/v1/runs/${encodeURIComponent(run.runId)}`, { headers });
    if (!poll.ok) throw new Error(`monid poll ${poll.status}`);
    run = await poll.json();
  }
  return run.output;
}

/** Fetch one account and keep only what buildFeed needs, so partial results stay small. */
export async function fetchAccount(target, apiKey, opts) {
  try {
    const output = await fetchUserPosts(target.handle, apiKey, opts);
    const u = output?.user || {};
    return { ...target, output: { timeline: output?.timeline || [], user: { name: u.name, avatar: u.avatar, sub_count: u.sub_count, followers_count: u.followers_count } } };
  } catch (e) {
    return { ...target, output: null, error: String(e.message || e) };
  }
}

// ---------- normalization ----------

const TWITTER_DATE = /^\w{3} (\w{3}) (\d{1,2}) (\d{2}:\d{2}:\d{2}) ([+-]\d{4}) (\d{4})$/;
const MONTHS = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" };

export function parseTwitterDate(s) {
  const m = TWITTER_DATE.exec(s || "");
  if (!m) {
    const d = new Date(s);
    return isNaN(d) ? null : d.toISOString();
  }
  const [, mon, day, time, tz, year] = m;
  return new Date(`${year}-${MONTHS[mon]}-${day.padStart(2, "0")}T${time}${tz.slice(0, 3)}:${tz.slice(3)}`).toISOString();
}

function expandUrls(text, entities) {
  let out = text || "";
  const urls = (entities && !Array.isArray(entities) && entities.urls) || [];
  for (const u of urls) {
    if (u.url && u.expanded_url) out = out.split(u.url).join(u.expanded_url);
  }
  // Strip trailing pic.x.com / t.co media links that the media array already covers
  out = out.replace(/\s*https:\/\/t\.co\/\w+\s*$/g, "").trim();
  return out;
}

function collectMedia(tweet) {
  const out = [];
  const media = tweet.media;
  const push = (type, m) => {
    const url = m.media_url_https || m.url || m.thumbnail_url;
    if (!url) return;
    const w = m.original_info?.width || m.width || null;
    const h = m.original_info?.height || m.height || null;
    let video = null;
    if (type === "video" && Array.isArray(m.variants)) {
      const mp4s = m.variants.filter((v) => v.content_type === "video/mp4" && v.url).sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0));
      video = (mp4s[1] || mp4s[0])?.url || null; // mid bitrate is plenty for a feed
    }
    out.push({ type, url, width: w, height: h, video });
  };
  if (media && !Array.isArray(media)) {
    for (const m of media.photo || []) push("photo", m);
    for (const m of media.video || []) push("video", m);
    for (const m of media.animated_gif || []) push("video", m);
  }
  if (out.length === 0 && tweet.entities && !Array.isArray(tweet.entities) && Array.isArray(tweet.entities.media)) {
    for (const m of tweet.entities.media) push(m.type === "video" || m.type === "animated_gif" ? "video" : "photo", m);
  }
  return out.slice(0, 4);
}

function num(x) {
  const n = typeof x === "string" ? parseInt(x, 10) : x;
  return Number.isFinite(n) ? n : 0;
}

/** One TikHub tweet → feed post (null if it should be skipped). */
export function normalizeTweet(t, { handle, villages }) {
  if (!t || !t.tweet_id) return null;
  const isRetweet = !!(t.retweeted_tweet && t.retweeted_tweet.tweet_id);
  const src = isRetweet ? t.retweeted_tweet : t;
  const author = src.author || t.author || {};
  const authorHandle = author.screen_name || (isRetweet ? null : handle);
  const created_at = parseTwitterDate(t.created_at);
  if (!created_at) return null;
  // Skip replies to other accounts (keep self-threads)
  if (!isRetweet && t.reply_to && t.conversation_id && t.conversation_id !== t.tweet_id) {
    const mentions = (t.entities && !Array.isArray(t.entities) && t.entities.user_mentions) || [];
    const startsWithMention = /^@\w+/.test(t.text || "");
    if (startsWithMention && mentions.some((m) => m.screen_name && m.screen_name.toLowerCase() !== handle.toLowerCase())) return null;
  }
  const quoted = src.quoted && src.quoted.text
    ? { handle: src.quoted.author?.screen_name || null, name: src.quoted.author?.name || null, text: expandUrls(src.quoted.text, src.quoted.entities).slice(0, 400) }
    : null;
  if (excluded(authorHandle) || excluded(quoted?.handle)) return null;
  return {
    id: String(t.tweet_id),
    url: `https://x.com/${authorHandle || handle}/status/${src.tweet_id || t.tweet_id}`,
    created_at,
    village_id: villages[0]?.id || null,
    village_name: villages[0]?.name || handle,
    village_logo: villages[0]?.logo || null,
    villages: villages.map((v) => v.id),
    handle,
    is_retweet: isRetweet,
    author: { handle: authorHandle, name: author.name || null, avatar: author.avatar ? author.avatar.replace("_normal.", "_bigger.") : null },
    text: expandUrls(src.text, src.entities),
    media: collectMedia(src),
    quoted,
    stats: { likes: num(src.favorites), reposts: num(src.retweets), replies: num(src.replies), views: num(src.views) },
  };
}

/** Merge per-handle outputs into the final feed document. */
export function buildFeed(results, { now = new Date() } = {}) {
  const cutoff = now.getTime() - ZUTHREAD_MAX_AGE_DAYS * 86400000;
  const seen = new Set();
  const posts = [];
  const sources = [];
  for (const r of results) {
    const { handle, villages, output, error } = r;
    const user = output?.user || null;
    sources.push({
      handle,
      villages: villages.map((v) => v.id),
      name: user?.name || null,
      avatar: user?.avatar ? user.avatar.replace("_normal.", "_bigger.") : null,
      followers: user?.sub_count || user?.followers_count || null,
      posts: 0,
      error: error || null,
    });
    const src = sources[sources.length - 1];
    for (const t of output?.timeline || []) {
      const p = normalizeTweet(t, { handle, villages });
      if (!p) continue;
      if (seen.has(p.id)) continue;
      if (new Date(p.created_at).getTime() < cutoff) continue;
      seen.add(p.id);
      posts.push(p);
      src.posts++;
    }
  }
  posts.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
  return {
    generated_at: now.toISOString(),
    count: Math.min(posts.length, ZUTHREAD_MAX_POSTS),
    sources,
    posts: posts.slice(0, ZUTHREAD_MAX_POSTS),
  };
}

/**
 * Refresh every handle; never throws. Runs a few accounts at a time so a manual refresh
 * finishes in seconds, while still being gentle enough not to trip upstream rate limits.
 */
export async function refreshFeed(villages, apiKey, opts = {}) {
  const { concurrency = 4, ...fetchOpts } = opts;
  const targets = handlesFromVillages(villages);
  const results = new Array(targets.length);
  let next = 0;
  const worker = async () => {
    while (true) {
      const i = next++;
      if (i >= targets.length) return;
      const t = targets[i];
      try {
        results[i] = { ...t, output: await fetchUserPosts(t.handle, apiKey, fetchOpts) };
      } catch (e) {
        results[i] = { ...t, output: null, error: String(e.message || e) };
      }
    }
  };
  await Promise.all(Array.from({ length: Math.min(concurrency, targets.length) }, worker));
  return buildFeed(results.filter(Boolean));
}
