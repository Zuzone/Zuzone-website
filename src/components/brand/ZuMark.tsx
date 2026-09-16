/**
 * The Zu symbol from the September 2026 identity: twelve dots on a ring (one per month), one
 * lime marker on the active position, and "Zu" set in Cormorant inside. The lime dot replaces
 * a regular dot; it never becomes a thirteenth point.
 *
 * Colour comes from CSS `color` (forest on cream, cream on forest); lime is fixed by the brand.
 * The brand book asks for the full ring at 64px or taller; below that use plain "Zu" text.
 */
export const ZU_FOREST = "#1F4D3A";
export const ZU_CREAM = "#FAF6EC";
export const ZU_LIME = "#C4D63E";

const CENTER = 180;
const RADIUS = 137;
const DOTS = Array.from({ length: 12 }, (_, i) => {
  const a = ((-90 + 30 * i) * Math.PI) / 180;
  return [CENTER + RADIUS * Math.cos(a), CENTER + RADIUS * Math.sin(a)] as const;
});

// Glyph outlines of "Zu" (Cormorant, medium), as delivered in the brand book
const Z_PATH = "M57 13 438 600Q441 605 440.5 606.5Q440 608 433 608Q347 608 288.0 606.5Q229 605 191.5 599.0Q154 593 131.0 580.0Q108 567 93.5 546.0Q79 525 66 491Q65 489 59.0 490.0Q53 491 54 494L94 655Q95 657 101.0 656.0Q107 655 106 653Q103 635 114.0 630.0Q125 625 163 625Q223 625 310.0 625.0Q397 625 528 625Q533 625 535.0 620.5Q537 616 535 612L158 27Q154 22 155.0 20.5Q156 19 163 19Q241 19 302.5 19.0Q364 19 401 19Q444 19 475.0 33.0Q506 47 526.0 74.5Q546 102 553 140Q554 143 559.0 143.0Q564 143 564 140L550 8Q550 5 548.0 1.5Q546 -2 541 -2Q467 -1 384.5 -0.5Q302 0 219.5 0.0Q137 0 62 0Q58 0 56.0 4.5Q54 9 57 13Z";
const U_PATH = "M185 -9Q134 -9 104.5 23.5Q75 56 75 114V265Q75 303 68.5 320.0Q62 337 45 337Q32 337 14 328Q10 326 7.5 332.0Q5 338 9 339L127 394Q129 395 131 395Q135 395 139.0 392.0Q143 389 143 385V152Q143 94 163.5 66.5Q184 39 226 39Q262 39 297.5 60.0Q333 81 358 115L363 104Q321 48 277.5 19.5Q234 -9 185 -9ZM407 385V110Q407 76 414.5 61.0Q422 46 440 46Q449 46 460.5 49.5Q472 53 489 60Q493 62 495.5 56.5Q498 51 495 49L371 -10Q369 -11 366 -11Q358 -11 348.5 11.5Q339 34 339 76V265Q339 303 332.0 320.0Q325 337 309 337Q296 337 277 328Q274 326 271.5 332.0Q269 338 273 339L391 394Q393 395 395 395Q398 395 402.5 392.0Q407 389 407 385Z";

interface ZuMarkProps {
  /** Which of the 12 positions carries the lime marker (0 = top, clockwise) */
  active?: number;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

export function ZuMark({ active = 0, className, style, title = "Zu" }: ZuMarkProps) {
  const pos = ((active % 12) + 12) % 12;
  return (
    <svg viewBox="0 0 360 360" role="img" aria-label={title} className={className} style={style} fill="currentColor">
      {DOTS.map(([cx, cy], i) => (
        <circle
          key={i}
          cx={cx.toFixed(3)}
          cy={cy.toFixed(3)}
          r={i === pos ? 17 : 8}
          fill={i === pos ? ZU_LIME : "currentColor"}
          style={{ transition: "r 220ms ease-out, fill 220ms ease-out" }}
        />
      ))}
      <path d={Z_PATH} transform="translate(107.730 218) scale(0.132 -0.132)" />
      <path d={U_PATH} transform="translate(186.666 218) scale(0.132 -0.132)" />
    </svg>
  );
}
