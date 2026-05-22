import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Loader2, Settings, Calendar, Building2, ScrollText, ChevronUp, ChevronDown, Menu, X as XIcon, ChevronsDown, ChevronsUp, BarChart3, LayoutList } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { EventsDialog } from "@/components/EventsDialog";
import { ZuletterDialog } from "@/components/ZuletterDialog";
import { useVillages, Village, VillageType } from "@/hooks/useVillages";
import { useNavigate } from "react-router-dom";
import { AddVillageForm } from "@/components/villages/AddVillageForm";

import { NotificationBell } from "@/components/notifications/NotificationBell";
import { PopupTimeline } from "@/components/PopupTimeline";

import { useAuth } from "@/hooks/useAuth";
import { useUserCurrentVillage } from "@/hooks/useUserCurrentVillage";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ManifestoDialog } from "@/components/ManifestoDialog";
import { useIsMobile } from "@/hooks/use-mobile";


const ADMIN_USER_IDS = [
  "9807c494-ba07-4438-9a89-07ac13334e78", // dev
  "b015441b-3bb4-4150-94e6-d8be048035bb", // booga
];
const MUSHANGHAI_CENTER: [number, number] = [121.3136, 31.20488];
const MONTENEGRO_CENTER: [number, number] = [19.3744, 42.7087];
const DEFAULT_CENTER: [number, number] = MONTENEGRO_CENTER;
const DEFAULT_ZOOM = 1.4;
const FEATURED_VILLAGE_ID = "renaissance-village";
const FEATURED_VILLAGE_ZOOM = 8;

// Symmetric padding so the globe stays centered in the viewport
const MAP_PADDING = { top: 0, bottom: 0, left: 0, right: 0 };

interface GlobalMapProps {
  mapboxToken: string;
}

export const GlobalMap = ({ mapboxToken }: GlobalMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const clusterMarkersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const navigate = useNavigate();

  const { villages, loading: villagesLoading } = useVillages();
  const { user } = useAuth();
  const { currentVillage } = useUserCurrentVillage(user?.id, villages);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"gantt" | "list">("gantt");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [initialCenterSet, setInitialCenterSet] = useState(false);
  const [manifestoOpen, setManifestoOpen] = useState(false);
  const [eventsOpen, setEventsOpen] = useState(false);
  const [zuletterOpen, setZuletterOpen] = useState(false);
  const [panelCollapsed, setPanelCollapsed] = useState(false);
  const anyDialogOpen = manifestoOpen || eventsOpen || zuletterOpen;

  const isAdmin = user?.id ? ADMIN_USER_IDS.includes(user.id) : false;
  const isMobile = useIsMobile();

  // Parse popup dates string -> { start, end } (best effort)
  const parsePopupDates = useCallback((dateStr?: string | null): { start: number; end: number } | null => {
    if (!dateStr) return null;
    const lower = dateStr.toLowerCase();
    if (lower.includes('coming') || lower.includes('permanent')) return null;
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    try {
      const parts = dateStr.split(/[–-]/);
      const startPart = parts[0].trim();
      const endPart = (parts[1] || parts[0]).trim();
      const yearMatch = (endPart.match(/(\d{4})/) || startPart.match(/(\d{4})/));
      const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const startMonth = startPart.match(/([a-zA-Z]+)/);
      const startDay = startPart.match(/(\d+)/);
      const endMonth = endPart.match(/([a-zA-Z]+)/);
      const endDay = endPart.match(/(\d+)/);
      const sM = startMonth ? months[startMonth[1].toLowerCase().slice(0,3)] : (endMonth ? months[endMonth[1].toLowerCase().slice(0,3)] : 0);
      const eM = endMonth ? months[endMonth[1].toLowerCase().slice(0,3)] : sM;
      if (sM === undefined || eM === undefined) return null;
      const sD = startDay ? parseInt(startDay[1]) : 1;
      const eD = endDay ? parseInt(endDay[1]) : 28;
      return { start: new Date(year, sM, sD).getTime(), end: new Date(year, eM, eD).getTime() };
    } catch {
      return null;
    }
  }, []);

  // Sorted list of all villages: popups (ongoing → upcoming → past), then permanent
  const filteredVillages = useMemo(() => {
    const now = Date.now();
    const popups = villages.filter(v => v.village_type === 'popup');
    const permanent = villages.filter(v => v.village_type !== 'popup');
    const ranked = popups.map(v => {
      const d = parsePopupDates(v.dates);
      let bucket = 3;
      let key = 0;
      if (d) {
        if (d.start <= now && d.end >= now) { bucket = 0; key = d.end; }
        else if (d.start > now) { bucket = 1; key = d.start; }
        else { bucket = 2; key = -d.end; }
      }
      return { v, bucket, key };
    });
    ranked.sort((a, b) => a.bucket - b.bucket || a.key - b.key);
    return [...ranked.map(r => r.v), ...permanent];
  }, [villages, parsePopupDates]);

  // All villages shown on the map (popups + permanent merged)
  const mapVillages = useMemo(() => villages, [villages]);


  // Re-sort every minute so the list stays fresh as time advances
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60_000);
    return () => clearInterval(id);
  }, []);


  // Initialize map
  useEffect(() => {
    if (map.current || !mapContainer.current || !mapboxToken) return;

    mapboxgl.accessToken = mapboxToken;

    try {
      const m = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        projection: { name: 'globe' } as any,
      });

      // Apply padding to visually center the map within the visible area
      m.setPadding(MAP_PADDING);

      map.current = m;

      m.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

      m.on('error', (e) => {
        if (e.error && e.error.message.includes('WebGL')) {
          setMapError(e.error.message);
        }
      });

      if (m.isStyleLoaded()) {
        setMapReady(true);
      } else {
        m.once("load", () => {
          setMapReady(true);
        });
      }
    } catch (e: any) {
      console.error("GlobalMap: Mapbox initialization error", e);
      setMapError(e.message || "Failed to load map");
    }

    return () => {
      setMapReady(false);
      setInitialCenterSet(false);
      clusterMarkersRef.current.forEach((marker) => marker.remove());
      clusterMarkersRef.current.clear();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  // Keep the default view centered on Montenegro at the default zoom (no auto fly-to).


  // Get village route slug - all villages use /:id format now
  const getVillageRoute = (village: Village | { id: string }) => {
    return `/${village.id}`;
  };

  // Transform villages for PopupTimeline format (only popup villages)
  const timelineVillages = useMemo(() => {
    return villages
      .filter(v => v.village_type === 'popup')
      .map((v) => ({
        id: v.id,
        name: v.name,
        logo: v.logo_url || '/placeholder.svg',
        center: v.center as [number, number],
        dates: v.dates,
        location: v.location,
        description: v.description,
        participants: v.participants || undefined,
        focus: v.focus || undefined,
      }));
  }, [villages]);

  const activeVillage = timelineVillages[0] || {
    id: "",
    name: "",
    logo: "",
    center: [0, 0] as [number, number],
    dates: "",
    location: "",
    description: "",
  };

  const handleTimelineVillageClick = (village: { id: string }) => {
    const route = getVillageRoute(village);
    navigate(route);
  };

  // Truncate text to a maximum length
  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Calculate marker scale based on zoom level
  const getMarkerScale = useCallback((zoom: number) => {
    // Scale markers with zoom: smaller when zoomed out, larger when zoomed in
    const minZoom = 1;
    const maxZoom = 8;
    const minScale = 0.5;
    const maxScale = 1.0;
    const clampedZoom = Math.max(minZoom, Math.min(maxZoom, zoom));
    return minScale + (maxScale - minScale) * ((clampedZoom - minZoom) / (maxZoom - minZoom));
  }, []);

  // Update marker scales based on current zoom
  const updateMarkerScales = useCallback(() => {
    if (!map.current) return;
    const zoom = map.current.getZoom();
    const scale = getMarkerScale(zoom);
    clusterMarkersRef.current.forEach((marker) => {
      const el = marker.getElement();
      const scaleWrapper = el.querySelector('.village-marker-scale') as HTMLElement | null;
      if (scaleWrapper) {
        scaleWrapper.style.transform = `scale(${scale})`;
        scaleWrapper.style.transformOrigin = 'bottom center';
      }
    });
  }, [getMarkerScale]);

  // Detect if a popup village's end date is in the past
  const isVillagePast = useCallback((village: Village): boolean => {
    if (village.village_type !== 'popup' || !village.dates) return false;
    const dateStr = village.dates;
    if (dateStr.toLowerCase().includes('coming') || dateStr.toLowerCase().includes('permanent')) return false;
    const months: Record<string, number> = { jan:0,feb:1,mar:2,apr:3,may:4,jun:5,jul:6,aug:7,sep:8,oct:9,nov:10,dec:11 };
    try {
      const parts = dateStr.split(/[–-]/);
      const endPart = (parts[1] || parts[0]).trim();
      const yearMatch = endPart.match(/(\d{4})/);
      const endYear = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear();
      const endMonthMatch = endPart.match(/([a-zA-Z]+)/);
      const endDayMatch = endPart.match(/(\d+)/);
      const endMonth = endMonthMatch ? months[endMonthMatch[1].toLowerCase().slice(0,3)] : 11;
      const endDay = endDayMatch ? parseInt(endDayMatch[1]) : 28;
      const end = new Date(endYear, endMonth, endDay);
      return end.getTime() < Date.now();
    } catch {
      return false;
    }
  }, []);

  // Create village markers
  const createVillageMarkers = useCallback(() => {
    if (!map.current || mapVillages.length === 0) return;

    clusterMarkersRef.current.forEach((marker) => marker.remove());
    clusterMarkersRef.current.clear();

    const currentZoom = map.current.getZoom();
    const initialScale = getMarkerScale(currentZoom);

    mapVillages.forEach((village, index) => {
      const isPast = isVillagePast(village);
      const isFeaturedVillage = village.id === FEATURED_VILLAGE_ID;
      const el = document.createElement("div");
      el.className = "village-marker";
      el.style.zIndex = isFeaturedVillage ? "900" : String(10 + index);
      el.style.transition = 'opacity 0.2s ease-out';
      el.style.opacity = isPast ? '0.5' : '1';

      const truncatedLocation = truncateText(village.location, 20);
      const logoSrc = village.logo_url || '/placeholder.svg';

      // Structure: pointer arrow at bottom center, pill above it
      el.innerHTML = `
        <div class="village-marker-scale" style="
          display: flex;
          flex-direction: column;
          align-items: center;
          transform: scale(${initialScale});
          transform-origin: bottom center;
        ">
          <div class="village-marker-pill" style="
            display: flex;
            align-items: center;
            gap: 8px;
            background: ${isFeaturedVillage ? 'hsl(var(--background))' : 'rgba(250, 248, 245, 0.97)'};
            padding: 8px 12px 8px 8px;
            border-radius: 24px;
            border: ${isFeaturedVillage ? '2px solid hsl(var(--primary))' : '0'};
            box-shadow: ${isFeaturedVillage ? '0 8px 28px hsl(var(--primary) / 0.32)' : '0 4px 16px rgba(0,0,0,0.15)'};
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            max-width: ${isFeaturedVillage ? '240px' : '200px'};
          ">
            <img 
              src="${logoSrc}" 
              alt="${village.name}" 
              style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; flex-shrink: 0; background: ${isFeaturedVillage ? 'hsl(var(--primary))' : 'transparent'};"
              onerror="this.onerror=null; this.src='/placeholder.svg';"
            />
            <div style="display: flex; flex-direction: column; line-height: 1.2; min-width: 0; overflow: hidden;">
              <span style="font-weight: 600; font-size: 12px; color: #333; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${village.name}</span>
              <span style="font-size: 10px; color: #666; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${truncatedLocation}</span>
            </div>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 8px solid ${isFeaturedVillage ? 'hsl(var(--primary))' : 'rgba(250, 248, 245, 0.97)'};
            margin-top: -1px;
          "></div>
        </div>
      `;

      el.addEventListener("mouseenter", () => {
        el.style.zIndex = "1000";
        const pill = el.querySelector('.village-marker-pill') as HTMLElement;
        if (pill) {
          pill.style.transform = "scale(1.05)";
          pill.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
        }
      });

      el.addEventListener("mouseleave", () => {
        el.style.zIndex = isFeaturedVillage ? "900" : String(10 + index);
        const pill = el.querySelector('.village-marker-pill') as HTMLElement;
        if (pill) {
          pill.style.transform = "scale(1)";
          pill.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
        }
      });

      el.addEventListener("click", () => {
        const route = getVillageRoute(village);
        navigate(route);
      });

      // Use 'bottom' anchor so the arrow tip points exactly at the coordinate
      const marker = new mapboxgl.Marker({
        element: el,
        anchor: 'bottom',
      })
        .setLngLat(village.center)
        .addTo(map.current!);

      clusterMarkersRef.current.set(village.id, marker);
    });
  }, [mapVillages, navigate, getMarkerScale, isVillagePast]);

  // Create markers when villages change
  useEffect(() => {
    if (mapReady) {
      createVillageMarkers();
    }
  }, [mapReady, mapVillages, createVillageMarkers]);


  // Listen to zoom changes to scale markers
  useEffect(() => {
    if (!map.current || !mapReady) return;
    const m = map.current;
    const onZoom = () => updateMarkerScales();
    m.on('zoom', onZoom);
    return () => { m.off('zoom', onZoom); };
  }, [mapReady, updateMarkerScales]);

  // Resize the map when mobile/desktop changes (container size shifts)
  useEffect(() => {
    if (!map.current) return;
    const t = setTimeout(() => map.current?.resize(), 50);
    return () => clearTimeout(t);
  }, [isMobile]);

  return (
    <div className="relative h-full w-full overflow-hidden" style={{ touchAction: 'manipulation', overscrollBehavior: 'contain' }}>
      <div ref={mapContainer} className="absolute inset-0" />

      {mapError && (
        <div className="absolute inset-0 z-0 flex items-center justify-center bg-muted/20">
          <img
            src={`https://api.mapbox.com/styles/v1/mapbox/light-v11/static/${DEFAULT_CENTER[0]},${DEFAULT_CENTER[1]},${DEFAULT_ZOOM}/1280x800?access_token=${mapboxToken}`}
            alt="Map fallback"
            className="h-full w-full object-cover grayscale opacity-50"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-4 bg-background/80 backdrop-blur-sm rounded-lg shadow-sm border border-border/50">
              <p className="text-xs font-medium text-muted-foreground">Interactive map unavailable (WebGL disabled)</p>
            </div>
          </div>
        </div>
      )}

      {villagesLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="font-body text-sm text-muted-foreground">Loading map...</p>
          </div>
        </div>
      )}

      {/* Header overlay */}
      <div className="absolute left-0 right-0 top-0 z-10 pointer-events-none bg-gradient-to-b from-background/90 via-background/60 to-transparent p-3 pb-12 sm:p-4 sm:pb-16 md:p-6 md:pb-20">
        <div className="flex items-start justify-between pointer-events-auto">
          <div className={`flex flex-col gap-1 w-fit transition-opacity ${anyDialogOpen ? 'invisible opacity-0' : ''}`}>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl font-semibold text-foreground sm:text-2xl md:text-3xl">
                Zuzone
              </h1>
              <AddVillageForm onVillageAdded={() => window.location.reload()} />
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => navigate("/admin")}
                  title="Admin"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="font-body text-xs text-muted-foreground sm:text-sm md:text-base">
              The home for permanent hubs and pop-up cities.
            </p>
          </div>

          {/* Manifesto + Events + Zuletter dialogs + Social links */}
          <ManifestoDialog open={manifestoOpen} onOpenChange={setManifestoOpen} />
          <EventsDialog open={eventsOpen} onOpenChange={setEventsOpen} />
          <ZuletterDialog open={zuletterOpen} onOpenChange={setZuletterOpen} />

          {/* Desktop: inline buttons */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              onClick={() => setManifestoOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <ScrollText className="h-4 w-4" />
              Manifesto
            </button>
            <button
              onClick={() => setEventsOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <Calendar className="h-4 w-4" />
              Events
            </button>
            <button
              onClick={() => setZuletterOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-muted/50 backdrop-blur-sm text-foreground font-semibold text-sm rounded-full shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              <ScrollText className="h-4 w-4" />
              Zuletter
            </button>
            <a
              href="https://x.com/zuzones"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-accent-yellow/20 to-accent-lime/20 backdrop-blur-sm text-foreground shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              aria-label="X (Twitter)"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com/vrnvrn/zu/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-accent-yellow/20 to-accent-lime/20 backdrop-blur-sm text-foreground shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
              aria-label="GitHub"
            >
              <svg className="h-4 w-4" viewBox="0 1 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          </div>

          {/* Mobile: hamburger menu */}
          <div className="sm:hidden">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-card/95 backdrop-blur-sm border border-border/50 shadow-md text-foreground"
                  aria-label="Menu"
                >
                  <Menu className="h-4 w-4" />
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-48 p-2">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => setManifestoOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"
                  >
                    <ScrollText className="h-4 w-4" /> Manifesto
                  </button>
                  <button
                    onClick={() => setEventsOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"
                  >
                    <Calendar className="h-4 w-4" /> Events
                  </button>
                  <button
                    onClick={() => setZuletterOpen(true)}
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted text-left"
                  >
                    <ScrollText className="h-4 w-4" /> Zuletter
                  </button>
                  <div className="h-px bg-border my-1" />
                  <a
                    href="https://x.com/zuzones"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                    X (Twitter)
                  </a>
                  <a
                    href="https://github.com/vrnvrn/zu/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 text-sm rounded-md hover:bg-muted"
                  >
                    <svg className="h-4 w-4" viewBox="0 1 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    GitHub
                  </a>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Info sidebar removed */}



      {/* Desktop: bottom panel with toggle + gantt/list */}
      {!isMobile && !anyDialogOpen && (
        <div className="absolute left-0 right-0 bottom-0 max-h-56 z-20 flex flex-col bg-card/95 backdrop-blur-sm border-t border-border/50 shadow-lg">
          <div className="flex items-center justify-center gap-2 px-3 pt-2 pb-1 border-b border-border/50 relative">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "gantt" | "list")}
              className="bg-card rounded-full border border-border/50 px-1 py-1"
            >
              <ToggleGroupItem value="gantt" className="gap-1 text-xs rounded-full px-3 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Gantt
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="gap-1 text-xs rounded-full px-3 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <LayoutList className="h-3.5 w-3.5" />
                List
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanelCollapsed(v => !v)}
              className="h-7 w-7 p-0 rounded-full"
              aria-label={panelCollapsed ? "Expand panel" : "Collapse panel"}
              title={panelCollapsed ? "Expand" : "Collapse"}
            >
              {panelCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>


          {!panelCollapsed && (
          <div className="flex-1 min-h-2 flex flex-col overflow-hidden">

            {viewMode === 'gantt' ? (
              timelineVillages.length > 0 ? (
                <PopupTimeline
                  villages={timelineVillages}
                  activeVillage={activeVillage}
                  isZoomedIn={false}
                  onVillageClick={handleTimelineVillageClick}
                  embedded
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No popup villages</p>
              )
            ) : filteredVillages.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
                {filteredVillages.map((village) => (
                  <button
                    key={village.id}
                    onClick={() => navigate(getVillageRoute(village))}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-background/60 hover:bg-secondary/60 transition-colors text-left"
                  >
                    <img
                      src={village.logo_url || '/placeholder.svg'}
                      alt={village.name}
                      className="h-9 w-9 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{village.name}</p>
                      <p className="text-xs text-muted-foreground truncate" title={village.location}>{village.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No villages</p>
            )}
          </div>
          )}
        </div>

      )}

      {/* Mobile: split-screen bottom panel with toggle + gantt/list */}
      {isMobile && (
        <div className="absolute left-0 right-0 bottom-0 max-h-[50%] z-30 flex flex-col bg-background border-t border-border shadow-xl">
          <div className="flex items-center justify-center gap-2 px-3 pt-2 pb-1 border-b border-border/50">
            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "gantt" | "list")}
              className="bg-card rounded-full border border-border/50 px-1 py-1"
            >
              <ToggleGroupItem value="gantt" className="gap-1 text-xs rounded-full px-3 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <BarChart3 className="h-3.5 w-3.5" />
                Gantt
              </ToggleGroupItem>
              <ToggleGroupItem value="list" className="gap-1 text-xs rounded-full px-3 py-1 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
                <LayoutList className="h-3.5 w-3.5" />
                List
              </ToggleGroupItem>
            </ToggleGroup>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPanelCollapsed(v => !v)}
              className="h-7 w-7 p-0 rounded-full"
              aria-label={panelCollapsed ? "Expand panel" : "Collapse panel"}
              title={panelCollapsed ? "Expand" : "Collapse"}
            >
              {panelCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          {!panelCollapsed && (
          <div className="flex-1 min-h-2 flex flex-col overflow-hidden">

            {viewMode === 'gantt' ? (
              timelineVillages.length > 0 ? (
                <PopupTimeline
                  villages={timelineVillages}
                  activeVillage={activeVillage}
                  isZoomedIn={false}
                  onVillageClick={handleTimelineVillageClick}
                  embedded
                />
              ) : (
                <p className="text-xs text-muted-foreground text-center py-6">No popup villages</p>
              )
            ) : filteredVillages.length > 0 ? (
              <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
                {filteredVillages.map((village) => (
                  <button
                    key={village.id}
                    onClick={() => navigate(getVillageRoute(village))}
                    className="w-full flex items-center gap-3 p-2 rounded-lg border border-border/50 bg-card hover:bg-secondary/60 transition-colors text-left"
                  >
                    <img
                      src={village.logo_url || '/placeholder.svg'}
                      alt={village.name}
                      className="h-9 w-9 rounded object-cover flex-shrink-0"
                      onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{village.name}</p>
                      <p className="text-xs text-muted-foreground truncate" title={village.location}>{village.location}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center py-6">No villages</p>
            )}
          </div>
          )}
        </div>

      )}
    </div>
  );
};
