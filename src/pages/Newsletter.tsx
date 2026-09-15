import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Newspaper } from "lucide-react";
import { Chapter, Lightbox, useChapterExpansion } from "@/components/why/DossierSection";
import type { DossierPhoto } from "@/data/zuzaluDossier";
import { NEWSLETTER_ARCHIVE_URL, NEWSLETTER_ISSUES } from "@/data/zuzoneNewsletter";

/** The Zuzone newsletter, issue by issue, newest first. The latest issue starts open. */
const Newsletter = () => {
  const [photo, setPhoto] = useState<DossierPhoto | null>(null);
  const { expanded, toggle, openAndGo } = useChapterExpansion(NEWSLETTER_ISSUES.slice(0, 1).map((i) => i.id));

  useEffect(() => {
    document.title = "Newsletter — Zuzone";
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "auto" }), 50);
    else window.scrollTo(0, 0);
    return () => { document.title = "Zuzone"; };
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Zuzone
          </Link>
          <a href={NEWSLETTER_ARCHIVE_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            Archive on zuzone.org <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-4 pt-14 sm:pt-20">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
          <Newspaper className="h-3.5 w-3.5" /> Monthly
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">Newsletter</h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          What the permanent hubs and pop-up cities are building, month by month: essays from the community, new villages,
          d/acc builders and conversations across the ecosystem.
        </p>
        <nav className="mt-5 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {NEWSLETTER_ISSUES.map((i) => (
            <a key={i.id} href={`#${i.id}`} onClick={(e) => { e.preventDefault(); openAndGo(i.id); }} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">
              {i.title}
            </a>
          ))}
        </nav>
      </section>

      <div className="mx-auto max-w-3xl px-4 pb-16">
        {NEWSLETTER_ISSUES.map((issue) => (
          <Chapter key={issue.id} ch={issue} expanded={expanded.has(issue.id)} onToggle={() => toggle(issue.id)} onOpen={setPhoto} />
        ))}
        <p className="pt-6 text-xs text-muted-foreground">
          Summaries of the Zuzone newsletter; full articles live on{" "}
          <a href={NEWSLETTER_ARCHIVE_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">zuzone.org</a>.
          Photos belong to the credited authors.
        </p>
      </div>
      {photo && <Lightbox photo={photo} onClose={() => setPhoto(null)} />}
    </div>
  );
};

export default Newsletter;
