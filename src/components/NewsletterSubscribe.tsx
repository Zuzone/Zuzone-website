import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { Check, Loader2, Mail, X } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/publicSite";

const DISMISS_KEY = "zuzone:newsletter-dismissed";

const readDismissed = () => {
  try { return localStorage.getItem(DISMISS_KEY) === "1"; } catch { return false; }
};

declare global {
  interface Window { gtag?: (...args: unknown[]) => void }
}

/**
 * Newsletter signup strip for the home page, shown under the globe. Signups go to the edge
 * worker (POST /api/newsletter/subscribe), which stores them in Supabase.
 */
export const NewsletterSubscribe = ({ source = "home", compact = false }: { source?: string; compact?: boolean }) => {
  const [dismissed, setDismissed] = useState(readDismissed);
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // honeypot: real people never see or fill this
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  if (dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* private mode: just hide for now */ }
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMessage(null);
    try {
      const res = await fetch(`${PUBLIC_SITE_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, website, source }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setState("error");
        setMessage(body.error || "Something went wrong. Please try again.");
        return;
      }
      setState("done");
      window.gtag?.("event", "sign_up", { method: "newsletter", source });
    } catch {
      setState("error");
      setMessage("Couldn't reach the server. Please try again.");
    }
  };

  return (
    <div className={`relative border-b border-border/50 ${compact ? "px-3 py-2" : "px-4 py-2.5"}`}>
      <div className={`mx-auto flex max-w-3xl gap-x-4 gap-y-1.5 ${compact ? "flex-col" : "flex-col sm:flex-row sm:items-center"}`}>
        <div className={`min-w-0 ${compact ? "pr-7" : "sm:flex-1"}`}>
          <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
            <Mail className="h-4 w-4 shrink-0 text-primary" /> Zuzone newsletter
          </p>
          <p className="text-xs text-muted-foreground">
            Monthly notes from permanent hubs and pop-up cities.{" "}
            <Link to="/newsletter" className="underline hover:text-foreground">Past issues</Link>
          </p>
        </div>

        {state === "done" ? (
          <p className="flex items-center gap-1.5 text-sm font-medium text-primary">
            <Check className="h-4 w-4" /> You're subscribed. See you next issue.
          </p>
        ) : (
          <form onSubmit={submit} className={`flex gap-2 ${compact ? "" : "sm:w-auto"}`}>
            <label className="sr-only" htmlFor={`nl-email-${source}`}>Email address</label>
            <input
              id={`nl-email-${source}`}
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); if (state === "error") setState("idle"); }}
              className="h-9 min-w-0 flex-1 rounded-full border border-border bg-background px-3.5 text-sm outline-none focus:border-primary sm:w-60 sm:flex-none"
            />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
            />
            <button
              type="submit"
              disabled={state === "sending"}
              className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-70"
            >
              {state === "sending" && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Subscribe
            </button>
          </form>
        )}
      </div>
      {message && <p className="mx-auto mt-1 max-w-3xl text-xs text-destructive">{message}</p>}
      <button
        type="button"
        onClick={dismiss}
        aria-label="Hide newsletter signup"
        className={`absolute right-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground ${compact ? "top-2" : "top-1/2 -translate-y-1/2"}`}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
};
