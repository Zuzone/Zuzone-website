import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const EventsDialog = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) => {
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
      <DialogContent className="max-w-4xl w-[90vw] h-[85vh] p-1 gap-0 border border-border overflow-hidden flex flex-col bg-background">
        <DialogTitle className="sr-only">Zuzalu Events</DialogTitle>
        <div className="relative w-full h-full rounded-md overflow-hidden">
          <div className="absolute top-2 right-2 z-10">
            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-primary text-primary-foreground rounded-full shadow-sm">
              Demo Embedded
            </span>
          </div>
          <iframe
            src="https://lu.ma/oenuqdgn?tk=Sl3wwv"
            title="Zuzalu Embedded Event"
            className="w-full h-full rounded-md bg-background"
            style={{ border: "1px solid #bfcbda88" }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
