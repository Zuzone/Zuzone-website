import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** The manifesto text, used by the side panel (and the legacy dialog below). */
export const ManifestoContent = () => (
  <div className="px-4 py-4 sm:px-5">
        <div className="space-y-4 text-sm md:text-base leading-relaxed text-muted-foreground pt-2">
          <p className="text-foreground font-medium text-base md:text-lg">
            The home for all permanent hubs and pop-up cities.
          </p>
          <p>
            Zuzone is the connective layer for the Zuzalu ecosystem, a shared home where permanent hubs and pop-up cities come together, learn from each other, and grow as one global community.
          </p>
          <p>
            Born from the spirit of Zuzalu, Zuzone exists to make sure that what we are building across the world stays aligned, supported, transparent, and human. It is a space for coordination, care, and collective progress.
          </p>
          <p className="text-foreground font-medium text-base md:text-lg pt-2">
            Our Mission
          </p>
          <p>
            Helping hubs build, grow sustainably, and collaborate across the ecosystem. Creating a stronger, more connected global network in a Zuzalu-aligned way.
          </p>
          <div className="flex flex-wrap gap-2 pt-3">
            <a href="/why-zuzalu" className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">Why Zuzalu →</a>
            <a href="/why-zuzalu#dossier" className="inline-flex items-center rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted">Photos &amp; timeline →</a>
          </div>
        </div>
  </div>
);

export const ManifestoDialog = ({ open, onOpenChange }: { open?: boolean; onOpenChange?: (open: boolean) => void } = {}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl md:text-3xl text-foreground">
            ZUZONE
          </DialogTitle>
        </DialogHeader>
        <ManifestoContent />
      </DialogContent>
    </Dialog>
  );
};
