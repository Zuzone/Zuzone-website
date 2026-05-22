import { ScrollText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export const ManifestoDialog = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          onClick={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer">
          <ScrollText className="h-4 w-4" />
          Manifesto
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl md:text-3xl text-foreground">
            ZUZONE
          </DialogTitle>
        </DialogHeader>
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
