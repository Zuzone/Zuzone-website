import { useMemo, useState } from "react";
import { ChevronUp, ChevronDown, Calendar, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface PopupVillage {
  id: string;
  name: string;
  logo: string;
  center: [number, number];
  dates: string;
  location: string;
  description: string;
  participants?: string;
  focus?: string;
}

interface PopupTimelineProps {
  villages: PopupVillage[];
  activeVillage: PopupVillage;
  isZoomedIn?: boolean;
  onVillageClick: (village: PopupVillage) => void;
  embedded?: boolean;
  /** Embedded only: time flows top→bottom, villages become vertical bars in packed lanes. */
  vertical?: boolean;
}

// Parse date string to get start and end dates
const parseDateRange = (dateStr: string): { start: Date | null; end: Date | null } => {
  if (dateStr.toLowerCase().includes("coming")) {
    return { start: null, end: null };
  }

  const months: { [key: string]: number } = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  try {
    const parts = dateStr.split(/[–-]/);
    if (parts.length !== 2) return { start: null, end: null };

    const startPart = parts[0].trim();
    const endPart = parts[1].trim();

    const yearMatch = endPart.match(/(\d{4})/);
    const endYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();

    const startMonthMatch = startPart.match(/([a-zA-Z]+)/);
    const startDayMatch = startPart.match(/(\d+)/);

    if (!startMonthMatch || !startDayMatch) return { start: null, end: null };

    const startMonth = months[startMonthMatch[1].toLowerCase().slice(0, 3)];
    const startDay = parseInt(startDayMatch[1]);

    const startYearMatch = startPart.match(/(\d{4})/);
    let startYear = startYearMatch ? parseInt(startYearMatch[1]) : endYear;

    const endMonthMatchEarly = endPart.match(/([a-zA-Z]+)/);
    const endMonthEarly = endMonthMatchEarly
      ? months[endMonthMatchEarly[1].toLowerCase().slice(0, 3)]
      : startMonth;
    if (!startYearMatch && endMonthEarly < startMonth) {
      startYear = endYear - 1;
    }

    const endMonthMatch = endPart.match(/([a-zA-Z]+)/);
    const endDayMatch = endPart.match(/(\d+)/);

    let endMonth = startMonth;
    let endDay = 28;

    if (endMonthMatch) {
      endMonth = months[endMonthMatch[1].toLowerCase().slice(0, 3)];
    }
    if (endDayMatch) {
      endDay = parseInt(endDayMatch[1]);
    }

    const start = new Date(startYear, startMonth, startDay);
    const end = new Date(endYear, endMonth, endDay);

    return { start, end };
  } catch {
    return { start: null, end: null };
  }
};

const getTimelinePosition = (
  start: Date,
  end: Date,
  timelineStart: Date,
  timelineEnd: Date
): { left: number; width: number } => {
  const totalDuration = timelineEnd.getTime() - timelineStart.getTime();

  const clampedStart = Math.max(start.getTime(), timelineStart.getTime());
  const clampedEnd = Math.min(end.getTime(), timelineEnd.getTime());

  const left = ((clampedStart - timelineStart.getTime()) / totalDuration) * 100;
  const width = ((clampedEnd - clampedStart) / totalDuration) * 100;

  return { left: Math.max(0, left), width: Math.max(1, Math.min(width, 100 - left)) };
};

const BAR_PALETTE = ["#41684D", "#8E9456", "#C4733B", "#3E5A74", "#5D4A6E", "#7D6330", "#4A5568", "#A0522D", "#2F6F73"];

/** Stable, brand-toned bar color per village id. */
const barColor = (id: string): string => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return BAR_PALETTE[h % BAR_PALETTE.length];
};

export const PopupTimeline = ({ villages, activeVillage, isZoomedIn = false, onVillageClick, embedded = false, vertical = false }: PopupTimelineProps) => {
  const isMobile = useIsMobile();
  const [isManuallyExpanded, setIsManuallyExpanded] = useState(true);

  const isExpanded = isZoomedIn ? false : isManuallyExpanded;

  const { timelineStart, timelineEnd, months, todayPosition } = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 12, 0);

    const monthLabels: { label: string; position: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const month = new Date(start.getFullYear(), start.getMonth() + i, 1);
      const position = (i / 12) * 100;
      monthLabels.push({
        label: month.toLocaleDateString("en-US", { month: "short" }),
        position,
      });
    }

    const totalDuration = end.getTime() - start.getTime();
    const todayPos = ((now.getTime() - start.getTime()) / totalDuration) * 100;

    return { timelineStart: start, timelineEnd: end, months: monthLabels, todayPosition: Math.max(0, Math.min(100, todayPos)) };
  }, []);

  const villagePositions = useMemo(() => {
    return villages
      .map((village) => {
        const { start, end } = parseDateRange(village.dates);
        if (!start || !end) return null;
        if (end < timelineStart || start > timelineEnd) return null;

        const position = getTimelinePosition(start, end, timelineStart, timelineEnd);
        return { village, position, start, end };
      })
      .filter(Boolean) as { village: PopupVillage; position: { left: number; width: number }; start: Date; end: Date }[];
  }, [villages, timelineStart, timelineEnd]);

  const rows = useMemo(() => {
    const result: typeof villagePositions[] = [];
    // Horizontal pills need ~60px of label; vertical bars only need a 40px thumb, so pack tighter.
    const MIN_VISUAL_WIDTH_PCT = vertical ? 4 : 6;
    const GAP_PCT = vertical ? 0.6 : 1.5;

    const sorted = [...villagePositions].sort(
      (a, b) => a.position.left - b.position.left
    );

    const effectiveBounds = (item: (typeof villagePositions)[number]) => {
      const width = Math.max(item.position.width, MIN_VISUAL_WIDTH_PCT);
      return {
        start: item.position.left - GAP_PCT,
        end: item.position.left + width + GAP_PCT,
      };
    };

    sorted.forEach((item) => {
      const itemBounds = effectiveBounds(item);
      let placed = false;
      for (const row of result) {
        const overlaps = row.some((existing) => {
          const existingBounds = effectiveBounds(existing);
          return !(
            itemBounds.end <= existingBounds.start ||
            itemBounds.start >= existingBounds.end
          );
        });

        if (!overlaps) {
          row.push(item);
          placed = true;
          break;
        }
      }

      if (!placed) {
        result.push([item]);
      }
    });

    return result;
  }, [villagePositions, vertical]);

  // ============ EMBEDDED VERTICAL LAYOUT (mobile bottom panel) ============
  // Time runs downward: one band per month, "Today" as a horizontal rule near the top,
  // villages as vertical bars packed into lanes (same packing as the horizontal Gantt).
  if (embedded && vertical) {
    const MONTH_PX = 84;
    const totalPx = MONTH_PX * 12;
    const laneCount = Math.max(1, rows.length);
    const barHeightPx = (widthPct: number) => (widthPct / 100) * totalPx;
    return (
      <div className="h-full w-full overflow-y-auto overflow-x-hidden px-3 pt-3 pb-4 overscroll-contain">
        <div className="relative flex gap-1.5" style={{ height: `${totalPx}px` }}>
          {/* Months (Y axis) */}
          <div className="relative w-8 shrink-0">
            {months.map((month, i) => (
              <div
                key={i}
                className="absolute left-0 pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                style={{ top: `${month.position}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          {/* Track: lanes fill the width, but never get narrower than a thumb */}
          <div className="relative min-w-0 flex-1 rounded-lg bg-secondary/30">
            {/* Today rule sits above the (possibly horizontally scrolling) lanes */}
            <div className="pointer-events-none absolute left-0 right-0 z-20 h-0.5 bg-primary" style={{ top: `${todayPosition}%` }}>
              <div className="absolute left-1 top-1/2 -translate-y-1/2 rounded bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground shadow-sm">
                Today
              </div>
            </div>
            <div className="h-full overflow-x-auto overflow-y-hidden">
            <div
              className="relative grid h-full"
              style={{ gridTemplateColumns: `repeat(${laneCount}, minmax(44px, 1fr))`, minWidth: `${laneCount * 44}px` }}
            >
              {/* Month bands */}
              <div className="pointer-events-none absolute inset-0">
                {months.map((_, i) => (
                  <div key={i} className="absolute left-0 right-0 border-t border-border/40" style={{ top: `${(i / 12) * 100}%` }} />
                ))}
              </div>

              {/* Lanes */}
              {rows.map((row, laneIndex) => (
                <div key={laneIndex} className="relative h-full">
                  {row.map(({ village, position }) => {
                    const px = barHeightPx(position.width);
                    const showLabel = px >= 64;
                    return (
                      <button
                        key={village.id}
                        onClick={() => onVillageClick(village)}
                        className={`absolute left-1 right-1 z-10 flex flex-col items-center gap-1 overflow-hidden rounded-xl px-0.5 py-1.5 text-white shadow-sm transition-all active:scale-95 ${
                          activeVillage.id === village.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                        }`}
                        style={{
                          top: `${position.left}%`,
                          height: `${position.width}%`,
                          minHeight: "40px",
                          backgroundColor: barColor(village.id),
                        }}
                        title={`${village.name}\n${village.dates}`}
                        aria-label={`${village.name}, ${village.dates}`}
                      >
                        <img src={village.logo} alt="" className="h-5 w-5 shrink-0 rounded-md bg-white/80 object-cover" onError={(e) => { e.currentTarget.src = "/placeholder.svg"; }} />
                        {showLabel && (
                          <span
                            className="min-h-0 flex-1 truncate text-[10px] font-medium leading-none"
                            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                          >
                            {village.name}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ EMBEDDED LAYOUT (used inside mobile bottom panel) ============
  if (embedded) {
    return (
      <div className="w-full overflow-y-auto px-3 pt-2 pb-3 max-h-full">
        <div className="relative mb-2 h-5">
          {months.map((month, i) => (
            <div
              key={i}
              className="absolute text-[10px] font-medium text-muted-foreground"
              style={{ left: `${month.position}%` }}
            >
              {month.label}
            </div>
          ))}
        </div>
        <div className="relative rounded-lg bg-secondary/30" style={{ minHeight: `${Math.max(1, rows.length) * 30 + 8}px` }}>
          <div className="absolute inset-0 flex">
            {months.map((_, i) => (
              <div key={i} className="h-full border-l border-border/30" style={{ width: `${100 / 12}%` }} />
            ))}
          </div>
          <div className="absolute top-0 z-10 h-full w-0.5 bg-primary" style={{ left: `${todayPosition}%` }}>
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground">
              Today
            </div>
          </div>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="relative h-7">
              {row.map(({ village, position }) => (
                <button
                  key={village.id}
                  onClick={() => onVillageClick(village)}
                  className={`absolute top-1 flex h-5 items-center gap-1 overflow-hidden rounded-full px-2 text-[11px] font-medium text-white transition-all active:scale-95 ${
                    activeVillage.id === village.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                  }`}
                  style={{
                    left: `${position.left}%`,
                    width: `${position.width}%`,
                    minWidth: "56px",
                    backgroundColor: barColor(village.id),
                  }}
                  title={`${village.name}\n${village.dates}`}
                >
                  <img src={village.logo} alt="" className="h-3.5 w-3.5 shrink-0 rounded-sm" />
                  <span className="truncate">{village.name}</span>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ============ MOBILE VERTICAL LAYOUT ============
  if (isMobile) {
    return (
      <div className="absolute right-0 top-20 bottom-16 z-20 pointer-events-none">
        {!isExpanded && !isZoomedIn && (
          <div className="pointer-events-auto pr-2 pt-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsManuallyExpanded(true)}
              className="gap-1 rounded-full bg-card/95 shadow-lg backdrop-blur-sm h-8 px-2"
            >
              <Calendar className="h-3.5 w-3.5" />
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {isExpanded && (
          <div className="pointer-events-auto h-full flex flex-col bg-background/95 backdrop-blur-sm border-l border-border shadow-xl rounded-l-lg pl-2 pr-1 py-2 w-[180px]">
            <div className="flex justify-end mb-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsManuallyExpanded(false)}
                className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground px-1"
              >
                <ChevronRight className="h-3 w-3" />
                Hide
              </Button>
            </div>

            {/* Vertical timeline: months column on left, village columns on right */}
            <div className="flex-1 flex gap-1 overflow-hidden">
              {/* Months column (Y axis) */}
              <div className="relative w-8 shrink-0">
                {months.map((month, i) => (
                  <div
                    key={i}
                    className="absolute text-[10px] font-medium text-muted-foreground"
                    style={{ top: `${month.position}%`, transform: 'translateY(-2px)' }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Track area */}
              <div
                className="relative flex-1 rounded-lg bg-secondary/30 overflow-x-auto"
                style={{ minWidth: 0 }}
              >
                <div
                  className="relative h-full"
                  style={{ minWidth: `${Math.max(1, rows.length) * 36}px` }}
                >
                  {/* Horizontal grid lines */}
                  <div className="absolute inset-0 flex flex-col">
                    {months.map((_, i) => (
                      <div
                        key={i}
                        className="w-full border-t border-border/30"
                        style={{ height: `${100 / 12}%` }}
                      />
                    ))}
                  </div>

                  {/* Today marker (horizontal line) */}
                  <div
                    className="absolute left-0 right-0 z-10 h-0.5 bg-primary"
                    style={{ top: `${todayPosition}%` }}
                  >
                    <div className="absolute -left-1 top-1/2 -translate-y-1/2 -translate-x-full whitespace-nowrap rounded bg-primary px-1 py-0.5 text-[9px] font-medium text-primary-foreground">
                      Today
                    </div>
                  </div>

                  {/* Village bars (vertical) */}
                  {rows.map((row, rowIndex) => (
                    <div
                      key={rowIndex}
                      className="absolute top-0 bottom-0"
                      style={{ left: `${rowIndex * 36}px`, width: '32px' }}
                    >
                      {row.map(({ village, position }) => (
                        <button
                          key={village.id}
                          onClick={() => onVillageClick(village)}
                          className={`absolute left-1 right-1 flex flex-col items-center justify-start gap-1 overflow-hidden rounded-full px-1 py-1.5 text-[10px] font-medium text-white transition-all active:scale-95 ${
                            activeVillage.id === village.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                          }`}
                          style={{
                            top: `${position.left}%`,
                            height: `${position.width}%`,
                            minHeight: "48px",
                            backgroundColor: barColor(village.id),
                          }}
                          title={`${village.name}\n${village.dates}`}
                        >
                          <img src={village.logo} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
                          <span
                            className="truncate text-[9px] leading-tight"
                            style={{
                              writingMode: 'vertical-rl',
                              transform: 'rotate(180deg)',
                              maxHeight: '70%',
                            }}
                          >
                            {village.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ============ DESKTOP HORIZONTAL LAYOUT ============
  return (
    <div className="absolute bottom-0 left-0 right-0 z-20">
      {!isExpanded && !isZoomedIn && (
        <div className="flex items-center justify-center px-4 pb-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsManuallyExpanded(true)}
            className="gap-2 rounded-full bg-card/95 shadow-lg backdrop-blur-sm"
          >
            <Calendar className="h-4 w-4" />
            <span>Show Timeline</span>
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isExpanded && (
        <div className="bg-gradient-to-t from-background/95 via-background/80 to-transparent px-4 pb-4 pt-8 md:px-6">
          <div className="mb-2 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsManuallyExpanded(false)}
              className="h-6 gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronDown className="h-3 w-3" />
              Hide
            </Button>
          </div>

          <div className="relative mb-2 h-6">
            {months.map((month, i) => (
              <div
                key={i}
                className="absolute text-xs font-medium text-muted-foreground"
                style={{ left: `${month.position}%` }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="relative rounded-lg bg-secondary/30 backdrop-blur-sm" style={{ minHeight: `${Math.max(1, rows.length) * 32 + 8}px` }}>
            <div className="absolute inset-0 flex">
              {months.map((_, i) => (
                <div
                  key={i}
                  className="h-full border-l border-border/30"
                  style={{ width: `${100 / 12}%` }}
                />
              ))}
            </div>

            <div
              className="absolute top-0 z-10 h-full w-0.5 bg-primary"
              style={{ left: `${todayPosition}%` }}
            >
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground">
                Today
              </div>
            </div>

            {rows.map((row, rowIndex) => (
              <div key={rowIndex} className="relative h-8">
                {row.map(({ village, position }) => (
                  <button
                    key={village.id}
                    onClick={() => onVillageClick(village)}
                    className={`absolute top-1 flex h-6 items-center gap-1 overflow-hidden rounded-full px-2 text-xs font-medium text-white transition-all hover:scale-105 hover:shadow-lg ${
                      activeVillage.id === village.id ? "ring-2 ring-primary ring-offset-1 ring-offset-background" : ""
                    }`}
                    style={{
                      left: `${position.left}%`,
                      width: `${position.width}%`,
                      minWidth: "60px",
                      backgroundColor: barColor(village.id),
                    }}
                    title={`${village.name}\n${village.dates}`}
                  >
                    <img src={village.logo} alt="" className="h-4 w-4 shrink-0 rounded-sm" />
                    <span className="truncate">{village.name}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
