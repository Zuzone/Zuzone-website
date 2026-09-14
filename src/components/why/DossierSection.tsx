import { useState } from "react";
import { Link } from "react-router-dom";
import { ExternalLink, Play, X } from "lucide-react";
import { DOSSIER_CHAPTERS, DOSSIER_EMBLEM, DOSSIER_SOURCES, DOSSIER_TIMELINE, type DossierChapter, type DossierPhoto, type TimelineSeg } from "@/data/zuzaluDossier";

/**
 * Part II of the Why Zuzalu page: the visual record (three chapters of photos and video)
 * and the 2022–now timeline, restyled from the research dossier.
 */

const KIND_COLOR: Record<string, string> = {
  montenegro: "bg-primary",
  istanbul: "bg-[#a63d2f]",
  chiangmai: "bg-[#b8951c]",
  spinoff: "bg-[#d9a79a]",
  pivot: "bg-foreground",
  now: "bg-accent-yellow",
  prelude: "bg-muted-foreground/50",
};

/** Village links render only while that village is public; hidden ones read as plain text. */
const Segs = ({ segs, visibleIds }: { segs: TimelineSeg[]; visibleIds: Set<string> | null }) => (
  <>
    {segs.map((s, i) =>
      s.href && visibleIds?.has(s.href.replace(/^\//, "")) ? (
        <Link key={i} to={s.href} className="font-medium text-primary underline-offset-2 hover:underline" title="Open on the Zuzone map">{s.t}</Link>
      ) : (
        <span key={i}>{s.t}</span>
      ),
    )}
  </>
);

const Lightbox = ({ photo, onClose }: { photo: DossierPhoto; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4" onClick={onClose} role="dialog" aria-modal="true">
    <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={onClose} aria-label="Close"><X className="h-5 w-5" /></button>
    <figure className="max-h-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
      <img src={photo.src} alt={photo.caption} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />
      <figcaption className="mt-3 text-center text-sm text-white/80">{photo.caption}{photo.credit && <span className="ml-2 font-mono text-xs text-white/60">{photo.credit}</span>}</figcaption>
    </figure>
  </div>
);

const Chapter = ({ ch, onOpen }: { ch: DossierChapter; onOpen: (p: DossierPhoto) => void }) => (
  <section id={ch.id} className="scroll-mt-24 border-t border-border py-10 sm:py-14">
    <div className="flex items-baseline gap-4">
      <span className="font-display text-5xl font-light text-accent-yellow sm:text-6xl">{ch.num}</span>
      <div>
        <h3 className="font-display text-2xl font-semibold sm:text-3xl">{ch.title}</h3>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{ch.place} · {ch.dates}</p>
      </div>
    </div>
    <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{ch.lede}</p>
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {ch.stats.map((s) => (
        <div key={s.label} className="rounded-xl border border-border bg-card p-3">
          <p className="font-display text-2xl font-semibold text-primary">{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
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
  </section>
);

export const DossierSection = ({ visibleIds = null }: { visibleIds?: Set<string> | null }) => {
  const [open, setOpen] = useState<DossierPhoto | null>(null);
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
          Three chapters of photographs and video, from the Montenegro prototype through ZuConnect Istanbul to the Chiang Mai Archipelago, and a timeline of everything that happened around them.
        </p>
        <nav className="mt-4 flex flex-wrap gap-2 font-mono text-[11px] uppercase tracking-[0.14em]">
          {DOSSIER_CHAPTERS.map((c) => <a key={c.id} href={`#${c.id}`} className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">{c.num} · {c.title.replace(/^Zuzalu /, "")}</a>)}
          <a href="#timeline" className="rounded-full border border-border px-3 py-1 text-muted-foreground hover:text-foreground">IV · Timeline</a>
        </nav>
      </section>

      <div className="mx-auto max-w-3xl px-4">
        {DOSSIER_CHAPTERS.map((ch) => <Chapter key={ch.id} ch={ch} onOpen={setOpen} />)}

        <section id="timeline" className="scroll-mt-24 border-t border-border py-10 sm:py-14">
          <div className="flex items-baseline gap-4">
            <span className="font-display text-5xl font-light text-accent-yellow sm:text-6xl">IV</span>
            <h3 className="font-display text-2xl font-semibold sm:text-3xl">Timeline, 2022 to now</h3>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Key moments only. Villages that are on the Zuzone map are linked.</p>
          <ol className="mt-5">
            {DOSSIER_TIMELINE.map((r, i) => (
              <li key={i} className="grid grid-cols-[56px_1fr] gap-x-3 border-t border-border/70 py-2.5 sm:grid-cols-[64px_150px_1fr]">
                <span className="font-display text-xl font-semibold leading-tight">{r.year || ""}</span>
                <span className={`col-span-1 flex items-start gap-2 font-mono text-[11px] uppercase tracking-wide text-muted-foreground sm:col-span-1 ${r.kind === "now" ? "font-semibold text-foreground" : ""}`}>
                  <span className={`mt-1 h-3 w-[3px] shrink-0 rounded ${KIND_COLOR[r.kind] || "bg-muted-foreground/50"}`} />
                  {r.when}
                </span>
                <span className={`col-span-2 text-sm leading-relaxed sm:col-span-1 ${["montenegro", "istanbul", "chiangmai"].includes(r.kind) ? "font-medium" : ""}`}><Segs segs={r.what} visibleIds={visibleIds} /></span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
            {[["montenegro", "Montenegro"], ["istanbul", "Istanbul"], ["chaingmai", "Chiang Mai"], ["spinoff", "Spin-offs"], ["pivot", "Pivots"], ["now", "Now"]].map(([k, l]) => (
              <span key={k} className="inline-flex items-center gap-1.5"><span className={`inline-block h-[3px] w-3.5 rounded ${KIND_COLOR[k === "chaingmai" ? "chiangmai" : k]}`} />{l}</span>
            ))}
          </div>
          <p className="mt-6 text-xs leading-relaxed text-muted-foreground">{DOSSIER_SOURCES}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs">
            {[["https://streameth.org/zuzalu", "ZuConnect talks"], ["https://edgecitylanna.substack.com/p/edge-city-lanna-recap-whats-next", "Edge City Lanna recap"], ["https://luma.com/tvrv9aed", "Zuzalu Archipelago showcase"]].map(([u, l]) => (
              <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{l} <ExternalLink className="h-3 w-3" /></a>
            ))}
          </div>
        </section>
      </div>
      {open && <Lightbox photo={open} onClose={() => setOpen(null)} />}
    </div>
  );
};
