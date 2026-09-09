import { Activity, Mail } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { ZuThread } from "@/components/ZuThread";

/** Zupulse: the weekly Zuletter digest on top, ZuThread (every village's X posts) underneath. */
export const ZupulseContent = () => (
  <div>
    <section className="border-b border-border bg-secondary/40 px-6 py-8 text-center">
      <Activity className="mx-auto mb-3 h-10 w-10 text-accent-yellow" />
      <p className="mx-auto max-w-sm text-sm text-muted-foreground sm:text-base">
        The pulse of the network: the weekly Zuletter digest, and every village's X posts below.
      </p>
      <a
        href="https://zuzalu.substack.com"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
      >
        <Mail className="h-4 w-4" />
        Read the Zuletter
      </a>
    </section>
    <div className="pt-6">
      <ZuThread embedded />
    </div>
  </div>
);

export const ZupulseDialog = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl w-[94vw] h-[88vh] p-0 gap-0 border border-border overflow-hidden flex flex-col bg-background">
        <DialogTitle className="sr-only">Zupulse</DialogTitle>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain"><ZupulseContent /></div>
      </DialogContent>
    </Dialog>
  );
};
