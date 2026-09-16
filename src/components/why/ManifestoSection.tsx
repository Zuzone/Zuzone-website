import { ScrollText } from "lucide-react";

/** The manifesto, opening the Why Zuzone page (it used to live in a header side panel). */
export const ManifestoSection = () => (
  <section id="manifesto" className="mx-auto max-w-3xl px-4 pb-10 pt-14 sm:pt-20">
    <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
      <ScrollText className="h-3.5 w-3.5" /> Manifesto
    </p>
    <h1 className="mt-4 max-w-2xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
      The home for all permanent hubs and pop-up cities.
    </h1>
    <div className="mt-5 max-w-2xl space-y-3 text-lg leading-relaxed text-muted-foreground">
      <p>
        Zuzone is the connective layer for the Zuzalu ecosystem, a shared home where permanent hubs and pop-up cities
        come together, learn from each other, and grow as one global community.
      </p>
      <p>
        Born from the spirit of Zuzalu, Zuzone exists to make sure that what we are building across the world stays
        aligned, supported, transparent, and human. It is a space for coordination, care, and collective progress.
      </p>
    </div>
    <h2 className="mt-8 font-display text-2xl font-semibold sm:text-3xl">Our mission</h2>
    <p className="mt-3 max-w-2xl text-lg leading-relaxed text-muted-foreground">
      Helping hubs build, grow sustainably, and collaborate across the ecosystem. Creating a stronger, more connected
      global network in a Zuzalu-aligned way.
    </p>
  </section>
);
