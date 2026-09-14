import { useCallback, useState } from "react";
import { ChevronDown, ExternalLink, Play, X } from "lucide-react";
import { DOSSIER_CHAPTERS, DOSSIER_EMBLEM, DOSSIER_SOURCES, type DossierChapter, type DossierPhoto } from "@/data/zuzaluDossier";

/**
 * Part II of the Why Zuzone page: the visual record, three chapters of photos and video
 * restyled from the research dossier.
 */

const Lightbox = ({ photo, onClose }: { photo: DossierPhoto; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose} role="dialog" aria-modal="true">
    <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
    <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
      <img src={photo.src} alt={photo.caption} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />
      <figcaption className="mt-3 text-center text-sm text-white/80">{photo.caption}{photo.credit && <span className="ml-2 font-mono text-xs text-white/60">{photo.credit}</span>}</figcaption>
    </figure>
  </div>
);

const Chapter = ({ ch, expanded, onToggle, onOpen }: { ch: DossierChapter; expanded: boolean; onToggle: () => void; onOpen: (p: DossierPhoto) => void }) => {
  const counts = [`${ch.photos.length} photos`, ch.videos.length ? `${ch.videos.length} videos` : null].filter(Boolean).join(" and ");
  return (
    <section id={ch.id} className="scroll-mt-24 py-3">
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-baseline gap-4">
          <span className="font-display text-5xl font-light text-accent-yellow sm:text-6xl">{ch.num}</span>
          <div className="min-w-0">
            <h3 className="font-display text-2xl font-semibold sm:text-3xl">{ch.title}</h3>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{ch.place} · {ch.dates}</p>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">{ch.lede}</p>

        {!expanded && (
          <div className="mt-4 grid grid-cols-4 gap-2" aria-hidden="true">
            {ch.photos.slice(0, 4).map((p) => (
              <img key={p.src} src={p.src} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-lg bg-muted object-cover" />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          {expanded ? "Collapse" : `See ${counts}`}
          <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && (
        <div className="pb-6 pt-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {ch.stats.map((st) => (
              <div key={st.label} className="rounded-xl border border-border bg-card p-3">
                <p className="font-display text-2xl font-semibold text-primary">{st.value}</p>
                <p className="text-xs text-muted-foreground">{st.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
            {ch.photos.map((p) => (
              <figure key={p.src} className={`m-0 ${p.hero ? "col-span-2" : ""}`}>
                <button type="button" onClick={() => onOpen(p)} className="block w-full overflow-hidden rounded-xl bg-muted">
                  <img src={p.src} alt={p.caption} loading="lazy" decoding="async" className={`w-full object-cover transition-transform duration-300 hover:scale-[1.02] ${p.hero ? "aspect-video" : "aspect-[4/3]"}`} />
                </button>
                <figcaption className="mt-1.5 text-xs leading-snug text-muted-foreground">
                  {p.caption}{p.credit && <span className="ml-1.5 font-mono text-[10px] uppercase tracking-wide text-primary">{p.credit}</span>}
                </figcaption>
              </figure>
            ))}
          </div>
          {ch.videos.length > 0 && (
            <>
              <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Video</p>
              <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-4">
                {ch.videos.map((v) => (
                  <a key={v.href} href={v.href} target="_blank" rel="noopener noreferrer" className="group block">
                    <span className="relative block overflow-hidden rounded-xl bg-muted">
                      <img src={v.thumb} alt="" loading="lazy" decoding="async" className="aspect-video w-full object-cover" />
                      <span className="absolute inset-0 flex items-center justify-center"><span className="rounded-full bg-black/55 p-2.5 text-white transition-transform group-hover:scale-110"><Play className="h-4 w-4" /></span></span>
                    </span>
                    <span className="mt-1.5 block text-xs leading-snug text-foreground group-hover:text-primary">{v.title}</span>
                  </a>
                ))}
              </div>
            </>
          )}
          <button
            type="button"
            onClick={onToggle}
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted"
          >
            Collapse {ch.title.replace(/^Zuzalu /, "")}
            <ChevronDown className="h-4 w-4 rotate-180" />
          </button>
        </div>
      )}
    </section>
  );
};

export const DossierSection = () => {
  const [open, setOpen] = useState<DossierPhoto | null>(null);
  // Chapters start folded, like Part I; a #montenegro-style deep link opens that one
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([window.location.hash.slice(1)]));
  const toggle = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // Collapsing from the bottom of a long gallery: bring the chapter's card back into view
        setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);
  const openAndGo = useCallback((id: string) => {
    setExpanded((prev) => new Set(prev).add(id));
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 30);
  }, []);
  return (
    <div id="dossier" className="scroll-mt-20">
      <section className="mx-auto max-w-3xl px-4 pt-14 sm:pt-20">
        <div className="flex items-center gap-4">
          <img src={DOSSIER_EMBLEM} alt="Zuzalu emblem, 2023" className="h-16 w-16 rounded-full ring-4 ring-accent-yellow" />
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Part II · The record</p>
            <h2 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">What it looked like</h2>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
          Three chapters of photographs and video, from the Montenegro prototype through ZuConnect Istanbul to the Chiang Mai Archipelago.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {DOSSIER_CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`} onClick={(e) => { e.preventDefault(); openAndGo(c.id); }} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">{c.num} · {c.title.replace(/^Zuzalu /, "")}</a>)}
        </nav>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        <div className="pt-4">
          {DOSSIER_CHAPTERS.map((ch) => <Chapter key={ch.id} ch={ch} expanded={expanded.has(ch.id)} onToggle={() => toggle(ch.id)} onOpen={setOpen} />)}
        </div>

        <div className="py-8">
          <p className="text-xs leading-relaxed text-muted-foreground">{DOSSIER_SOURCES}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {[["https://streameth.org/zuzalu", "ZuConnect talks"], ["https://edgecitylanna.substack.com/p/edge-city-lanna-recap-whats-next", "Edge City Lanna recap"], ["https://luma.com/tvrv9aed", "Zuzalu Archipelago showcase"]].map(([u, l]) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{l} <ExternalLink className="h-3 w-3" /></a>
            ))}
          </div>
        </div>
      </div>
      {open && <Lightbox photo={open} onClose={() => setOpen(null)} />}
    </div>
  );
};
