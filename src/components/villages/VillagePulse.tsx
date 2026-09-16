import { useEffect, useMemo, useState } from "react";
import { Activity, ExternalLink, Loader2 } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/publicSite";
import { PostCard, type Feed, type Post } from "@/components/ZuThread";
import { timeAgo } from "@/lib/timeAgo";
import type { Village } from "@/hooks/useVillages";

const PAGE = 12;

/** X screen name from a profile/status URL, or null */
const xHandle = (url: string | null | undefined): string | null => {
  if (!url) return null;
  const m = url.match(/(?:twitter\.com|x\.com)\/@?([A-Za-z0-9_]{1,15})/i);
  return m ? m[1] : null;
};

// One fetch shared by every mounted panel (the phone and desktop variants both mount)
let feedPromise: Promise<Feed> | null = null;
const loadFeed = () => {
  if (!feedPromise) {
    feedPromise = fetch(`${PUBLIC_SITE_URL}/api/zuthread.json`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json() as Promise<Feed>;
    });
    feedPromise.catch(() => { feedPromise = null; });
  }
  return feedPromise;
};

/**
 * Pulse: the village's own X posts, pulled from the shared ZuThread feed and filtered to the
 * accounts attached to this village (its twitter_url). Newest first.
 */
export const VillagePulse = ({ village }: { village: Village }) => {
  const [feed, setFeed] = useState<Feed | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [shown, setShown] = useState(PAGE);
  const handle = xHandle(village.twitter_url);

  useEffect(() => {
    let alive = true;
    loadFeed().then((f) => { if (alive) setFeed(f); }).catch((e) => { if (alive) setError(e instanceof Error ? e.message : "Failed to load"); });
    return () => { alive = false; };
  }, []);
  useEffect(() => { setShown(PAGE); }, [village.id]);

  const posts = useMemo<Post[]>(() => {
    if (!feed) return [];
    const h = handle?.toLowerCase();
    return feed.posts.filter((p) => p.villages?.includes(village.id) || (h && p.handle.toLowerCase() === h));
  }, [feed, handle, village.id]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-display text-lg font-semibold text-foreground">
            <Activity className="h-5 w-5 text-primary" />
            Pulse
          </h3>
          {handle && (
            <a href={`https://x.com/${handle}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
              @{handle} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {handle
            ? `What ${village.name} is posting${feed ? ` · ${posts.length} post${posts.length === 1 ? "" : "s"}` : ""}${feed?.generated_at ? ` · updated ${timeAgo(feed.generated_at)} ago` : ""}`
            : "Posts from the village's own accounts"}
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4">
        {!handle ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            No social accounts added yet. Once this village's X link is added, its posts appear here.
          </p>
        ) : error ? (
          <p className="text-sm text-destructive">Couldn't load posts ({error}).</p>
        ) : !feed ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Nothing from @{handle} in the feed yet.
          </p>
        ) : (
          <div className="space-y-3">
            {posts.slice(0, shown).map((p) => <PostCard key={p.id} post={p} />)}
            {shown < posts.length && (
              <button type="button" onClick={() => setShown((n) => n + PAGE)} className="w-full rounded-full border border-border bg-card py-2 text-sm font-medium text-foreground hover:bg-muted">
                Show more ({posts.length - shown})
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
