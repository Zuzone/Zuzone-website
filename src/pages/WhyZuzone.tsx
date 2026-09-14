import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ArrowRight, ChevronDown, ExternalLink, Sparkles } from "lucide-react";
import { PUBLIC_SITE_URL } from "@/lib/publicSite";
import { DossierSection } from "@/components/why/DossierSection";

/**
 * Why Zuzone — Zuzalu (2023) was the experiment; Zuzone is an independent coordination layer that
 * came later for the ecosystem that grew out of it. Keep that separation explicit in any copy here.
 * The argument is told through Vitalik Buterin's essay
 * "Why I Built Zuzalu" (Palladium Magazine, October 2023).
 * Part I: the argument, collapsed by default. Part II: the photo record (DossierSection).
 * All essay prose here is paraphrase; only the pull-quotes are verbatim and each is under 15 words.
 */

const ESSAY_URL = "https://www.palladiummag.com/2023/10/06/why-i-built-zuzalu/";
const MAPBOX_TOKEN = "REDACTED_MAPBOX_TOKEN";

// ---------- 1. size × duration ----------

interface Form { id: string; label: string; people: number; days: number; note: string; highlight?: boolean }
const FORMS: Form[] = [
  { id: "house", label: "Hacker house", people: 15, days: 270, note: "Ten to twenty people for months or years. Deep, but too small to feel like a place." },
  { id: "conference", label: "Conference", people: 5000, days: 5, note: "Thousands of people for a week. Enough for serendipity, not for depth." },
  { id: "zuzalu", label: "Zuzalu 2023", people: 200, days: 60, note: "One step in each direction: two hundred people, two months. Ambitious enough to learn from, light enough to run.", highlight: true },
  { id: "state", label: "Network state", people: 100000, days: 3650, note: "The grand vision: a permanent, self-governing population. The essay stays deliberately agnostic about it." },
];

const SizeDurationChart = () => {
  const [active, setActive] = useState<string>("zuzalu");
  const W = 640, H = 360, PAD = { l: 56, r: 24, t: 20, b: 44 };
  const lx = (p: number) => PAD.l + ((Math.log10(p) - 1) / (5 - 1)) * (W - PAD.l - PAD.r); // 10 → 100k
  const ly = (d: number) => H - PAD.b - (Math.log10(d) / Math.log10(3650)) * (H - PAD.t - PAD.b); // 1 → 3650
  const a = FORMS.find((f) => f.id === active)!;
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-border bg-card" role="img" aria-label="Community size versus duration">
        {/* sweet spot */}
        <rect x={lx(80)} y={ly(120)} width={lx(600) - lx(80)} height={ly(20) - ly(120)} rx={12} className="fill-primary/10" />
        <text x={lx(600) - 6} y={ly(120) + 14} textAnchor="end" className="fill-primary text-[11px] font-semibold">the gap</text>
        {/* axes */}
        {[10, 100, 1000, 10000, 100000].map((p) => (
          <g key={p}>
            <line x1={lx(p)} x2={lx(p)} y1={PAD.t} y2={H - PAD.b} className="stroke-border" strokeDasharray="2 4" />
            <text x={lx(p)} y={H - PAD.b + 16} textAnchor="middle" className="fill-muted-foreground text-[10px]">{p >= 1000 ? `${p / 1000}k` : p}</text>
          </g>
        ))}
        {[1, 7, 30, 365, 3650].map((d) => (
          <g key={d}>
            <line x1={PAD.l} x2={W - PAD.r} y1={ly(d)} y2={ly(d)} className="stroke-border" strokeDasharray="2 4" />
            <text x={PAD.l - 6} y={ly(d) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">{d === 1 ? "1 day" : d === 7 ? "1 wk" : d === 30 ? "1 mo" : d === 365 ? "1 yr" : "10 yr"}</text>
          </g>
        ))}
        <text x={(W + PAD.l) / 2} y={H - 6} textAnchor="middle" className="fill-muted-foreground text-[10px] uppercase tracking-wide">people</text>
        {FORMS.map((f) => (
          <g key={f.id} onClick={() => setActive(f.id)} onMouseEnter={() => setActive(f.id)} className="cursor-pointer">
            <circle cx={lx(f.people)} cy={ly(f.days)} r={active === f.id ? 13 : 9} className={f.highlight ? "fill-primary" : "fill-muted-foreground/70"} />
            {active === f.id && <circle cx={lx(f.people)} cy={ly(f.days)} r={20} className="fill-none stroke-primary" strokeWidth={1.5} />}
            <text x={lx(f.people)} y={ly(f.days) - 18} textAnchor="middle" className="fill-foreground text-[11px] font-semibold">{f.label}</text>
          </g>
        ))}
      </svg>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{a.people.toLocaleString()} people · {a.days >= 365 ? `${Math.round(a.days / 365)} yr+` : a.days >= 30 ? `${Math.round(a.days / 30)} months` : `${a.days} days`}</p>
        <p className="mt-1 font-display text-xl font-semibold">{a.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.note}</p>
      </div>
    </div>
  );
};

// ---------- 2. distributed tribe ----------

const TRIBE = [
  { name: "Switzerland", what: "Legal home of the Ethereum Foundation", lng: 8.54, lat: 47.37 },
  { name: "Singapore", what: "Second foundation entity", lng: 103.82, lat: 1.35 },
  { name: "Berlin", what: "Core developers", lng: 13.4, lat: 52.52 },
  { name: "Romania", what: "Client teams", lng: 24.97, lat: 45.94 },
  { name: "Australia", what: "Client teams", lng: 151.2, lat: -33.87 },
  { name: "India", what: "Layer-2 teams", lng: 77.59, lat: 12.97 },
  { name: "China", what: "Layer-2 teams", lng: 121.47, lat: 31.23 },
];
const tribeMapUrl = () => {
  const pins = TRIBE.map((t) => `pin-s+2f5d3f(${t.lng},${t.lat})`).join(",");
  return `https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${pins}/60,20,0.9,0/1000x420@2x?access_token=${MAPBOX_TOKEN}`;
};

// ---------- 4. scaffolding vs emergence ----------

interface Layer { id: string; label: string; ring: "core" | "emergent"; text: string }
const LAYERS: Layer[] = [
  { id: "food", label: "Breakfast", ring: "core", text: "A daily buffet with a local restaurant, loosely modelled on Bryan Johnson's Blueprint diet, on roughly fifteen dollars a person a day." },
  { id: "zupass", label: "Zupass", ring: "core", text: "0xPARC's zero-knowledge passport: prove you are a resident without revealing who, in person and online (anonymous polls included). It went from hackathon-grade to better than years-old apps in two months." },
  { id: "venue", label: "Venue", ring: "core", text: "An existing resort, rented off-season, about a hundred apartments at once. Using infrastructure that already existed kept an eight-person team viable." },
  { id: "booking", label: "Self-serve booking", ring: "core", text: "An AV-equipped room anyone could book from a permissionless web page. The schedule was not curated; it was claimed." },
  { id: "plunge", label: "Cold plunges", ring: "emergent", text: "A daily morning ritual nobody planned, which became one of the defining memories." },
  { id: "cooking", label: "Cooking", ring: "emergent", text: "Residents organised their own dinners once the buffet proved the pattern." },
  { id: "karaoke", label: "Karaoke", ring: "emergent", text: "Appeared after a month, once people stopped being visitors." },
  { id: "tracks", label: "Resident tracks", ring: "emergent", text: "Longevity, ZK, governance and more: sub-events and whole tracks run by whoever cared enough to run them." },
];

const Onion = () => {
  const [pick, setPick] = useState<string>("zupass");
  const W = 520, H = 400, cx = W / 2, cy = H / 2;
  const place = (items: Layer[], r: number) => items.map((it, i) => { const ang = -Math.PI / 2 + (i / items.length) * Math.PI * 2; return { it, x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) }; });
  const core = place(LAYERS.filter((l) => l.ring === "core"), 78);
  const outer = place(LAYERS.filter((l) => l.ring === "emergent"), 160);
  const sel = LAYERS.find((l) => l.id === pick)!;
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full rounded-xl border border-border bg-card" role="img" aria-label="Planned core and emergent layer">
        <circle cx={cx} cy={cy} r={175} className="fill-secondary/60 stroke-border" />
        <circle cx={cx} cy={cy} r={105} className="fill-primary/10 stroke-primary/40" />
        <text x={cx} y={cy - 118} textAnchor="middle" className="fill-primary text-[10px] font-semibold uppercase tracking-wider">planned</text>
        <text x={cx} y={cy + 192} textAnchor="middle" className="fill-muted-foreground text-[10px] font-semibold uppercase tracking-wider">emerged</text>
        {[...core, ...outer].map(({ it, x, y }) => (
          <g key={it.id} onClick={() => setPick(it.id)} onMouseEnter={() => setPick(it.id)} className="cursor-pointer">
            <rect x={x - 46} y={y - 14} width={92} height={28} rx={14} className={pick === it.id ? "fill-primary" : it.ring === "core" ? "fill-card stroke-primary/60" : "fill-card stroke-border"} />
            <text x={x} y={y + 4} textAnchor="middle" className={`text-[11px] font-semibold ${pick === it.id ? "fill-primary-foreground" : "fill-foreground"}`}>{it.label}</text>
          </g>
        ))}
      </svg>
      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">{sel.ring === "core" ? "Centrally planned" : "Bottom-up"}</p>
        <p className="mt-1 font-display text-xl font-semibold">{sel.label}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{sel.text}</p>
      </div>
    </div>
  );
};

// ---------- 5. diversity rule ----------

const DiversityRule = () => {
  const [top, setTop] = useState(28);
  const capture = top > 33;
  const others = 100 - top;
  const rest = [0.3, 0.22, 0.16, 0.12, 0.1, 0.1].map((f) => others * f);
  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <label htmlFor="topshare" className="text-sm font-medium">Largest nationality's share: <span className="font-mono">{top}%</span></label>
        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${capture ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"}`}>{capture ? "capture risk" : "within the rule"}</span>
      </div>
      <input id="topshare" type="range" min={10} max={60} value={top} onChange={(e) => setTop(Number(e.target.value))} className="mt-3 w-full accent-[hsl(var(--primary))]" />
      <div className="mt-3 flex h-8 w-full overflow-hidden rounded-lg">
        <div className={`${capture ? "bg-destructive/70" : "bg-primary"} transition-all`} style={{ width: `${top}%` }} title="largest country" />
        {rest.map((w, i) => <div key={i} className="border-l border-background bg-muted-foreground/40 transition-all" style={{ width: `${w}%`, opacity: 0.9 - i * 0.1 }} />)}
      </div>
      <div className="relative mt-1 h-4 text-[10px] text-muted-foreground">
        <span className="absolute -translate-x-1/2" style={{ left: "33.3%" }}>▲ one third</span>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Zuzalu engineered its invitations so no single country passed one third of residents; the two largest groups were American and Chinese.
        {capture ? " Above that line one national culture becomes the default everyone else adapts to, which is exactly what the mix was designed to prevent." : " The point was not proportional representation but bridge-building between groups that would otherwise never share a kitchen."}
      </p>
    </div>
  );
};

// ---------- 6. worked / didn't ----------

const WORKED = [
  ["The form factor", "Two hundred people for two months was the right size. Nearly everyone said they enjoyed it, and it felt like a small city rather than a long conference."],
  ["Duration changes the mind", "A conference is a break from your life; a two-month stay becomes your life. People planned, built and formed habits instead of networking."],
  ["A focused network beats a big one", "A few hundred people chosen around shared interests substituted for the unfocused network of a megacity."],
  ["Beta-testing inside a community", "Zupass improved faster in two months of daily use than most apps do in years. Lifestyle experiments got the same treatment: a healthier daily routine treated as a technology to iterate on."],
];
const DIDNT = [
  ["Crypto payments", "Present, but limited. Most of the economy still ran on ordinary money."],
  ["DAO governance", "Nobody even tried. The community was too small and too short-lived to need it."],
  ["Topic diversity", "Ethereum dominated. Longevity, rationalists and the 'meta' crowd were there, but thinner than hoped."],
  ["A clear next step", "The essay ends without one. Grand geopolitical framings did not match what Zuzalu was actually achieving."],
];

const Verdicts = () => {
  const [tab, setTab] = useState<"worked" | "didnt">("worked");
  const rows = tab === "worked" ? WORKED : DIDNT;
  return (
    <div>
      <div className="inline-flex rounded-full border border-border bg-card p-1">
        {(["worked", "didnt"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            {t === "worked" ? "What worked" : "What didn't"}
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {rows.map(([h, t]) => (
          <div key={h} className="rounded-xl border border-border bg-card p-4">
            <p className="font-semibold">{h}</p>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---------- 7. ambition ladder ----------

const LADDER = [
  { label: "Decentralized movement", text: "A 21st-century non-aligned bloc between the great powers. The essay's verdict: inspiring, but not what Zuzalu was doing." },
  { label: "New-society incubator", text: "A place where technologies with a cultural component get built and tested. Closest to where Vitalik wants this to go." },
  { label: "Zuzalu", text: "Two hundred people, two months, one resort. Part university, part monastery, part nomad hub, plus something new.", here: true },
  { label: "Nomad hub", text: "Digital nomadism grew fast, then plateaued as a niche. The open question is whether 'Zuzaluism' avoids the same fate." },
  { label: "University / monastery", text: "The precedents worth studying: durable institutions built around shared practice, ironically after a decade of trying to replace universities with online courses." },
];

const Ladder = () => {
  const [i, setI] = useState(2);
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <ol className="space-y-1.5">
        {LADDER.map((r, idx) => (
          <li key={r.label}>
            <button onClick={() => setI(idx)} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${i === idx ? "border-primary bg-primary/10" : "border-border bg-card hover:bg-muted"}`}>
              <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${r.here ? "bg-primary" : "bg-muted-foreground/40"}`} />
              <span className="font-medium">{r.label}</span>
              {r.here && <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">2023</span>}
            </button>
          </li>
        ))}
      </ol>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">rung {LADDER.length - i} of {LADDER.length}</p>
        <p className="mt-1 font-display text-xl font-semibold">{LADDER[i].label}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{LADDER[i].text}</p>
      </div>
    </div>
  );
};

// ---------- misc ----------

const useCountUp = (target: number, ms = 900) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0; const t0 = performance.now();
    const step = (t: number) => { const k = Math.min(1, (t - t0) / ms); setV(Math.round(target * (1 - Math.pow(1 - k, 3)))); if (k < 1) raf = requestAnimationFrame(step); };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
};
const Stat = ({ n, prefix = "", suffix = "", label }: { n: number; prefix?: string; suffix?: string; label: string }) => {
  const v = useCountUp(n);
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="font-display text-3xl font-semibold text-primary">{prefix}{v.toLocaleString()}{suffix}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  );
};

const ESSAY_PARTS = ["Places aren't fixed", "A tribe that is already distributed", "The gap between a house and a conference", "The recipe", "Plan the scaffolding, let the rest emerge", "Diversity by design", "The verdict", "Where does this go?"];

const Section = ({ n, title, children, lede }: { n: string; title: string; lede?: string; children: React.ReactNode }) => (
  <section className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
    <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">{n}</p>
    <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{title}</h2>
    {lede && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{lede}</p>}
    <div className="mt-6">{children}</div>
  </section>
);

const Quote = ({ q, ctx }: { q: string; ctx: string }) => (
  <figure className="rounded-2xl border border-border bg-card p-5">
    <blockquote className="font-display text-xl leading-snug">“{q}”</blockquote>
    <figcaption className="mt-2 text-xs text-muted-foreground">Vitalik Buterin, {ctx}</figcaption>
  </figure>
);

const WhyZuzone = () => {
  const [villageCount, setVillageCount] = useState<number | null>(null);
  // Part I is long; it starts folded unless someone deep-links into it
  const [essayOpen, setEssayOpen] = useState(() => window.location.hash === "#essay");
  const openEssay = useCallback(() => {
    setEssayOpen(true);
    setTimeout(() => document.getElementById("essay")?.scrollIntoView({ behavior: "smooth" }), 30);
  }, []);
  useEffect(() => {
    document.title = "Why Zuzone";
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) setTimeout(() => target.scrollIntoView({ behavior: "auto" }), 50);
    else window.scrollTo(0, 0);
    fetch(`${PUBLIC_SITE_URL}/api/villages.json`).then((r) => r.json()).then((d) => setVillageCount(d.count)).catch(() => {});
    return () => { document.title = "Zuzone"; };
  }, []);
  const mapUrl = useMemo(tribeMapUrl, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border/60 bg-background/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold hover:underline">
            <ArrowLeft className="h-4 w-4" /> Zuzone
          </Link>
          <nav className="flex items-center gap-3 text-xs text-muted-foreground">
            <a href="#essay" onClick={(e) => { e.preventDefault(); openEssay(); }} className="hover:text-foreground">Essay</a>
            <a href="#dossier" className="hover:text-foreground">Photos</a>
            <a href={ESSAY_URL} target="_blank" rel="noopener noreferrer" className="hidden items-center gap-1 hover:text-foreground sm:inline-flex">
              Original <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 pb-6 pt-14 sm:pt-20">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><Sparkles className="h-3.5 w-3.5" /> An interactive reading</p>
        <h1 className="mt-4 font-display text-5xl font-semibold leading-none sm:text-6xl">Why Zuzone</h1>
        <p className="mt-5 max-w-2xl font-display text-2xl leading-snug text-foreground sm:text-3xl">
          Zuzalu began as an experiment. What followed became an ecosystem.
        </p>
        <div className="mt-4 max-w-2xl space-y-3 text-lg leading-relaxed text-muted-foreground">
          <p>
            In spring 2023, around two hundred people came together in Montenegro for two months to experiment with new
            ways of living, building and coordinating.
          </p>
          <p>
            Since then, independent communities, pop-up cities and permanent hubs have carried those ideas in different
            directions around the world.
          </p>
          <p>
            Zuzone helps connect them, creating a coordination layer where communities can share knowledge, collaborate
            and support one another while remaining independent. It gathers the values from those experiments and helps
            permanent hubs and pop-up cities sustain their projects.
          </p>
        </div>
        <p className="mt-4 max-w-2xl rounded-xl border border-border bg-muted/40 px-4 py-3 text-sm text-muted-foreground">
          Zuzone was not part of Zuzalu 2023. It is an independent project that came later, built for the communities
          that grew out of it.
        </p>

        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Zuzalu · Montenegro, 2023</p>
        <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat n={200} label="residents" />
          <Stat n={2} label="months, from March 25, 2023" />
          <Stat n={100} prefix="~" label="apartments, one off-season resort" />
          <Stat n={8} label="organisers by February (four in January)" />
        </div>
        <a href="#dossier" className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 hover:bg-muted">
          <span>
            <span className="block font-semibold">See what it looked like</span>
            <span className="block text-sm text-muted-foreground">Photos and video from Montenegro 2023, ZuConnect Istanbul and the Chiang Mai Archipelago, further down this page.</span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 rotate-90 text-primary" />
        </a>
      </section>

      <div id="essay" className="mx-auto max-w-3xl px-4 pt-6 scroll-mt-20">
        <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Part I · The argument</p>
          <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Why I Built Zuzalu, in eight parts</h2>
          {!essayOpen && (
            <ol className="mt-4 grid gap-x-6 gap-y-1.5 text-sm text-muted-foreground sm:grid-cols-2">
              {ESSAY_PARTS.map((t, i) => (
                <li key={t} className="flex gap-2"><span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, "0")}</span>{t}</li>
              ))}
            </ol>
          )}
          <button
            type="button"
            onClick={() => (essayOpen ? setEssayOpen(false) : openEssay())}
            aria-expanded={essayOpen}
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            {essayOpen ? "Collapse the argument" : "Read the argument"}
            <ChevronDown className={`h-4 w-4 transition-transform ${essayOpen ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {essayOpen && (
      <>

      <Section n="01" title="Places aren't fixed" lede="We treat cities as given: San Francisco means one culture and cost, Berlin another, and you pick your tradeoff. The essay's opening move is to ask whether an online tribe could instead materialise somewhere on purpose. The thinkers behind that question: Michel Maffesoli's tribes, David de Ugarte's phyles, Balaji Srinivasan's network state.">
        <div className="grid gap-3 sm:grid-cols-3">
          {[["The Time of the Tribes", "Maffesoli, 1988", "Modern people belong to overlapping tribes chosen by taste, not birth."], ["Phyles", "de Ugarte", "Online communities that grow an economy and then a place."], ["The Network State", "Srinivasan, 2022", "Start with a community, buy land later, seek recognition last."]].map(([t, a, d]) => (
            <div key={t} className="rounded-xl border border-border bg-card p-4"><p className="font-semibold">{t}</p><p className="text-xs text-muted-foreground">{a}</p><p className="mt-2 text-sm text-muted-foreground">{d}</p></div>
          ))}
        </div>
      </Section>

      <Section n="02" title="A tribe that is already distributed" lede="Most tech gravitates to one or two cities. Ethereum never did. Its foundation is Swiss, its second entity is in Singapore, its developers cluster in Berlin, client teams sit in Romania and Australia, layer-2 teams in India and China. It already materialises a few times a year through conferences, with no American visa or San Francisco rent required.">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <img src={mapUrl} alt="Map of where the Ethereum ecosystem lives" className="w-full" loading="lazy" />
          <div className="flex flex-wrap gap-2 p-3">
            {TRIBE.map((t) => <span key={t.name} className="rounded-full bg-muted px-3 py-1 text-xs"><span className="font-semibold">{t.name}</span> · {t.what}</span>)}
          </div>
        </div>
      </Section>

      <Section n="03" title="The gap between a house and a conference" lede="A hacker house holds a dozen people for months; a conference holds thousands for a week. One is deep and tiny, the other broad and shallow. Zuzalu's design target sits in the gap. Hover the points.">
        <SizeDurationChart />
        <div className="mt-4"><Quote q="a pop-up mini-city that houses two hundred people" ctx="describing the design target" /></div>
      </Section>

      <Section n="04" title="The recipe" lede="Planning started in January 2023 with four people and eight by February. The trick that made it possible: an existing resort, off-season, rented as one block of roughly a hundred apartments so the price fell. Invitations cascaded through about a dozen inviters plus application forms aimed at specific communities: Ethereum and zero-knowledge researchers, longevity and biotech, European rationalists, and people who study communities themselves.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat n={12} prefix="~" label="inviters cascading invitations" />
          <Stat n={15} prefix="$" label="food budget per person per day" />
          <Stat n={33} suffix="%" label="cap on any single nationality" />
          <Stat n={4} label="target communities, deliberately mixed" />
        </div>
      </Section>

      <Section n="05" title="Plan the scaffolding, let the rest emerge" lede="Only a thin core was organised centrally: food, identity, a venue, a way to book the room. Everything memorable grew on top of it. Click around the rings.">
        <Onion />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Quote q="A healthy lifestyle is also a technology" ctx="on treating daily habits as something to iterate" />
          <Quote q="No one even considered governing Zuzalu with a DAO" ctx="on what did not happen" />
        </div>
      </Section>

      <Section n="06" title="Diversity by design" lede="The one demographic rule was national: no country above a third of residents. Drag the slider to see why the line matters.">
        <DiversityRule />
      </Section>

      <Section n="07" title="The verdict" lede="Six months on, Vitalik graded the experiment against its own goals.">
        <Verdicts />
        <div className="mt-4"><Quote q="but a two-month stay is your life" ctx="contrasting it with a four-day conference" /></div>
      </Section>

      <Section n="08" title="Where does this go?" lede="The essay refuses the grandest framing and the smallest one. Its bet is a hybrid: part university, part monastery, part nomad hub, plus an incubator for technologies that come with a culture attached. Pick a rung.">
        <Ladder />
        <div className="mt-4"><Quote q="Would 'Zuzaluism' meet the same fate?" ctx="on movements that grow fast and then plateau as niches" /></div>
      </Section>
      </>
      )}

      <DossierSection />

      <section className="border-t border-border bg-card/60">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Epilogue</p>
          <h2 className="mt-1 font-display text-2xl font-semibold sm:text-3xl">Zuzalu became many</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            The essay ended without a next step. The ecosystem supplied one: not a single permanent city but dozens of pop-ups, each a few weeks to a few months, each run by a different crew. Zuzone came later, as an independent coordination layer between them{villageCount ? `: ${villageCount} villages and hubs so far` : ""}.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link to="/" className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">See the map <ArrowRight className="h-4 w-4" /></Link>
            <a href={ESSAY_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold hover:bg-muted">Read the essay <ExternalLink className="h-4 w-4" /></a>
          </div>
          <p className="mt-8 text-xs text-muted-foreground">Paraphrased from "Why I Built Zuzalu" by Vitalik Buterin, Palladium Magazine, 6 October 2023. Quotations are the author's.</p>
        </div>
      </section>
    </div>
  );
};

export default WhyZuzone;
