import { Calendar, ExternalLink } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const EVENTS = [
  {
    id: "evt-wir0KhhRYFYoDhB",
    url: "https://luma.com/event/evt-wir0KhhRYFYoDhB",
    title: "Zuzalu Demo Event",
    date: "Upcoming",
    location: "Online",
  },
  {
    id: "evt-demo-2",
    url: "https://luma.com/event/evt-wir0KhhRYFYoDhB",
    title: "Community Meetup",
    date: "TBA",
    location: "Hybrid",
  },
  {
    id: "evt-demo-3",
    url: "https://luma.com/event/evt-wir0KhhRYFYoDhB",
    title: "Workshop Session",
    date: "TBA",
    location: "Online",
  },
];

export const EventsDialog = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) => {
  useEffect(() => {
    if (!open) return;
    if (document.getElementById("luma-checkout")) return;
    const script = document.createElement("script");
    script.id = "luma-checkout";
    script.src = "https://embed.lu.ma/checkout-button.js";
    script.async = true;
    document.body.appendChild(script);
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
        >
          <Calendar className="h-4 w-4" />
          Events
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md w-[90vw] p-0 gap-0 border border-border bg-background max-h-[80vh] flex flex-col">
        <DialogTitle className="sr-only">Zuzalu Events</DialogTitle>
        <div className="flex flex-col items-center gap-2 p-4 border-b border-border">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-sm">
            Demo Embedded
          </div>
          <h2 className="text-lg font-semibold text-foreground">Zuzalu Events</h2>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-3">
            {EVENTS.map((event) => (
              <div
                key={event.id}
                className="border border-border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-foreground">{event.title}</h3>
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
                </div>
                <div className="text-xs text-muted-foreground mb-3">
                  {event.date} · {event.location}
                </div>
                <a
                  href={event.url}
                  className="luma-checkout--button inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground font-semibold text-xs rounded-full shadow-sm hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
                  data-luma-action="checkout"
                  data-luma-event-id={event.id}
                >
                  Register
                </a>
              </div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
