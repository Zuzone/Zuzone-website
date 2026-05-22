import { Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const EventsDialog = () => {
  return (
    <Dialog>
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
        <iframe
          src="https://lu.ma/zuzalutownhall"
          title="Zuzalu Events on Luma"
          className="w-full h-full rounded-md bg-background"
          sandbox="allow-scripts allow-popups"
          loading="lazy"
        />
      </DialogContent>
    </Dialog>
  );
};
