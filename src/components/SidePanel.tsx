import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

export type PanelKey = "events" | "calendar" | "zupulse";

interface SidePanelProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

/**
 * The right-hand panel the header sections open into. On tablets and desktop it takes
 * 30% of the width and pushes the map aside (the map container flexes and resizes);
 * on phones it covers the screen. Escape closes it.
 */
export const SidePanel = ({ open, title, onClose, children }: SidePanelProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <aside
      aria-hidden={!open}
      className={`z-40 shrink-0 flex-col overflow-hidden border-border bg-background shadow-xl sm:flex sm:h-full
        ${open ? "fixed inset-0 flex sm:static sm:w-[30%] sm:min-w-[340px] sm:border-l" : "hidden sm:w-0 sm:min-w-0 sm:border-l-0"}`}
    >
      <div className="flex h-full w-full flex-col sm:w-[max(30vw,340px)]">
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3">
          <h2 className="font-display text-xl font-semibold text-foreground">{title}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close panel">
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{open && children}</div>
      </div>
    </aside>
  );
};
