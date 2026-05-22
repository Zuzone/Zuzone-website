import { Calendar } from "lucide-react";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
      <DialogContent className="max-w-md w-[90vw] p-6 gap-0 border border-border bg-background">
        <DialogTitle className="sr-only">Zuzalu Events</DialogTitle>
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-sm">
            Demo Embedded
          </div>
          <h2 className="text-lg font-semibold text-foreground">Zuzalu Event</h2>
          <a
            href="https://luma.com/event/evt-wir0KhhRYFYoDhB"
            className="luma-checkout--button inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-primary-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
            data-luma-action="checkout"
            data-luma-event-id="evt-wir0KhhRYFYoDhB"
          >
            Register for Event
          </a>
        </div>
      </DialogContent>
    </Dialog>
  );
};
