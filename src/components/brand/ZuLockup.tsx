import { useEffect, useMemo, useRef, useState } from "react";
import { ZuMark } from "./ZuMark";
import { lockupName } from "@/lib/lockupName";

/**
 * The living lockup from the brand book: the Zu symbol stays fixed, and every tick moves the
 * lime marker one position clockwise while the next name slides in beside it — "Zu Zone",
 * "Zu Afrique", "Zu Zanzalu", … through every listed village.
 *
 * Rules followed from the identity: symbol, baseline and word size stay fixed; the width is
 * reserved for the longest name so nothing shifts; it pauses for reduced-motion users, while
 * the tab is hidden and on hover; clicking the symbol advances by hand.
 */


interface ZuLockupProps {
  /** Village names; "Zone" is always shown first */
  names: string[];
  /** Milliseconds per tick */
  interval?: number;
  /** Ring height in px (the brand minimum is 64) */
  size?: number;
  /** Name font size in px */
  fontSize?: number;
  /** Below the brand's 64px minimum the ring is dropped and "Zu" is set as plain text */
  plain?: boolean;
  className?: string;
}

export function ZuLockup({ names, interval = 2400, size = 64, fontSize = 30, plain = false, className = "" }: ZuLockupProps) {
  const words = useMemo(() => {
    const seen = new Set<string>(["zone"]);
    const out = ["Zone"];
    for (const n of names) {
      const w = lockupName(n);
      if (!seen.has(w.toLowerCase())) {
        seen.add(w.toLowerCase());
        out.push(w);
      }
    }
    return out;
  }, [names]);

  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    reduced.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => { reduced.current = e.matches; };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (paused || words.length < 2) return;
    const id = window.setInterval(() => {
      if (document.hidden || reduced.current) return;
      setIndex((i) => i + 1);
    }, interval);
    return () => window.clearInterval(id);
  }, [paused, interval, words.length]);

  const position = index % 12;
  const word = words[index % words.length];

  // Baseline alignment: the Zu letters inside the ring sit on y = 218/360 of its height. With
  // line-height 1, Cormorant Garamond's baseline is ~0.824em below the top of the text box
  // (ascender 924, descender 276 per 1000 units), so the name is pushed down by the difference.
  const nameTop = plain ? 0 : Math.round(size * (218 / 360) - fontSize * 0.824);

  return (
    <span
      className={`inline-flex whitespace-nowrap leading-none ${plain ? "items-baseline" : "items-start"} ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label={`Zu ${word}`}
    >
      {plain ? (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 font-display font-medium text-current"
          style={{ fontSize, lineHeight: 1 }}
          aria-label="Show the next community"
        >
          Zu
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setIndex((i) => i + 1)}
          className="shrink-0 cursor-pointer border-0 bg-transparent p-0 text-current"
          aria-label="Show the next community"
          title="Next community"
          style={{ height: size, width: size, lineHeight: 0 }}
        >
          <ZuMark active={position} style={{ height: size, width: size, display: "block" }} title="Zu" />
        </button>
      )}
      {/* Every name is laid out in the same grid cell so the box is as wide as the longest one */}
      <span
        className="ml-[0.28em] inline-grid font-display font-medium"
        style={{ fontSize, lineHeight: 1, marginTop: nameTop, alignItems: "baseline" }}
        aria-live="polite"
      >
        {words.map((w) => (
          <span
            key={w}
            className={`col-start-1 row-start-1 ${w === word ? "zu-lockup-enter" : "invisible"}`}
            aria-hidden={w !== word}
          >
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
