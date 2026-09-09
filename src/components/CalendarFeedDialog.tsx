import { useState } from "react";
import { CalendarPlus, Check, Copy, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CALENDAR_FEED_URL, CALENDAR_WEBCAL_URL, GOOGLE_CALENDAR_SUBSCRIBE_URL } from "@/lib/publicSite";

interface CalendarFeedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  villageCount?: number;
}

/**
 * Lets a visitor subscribe to every pop-up city as a live calendar feed.
 * The feed itself is generated at the edge (worker/src/index.mjs → /calendar.ics).
 */
/** Subscribe rows (Google / webcal / copy), used by the side panel and the legacy dialog. */
export const CalendarFeedContent = ({ villageCount }: { villageCount?: number }) => {
  const [copied, setCopied] = useState(false);

  const copyFeed = async () => {
    try {
      await navigator.clipboard.writeText(CALENDAR_FEED_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy the feed URL:", CALENDAR_FEED_URL);
    }
  };

  const rowClass =
    "flex items-center justify-between gap-3 w-full px-4 py-3 rounded-xl border border-border bg-muted/40 hover:bg-muted transition-colors text-left";

  return (
    <div className="px-4 py-4 sm:px-5">
      <p className="flex items-center gap-2 font-display text-xl font-semibold">
        <CalendarPlus className="h-5 w-5 text-primary" />
        Every pop-up city, in your calendar
      </p>
      <p className="mt-1 text-sm text-muted-foreground">
        One subscription, {villageCount ? `${villageCount} villages` : "all villages"} as all-day events. New pop-ups
        appear automatically. Nothing to install.
      </p>
      <div className="flex flex-col gap-2 pt-4">
          <a href={GOOGLE_CALENDAR_SUBSCRIBE_URL} target="_blank" rel="noopener noreferrer" className={rowClass}>
            <span>
              <span className="block font-semibold text-sm">Google Calendar</span>
              <span className="block text-xs text-muted-foreground">Opens Google Calendar and adds the feed</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <a href={CALENDAR_WEBCAL_URL} className={rowClass}>
            <span>
              <span className="block font-semibold text-sm">Apple Calendar · Outlook</span>
              <span className="block text-xs text-muted-foreground">Subscribes via webcal</span>
            </span>
            <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
          </a>
          <button type="button" onClick={copyFeed} className={rowClass}>
            <span className="min-w-0">
              <span className="block font-semibold text-sm">{copied ? "Copied" : "Copy feed URL"}</span>
              <span className="block text-xs text-muted-foreground font-mono truncate">{CALENDAR_FEED_URL}</span>
            </span>
            {copied ? <Check className="h-4 w-4 shrink-0 text-primary" /> : <Copy className="h-4 w-4 shrink-0 text-muted-foreground" />}
          </button>
      </div>
    </div>
  );
};

export const CalendarFeedDialog = ({ open, onOpenChange, villageCount }: CalendarFeedDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md p-0">
      <DialogHeader className="sr-only"><DialogTitle>Calendar feed</DialogTitle><DialogDescription>Subscribe to every pop-up city</DialogDescription></DialogHeader>
      <CalendarFeedContent villageCount={villageCount} />
    </DialogContent>
  </Dialog>
);
