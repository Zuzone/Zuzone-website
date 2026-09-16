import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowUp, ExternalLink, Heart, MessageCircle, Play, RefreshCw, Repeat2 } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/publicSite";
import { timeAgo } from "@/lib/timeAgo";

export interface Media { type: "photo" | "video"; url: string; width: number | null; height: number | null; video: string | null }
export interface Post {
  id: string;
  url: string;
  created_at: string;
  village_id: string | null;
  village_name: string;
  village_logo: string | null;
  villages: string[];
  handle: string;
  is_retweet: boolean;
  author: { handle: string | null; name: string | null; avatar: string | null };
  text: string;
  media: Media[];
  quoted: { handle: string | null; name: string | null; text: string } | null;
  stats: { likes: number; reposts: number; replies: number; views: number };
}
export interface Source { handle: string; villages: string[]; name: string | null; avatar: string | null; posts: number; error: string | null }
export interface Feed { generated_at: string | null; count: number; sources: Source[]; posts: Post[] }

const PAGE = 24;

/** Turn URLs, @mentions and #hashtags into links; everything else is plain text. */
function linkify(text: string): ReactNode[] {
  const re = /(https?:\/\/[^\s]+)|(@[A-Za-z0-9_]{1,15})|(#[\p{L}\p{N}_]+)/gu;
  const out: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const cls = "text-primary underline-offset-2 hover:underline break-all";
    if (m[1]) out.push(<a key={i++} href={tok} target="_blank" rel="noopener noreferrer" className={cls}>{tok.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}</a>);
    else if (m[2]) out.push(<a key={i++} href={`https://x.com/${tok.slice(1)}`} target="_blank" rel="noopener noreferrer" className={cls}>{tok}</a>);
    else out.push(<a key={i++} href={`https://x.com/hashtag/${tok.slice(1)}`} target="_blank" rel="noopener noreferrer" className={cls}>{tok}</a>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Posts from Zuzone's own account link home; everything else links to its village page. */
const villageHref = (id: string) => (id === "zuzone" ? "/" : `/${id}`);

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n));

export const PostCard = ({ post }: { post: Post }) => {
  const avatar = post.author.avatar || post.village_logo || "/placeholder.svg";
  const name = post.author.name || post.village_name;
  const handle = post.author.handle || post.handle;
  return (
    <article className="rounded-2xl border border-border bg-card/70 p-4 shadow-sm">
      {post.is_retweet && (
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Repeat2 className="h-3.5 w-3.5" />
          {post.village_id ? <Link to={villageHref(post.village_id)} className="font-medium hover:underline">{post.village_name}</Link> : post.village_name} reposted
        </p>
      )}
      <header className="flex items-start gap-3">
        <img src={avatar} alt="" className="h-10 w-10 shrink-0 rounded-full bg-muted object-cover" loading="lazy" onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <span className="truncate font-semibold text-foreground">{name}</span>
            <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="truncate text-xs text-muted-foreground hover:underline">@{handle}</a>
            <span className="text-xs text-muted-foreground">· {timeAgo(post.created_at)}</span>
          </div>
          {!post.is_retweet && post.village_id && (
            <Link to={villageHref(post.village_id)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              {post.village_logo && <img src={post.village_logo} alt="" className="h-3.5 w-3.5 rounded-sm" loading="lazy" />}
              {post.village_name}
            </Link>
          )}
        </div>
      </header>

      {post.text && <p className="mt-3 whitespace-pre-wrap break-words text-[15px] leading-relaxed text-foreground">{linkify(post.text)}</p>}

      {post.media.length > 0 && (
        <div className={`mt-3 grid gap-1.5 overflow-hidden rounded-xl ${post.media.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}>
          {post.media.map((m, i) =>
            m.type === "video" && m.video ? (
              <video key={i} controls preload="none" poster={m.url} className="max-h-[420px] w-full bg-black object-contain" playsInline>
                <source src={m.video} type="video/mp4" />
              </video>
            ) : m.type === "video" ? (
              <a key={i} href={post.url} target="_blank" rel="noopener noreferrer" className="relative block">
                <img src={m.url} alt="" className="max-h-[420px] w-full object-cover" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-black/60 p-3 text-white"><Play className="h-5 w-5" /></span></span>
              </a>
            ) : (
              <a key={i} href={post.url} target="_blank" rel="noopener noreferrer">
                <img src={m.url} alt="" className={`w-full object-cover ${post.media.length > 1 ? "aspect-square" : "max-h-[520px]"}`} loading="lazy" />
              </a>
            ),
          )}
        </div>
      )}

      {post.quoted && (
        <blockquote className="mt-3 rounded-xl border border-border/70 bg-muted/40 p-3 text-sm">
          {(post.quoted.name || post.quoted.handle) && (
            <p className="mb-1 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">{post.quoted.name}</span> {post.quoted.handle && `@${post.quoted.handle}`}
            </p>
          )}
          <p className="whitespace-pre-wrap break-words text-foreground/90">{linkify(post.quoted.text)}</p>
        </blockquote>
      )}

      <footer className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" />{fmt(post.stats.likes)}</span>
        <span className="inline-flex items-center gap-1"><Repeat2 className="h-3.5 w-3.5" />{fmt(post.stats.reposts)}</span>
        <span className="inline-flex items-center gap-1"><MessageCircle className="h-3.5 w-3.5" />{fmt(post.stats.replies)}</span>
        <a href={post.url} target="_blank" rel="noopener noreferrer" className="ml-auto inline-flex items-center gap-1 hover:text-foreground">
          Open on X <ExternalLink className="h-3 w-3" />
        </a>
      </footer>
    </article>
  );
};

/**
 * ZuThread: every village's X posts in one chronological feed, newest first.
 * Data: /api/zuthread.json on the edge worker (KV, refreshed by cron; static snapshot fallback).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const ZuThread = ({ embedded = false }: { embedded?: boolean }) => {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const [filter, setFilter] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [note, setNote] = useState<string | null>(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);

  /** Load the feed, optionally bypassing the edge cache after a refresh. */
  const load = useCallback(async (bust = false) => {
    const url = `${PUBLIC_SITE_URL}/api/zuthread.json${bust ? `?t=${Date.now()}` : ""}`;
    const res = await fetch(url, bust ? { cache: "no-store" } : undefined);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data: Feed = await res.json();
    if (alive.current) setFeed(data);
    return data;
  }, []);

  useEffect(() => {
    load().catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, [load]);

  /**
   * Ask the worker to pull every village's timeline again. The pull runs server-side in the
   * background (it costs real money, so it is rate limited there), and we follow its status.
   */
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setNote(null);
    const before = feed?.generated_at ?? null;
    try {
      const res = await fetch(`${PUBLIC_SITE_URL}/api/zuthread/refresh`, { method: "POST" });
      const body = await res.json().catch(() => ({}));

      if (res.status === 503) {
        setNote("Live refresh isn't switched on for this site yet.");
        return;
      }
      if (res.status === 429) {
        const mins = Math.max(1, Math.ceil((body.retry_after_s || 60) / 60));
        setNote(body.reason === "daily_cap" ? "Daily refresh limit reached." : `Just refreshed. Try again in ${mins} min.`);
        return;
      }
      if (!res.ok && res.status !== 202) {
        setNote(body.error || `Refresh failed (${res.status}).`);
        return;
      }

      // Poll until the worker reports done, then reload the feed past the cache
      const deadline = Date.now() + 150_000;
      while (Date.now() < deadline && alive.current) {
        await sleep(3000);
        const st = await fetch(`${PUBLIC_SITE_URL}/api/zuthread/status`, { cache: "no-store" }).then((r) => r.json()).catch(() => null);
        if (!st) continue;
        if (st.state === "done") {
          const data = await load(true);
          setNote(data.generated_at && data.generated_at !== before ? null : "No new posts.");
          return;
        }
        if (st.state === "error") {
          setNote(st.error || "Refresh failed.");
          return;
        }
      }
      setNote("Still refreshing. Give it a minute and reload.");
    } catch (e) {
      setNote(e instanceof Error ? e.message : "Refresh failed.");
    } finally {
      if (alive.current) setRefreshing(false);
    }
  }, [feed?.generated_at, load]);

  const sources = useMemo(() => (feed ? feed.sources.filter((s) => !s.error && s.posts > 0) : []), [feed]);
  const posts = useMemo(() => {
    if (!feed) return [];
    return filter ? feed.posts.filter((p) => p.handle.toLowerCase() === filter) : feed.posts;
  }, [feed, filter]);

  const Wrapper = embedded ? "div" : "section";
  return (
    <Wrapper id={embedded ? undefined : "zuthread"} className={embedded ? "bg-background" : "border-t border-border bg-background scroll-mt-4"}>
      <div className={embedded ? "px-4 pb-6 pt-2 sm:px-6" : "mx-auto max-w-2xl px-4 py-10 sm:py-14"}>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className={`font-display font-semibold text-foreground ${embedded ? "text-2xl" : "text-3xl sm:text-4xl"}`}>ZuThread</h2>
            <p className="mt-1 text-sm text-muted-foreground sm:text-base">The shared thread of the Zuzalu ecosystem: villages and permanent hubs. Newest first.</p>
          </div>
          {!embedded && (
            <a href="#top" className="inline-flex shrink-0 items-center gap-1 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground">
              <ArrowUp className="h-3.5 w-3.5" /> Map
            </a>
          )}
        </div>

        {sources.length > 0 && (
          <div className={`mt-5 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] ${embedded ? "-mx-4 px-4 sm:-mx-6 sm:px-6" : "-mx-4 px-4"}`}>
            <button
              onClick={() => { setFilter(null); setShown(PAGE); }}
              className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${filter === null ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"}`}
            >
              All
            </button>
            {sources.map((s) => {
              const on = filter === s.handle.toLowerCase();
              return (
                <button
                  key={s.handle}
                  onClick={() => { setFilter(on ? null : s.handle.toLowerCase()); setShown(PAGE); }}
                  title={`@${s.handle}`}
                  className={`flex shrink-0 items-center gap-1.5 rounded-full border py-1 pl-1 pr-3 text-xs font-medium transition-colors ${on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-foreground hover:bg-muted"}`}
                >
                  <img src={s.avatar || "/placeholder.svg"} alt="" className="h-5 w-5 rounded-full bg-muted object-cover" loading="lazy" />
                  {s.name || s.handle}
                </button>
              );
            })}
          </div>
        )}

        {feed && (
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-xs text-muted-foreground">
              {posts.length} posts · {sources.length} accounts{feed.generated_at ? ` · updated ${timeAgo(feed.generated_at) === "now" ? "just now" : `${timeAgo(feed.generated_at)} ago`}` : ""}
            </p>
            <button
              type="button"
              onClick={refresh}
              disabled={refreshing}
              title="Pull the latest posts from every village"
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            {note && <span className="text-xs text-muted-foreground">{note}</span>}
          </div>
        )}

        <div className="mt-5 space-y-3">
          {error && <p className="rounded-xl border border-border p-4 text-sm text-muted-foreground">Couldn't load the thread ({error}).</p>}
          {!feed && !error && [0, 1, 2].map((i) => <div key={i} className="h-32 animate-pulse rounded-2xl bg-muted/60" />)}
          {posts.slice(0, shown).map((p) => <PostCard key={p.id} post={p} />)}
        </div>

        {posts.length > shown && (
          <div className="mt-6 flex justify-center">
            <button onClick={() => setShown((n) => n + PAGE)} className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90">
              Show more
            </button>
          </div>
        )}
      </div>
    </Wrapper>
  );
};
