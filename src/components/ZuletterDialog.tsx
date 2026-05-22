import { Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

export const ZuletterDialog = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[90vw] h-[80vh] p-1 gap-0 border border-border overflow-hidden flex flex-col bg-background">
        <DialogTitle className="sr-only">Zuletter Newsletter</DialogTitle>
        <div className="relative w-full h-full rounded-md overflow-hidden bg-background flex items-center justify-center">
          <div className="text-center p-8">
            <Mail className="h-12 w-12 mx-auto mb-4 text-accent-yellow" />
            <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
              Zuletter
            </h2>
            <p className="text-muted-foreground mb-6 max-w-sm">
              The weekly digest for pop-up cities, permanent villages, and everything Zuzalu.
            </p>
            <a
              href="https://zuzalu.substack.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Read Zuletter
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
