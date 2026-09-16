import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, MapPin, Loader2, Globe, Link2, Calendar, Check, AlertCircle, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { VillageType } from "@/hooks/useVillages";
import { cn } from "@/lib/utils";
import { connectZupass, type ZupassSession } from "@/lib/zupass";
import { PUBLIC_SITE_URL } from "@/lib/publicSite";

interface WebsiteMetadata {
  title?: string;
  description?: string;
  favicon_url?: string;
  thumbnail_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  telegram_url?: string;
  start_date?: string;
  end_date?: string;
  dates_text?: string;
}

interface AddVillageFormProps {
  onVillageAdded?: () => void;
  /** With a label the trigger is a pill button ("+ Add a village") instead of a bare icon */
  label?: string;
}

export const AddVillageForm = ({ onVillageAdded, label }: AddVillageFormProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [zupass, setZupass] = useState<ZupassSession | null>(null);
  const [zupassConnecting, setZupassConnecting] = useState(false);
  const [zupassError, setZupassError] = useState<string | null>(null);
  const zupassHostRef = useRef<HTMLDivElement>(null);
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [locationName, setLocationName] = useState("");
  const [manualName, setManualName] = useState("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [isScrapingWebsite, setIsScrapingWebsite] = useState(false);
  const [websiteMetadata, setWebsiteMetadata] = useState<WebsiteMetadata | null>(null);

  const handleZupassConnect = async () => {
    if (!zupassHostRef.current) return;
    setZupassConnecting(true);
    setZupassError(null);
    try {
      const session = await connectZupass(zupassHostRef.current);
      setZupass(session);
    } catch (err) {
      console.error("Zupass connect failed", err);
      setZupassError(err instanceof Error ? err.message : "Could not connect to Zupass");
    } finally {
      setZupassConnecting(false);
    }
  };

  const resolveGoogleMapsUrl = async (url: string) => {
    if (!url.trim()) return;
    
    setIsResolving(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('resolve-google-maps', {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (data.success && data.data) {
        const place = data.data;
        if (place.coordinates) {
          setCoordinates(place.coordinates);
        }
        if (place.name) {
          setLocationName(place.name);
        }
        toast.success("Location found!");
      } else {
        toast.error(data.error || "Could not extract location from URL");
      }
    } catch (err) {
      console.error("Error resolving URL:", err);
      toast.error("Failed to resolve Google Maps URL");
    } finally {
      setIsResolving(false);
    }
  };

  const handleGoogleMapsUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setGoogleMapsUrl(url);
    
    // Auto-resolve when a Google Maps URL is pasted
    if (url.includes('google.com/maps') || url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps') || url.includes('map.kakao.com') || url.includes('map.kakao.co')) {
      resolveGoogleMapsUrl(url);
    }
  };

  const scrapeWebsiteMetadata = async (url: string) => {
    if (!url.trim()) return;
    
    setIsScrapingWebsite(true);
    setWebsiteMetadata(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-project-metadata', {
        body: { url: url.trim() },
      });

      if (error) throw error;

      if (data.success && data.data) {
        const metadata = data.data as WebsiteMetadata;
        setWebsiteMetadata(metadata);
        toast.success("Website info extracted!");
      } else {
        toast.error(data.error || "Could not extract website info");
      }
    } catch (err) {
      console.error("Error scraping website:", err);
      toast.error("Failed to fetch website info");
    } finally {
      setIsScrapingWebsite(false);
    }
  };

  const handleWebsiteUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setWebsiteUrl(url);
  };

  const handleWebsiteUrlBlur = () => {
    if (websiteUrl.trim() && !isScrapingWebsite) {
      scrapeWebsiteMetadata(websiteUrl);
    }
  };

  // Derive village name from metadata or manual input
  const getVillageName = (): string => {
    if (manualName.trim()) return manualName.trim();
    if (!websiteMetadata?.title) return "";
    // Clean up title (remove common suffixes)
    return websiteMetadata.title
      .replace(/\s*[-|–—]\s*(Home|Official|Website|Site).*$/i, '')
      .replace(/\s*\|\s*.*$/, '')
      .trim();
  };

  // Derive village type based on dates
  const getVillageType = (): VillageType => {
    if (websiteMetadata?.start_date && websiteMetadata?.end_date) {
      return "popup";
    }
    return "permanent";
  };

  // Format dates for display
  const getFormattedDates = (): string => {
    if (websiteMetadata?.start_date && websiteMetadata?.end_date) {
      try {
        const start = parseISO(websiteMetadata.start_date);
        const end = parseISO(websiteMetadata.end_date);
        return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
      } catch {
        return websiteMetadata.dates_text || "Dates found";
      }
    }
    return "Permanent";
  };

  const canSubmit = coordinates && getVillageName().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!coordinates) {
      toast.error("Please paste a valid Google Maps link");
      return;
    }

    const villageName = getVillageName();
    if (!villageName) {
      toast.error("Please enter a village name or paste a website");
      return;
    }

    setIsSubmitting(true);

    const villageType = getVillageType();
    const slug = villageName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const dates = getFormattedDates();

    // Format website URL
    let formattedWebsiteUrl = websiteUrl.trim();
    if (formattedWebsiteUrl && !formattedWebsiteUrl.startsWith('http')) {
      formattedWebsiteUrl = `https://${formattedWebsiteUrl}`;
    }

    if (!zupass) {
      setIsSubmitting(false);
      toast.error("Sign in with Zupass first");
      return;
    }

    const village = {
      id: slug,
      name: villageName,
      location: locationName || "Location",
      center: coordinates,
      dates,
      description: websiteMetadata?.description || `Welcome to ${villageName}`,
      created_by: user?.id || null,
      village_type: villageType,
      website_url: formattedWebsiteUrl || null,
      logo_url: websiteMetadata?.favicon_url || null,
      thumbnail_url: websiteMetadata?.thumbnail_url || null,
      twitter_url: websiteMetadata?.twitter_url || null,
      instagram_url: websiteMetadata?.instagram_url || null,
      telegram_url: websiteMetadata?.telegram_url || null,
    };

    try {
      // The signed POD binds this Zupass identity to this specific village id; the
      // edge worker verifies the signature server-side before inserting.
      const pod = await zupass.sign({
        zuzone: "add-village",
        village_id: slug,
        village_name: villageName,
        ts: Date.now(),
      });
      const res = await fetch(`${PUBLIC_SITE_URL}/api/villages`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pod, village }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setIsSubmitting(false);
        if (res.status === 409) toast.error("A village with this name already exists");
        else toast.error(body?.error || "Failed to create village");
        console.error("add village failed", res.status, body);
        return;
      }
    } catch (err) {
      setIsSubmitting(false);
      console.error("add village failed", err);
      toast.error(err instanceof Error && /reject|cancel|denied/i.test(err.message) ? "Zupass signing was cancelled" : "Failed to create village");
      return;
    }

    setIsSubmitting(false);

    toast.success(`Thanks! ${villageName} was submitted for review.`, {
      description: "It will appear on the map once the Zuzone team approves it.",
    });
    
    // Reset form
    setGoogleMapsUrl("");
    setWebsiteUrl("");
    setLocationName("");
    setManualName("");
    setCoordinates(null);
    setWebsiteMetadata(null);
    setOpen(false);
    
    onVillageAdded?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setZupassError(null);
    }
  };


  const hasSocials = websiteMetadata?.twitter_url || websiteMetadata?.instagram_url || websiteMetadata?.telegram_url;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {label ? (
          <Button variant="default" size="sm" className="h-9 gap-1.5 rounded-full px-4 font-semibold">
            <Plus className="h-4 w-4" /> {label}
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Plus className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Add Village</DialogTitle>
        </DialogHeader>
        {/* Host element for the Zupass connector iframe (renders its own modal dialog) */}
        <div ref={zupassHostRef} />
        {!zupass ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
              <p className="text-sm font-semibold flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-primary" /> Sign in with Zupass to add a village
              </p>
              <p className="text-xs text-muted-foreground">
                Everyone with a Zupass can add a new hub. After you submit it, the Zuzone team reviews and
                approves it before it appears on the map.
              </p>
              <p className="text-xs text-muted-foreground">
                Questions? DM{" "}
                <a href="https://x.com/zuzones" target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline">
                  Zuzone on X
                </a>
                .
              </p>
              {zupassError && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" /> {zupassError}
                </p>
              )}
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="button" variant="sage" className="flex-1" onClick={handleZupassConnect} disabled={zupassConnecting}>
                {zupassConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" /> Connecting…
                  </>
                ) : (
                  "Continue with Zupass"
                )}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center">
              No Zupass yet? Get one free at{" "}
              <a href="https://zupass.org" target="_blank" rel="noopener noreferrer" className="underline">
                zupass.org
              </a>
            </p>
          </div>
        ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Check className="h-3.5 w-3.5 text-primary" />
            Zupass connected · <span className="font-mono truncate max-w-[200px]">{zupass.publicKey}</span>
          </div>
          {/* Website URL field */}
          <div className="space-y-2">
            <Label htmlFor="websiteUrl" className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              Village Website
            </Label>
            <div className="relative">
              <Input
                id="websiteUrl"
                placeholder="Paste website link..."
                value={websiteUrl}
                onChange={handleWebsiteUrlChange}
                onBlur={handleWebsiteUrlBlur}
                disabled={isScrapingWebsite}
                className="pr-10"
              />
              {isScrapingWebsite && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {websiteMetadata && !isScrapingWebsite && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            
            {/* Extracted info preview */}
            {websiteMetadata && (
              <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
                <div className="flex items-center gap-2">
                  {websiteMetadata.favicon_url && (
                    <img 
                      src={websiteMetadata.favicon_url} 
                      alt="" 
                      className="h-5 w-5 rounded-sm"
                      onError={(e) => (e.currentTarget.style.display = 'none')}
                    />
                  )}
                  <span className="font-medium truncate">
                    {getVillageName() || "Village name"}
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className={cn(
                    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
                    getVillageType() === "popup" 
                      ? "bg-primary/10 text-primary" 
                      : "bg-muted text-muted-foreground"
                  )}>
                    <Calendar className="h-3 w-3" />
                    {getFormattedDates()}
                  </span>
                  
                  {hasSocials && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                      <Link2 className="h-3 w-3" />
                      Socials found
                    </span>
                  )}
                </div>
                
                {websiteMetadata.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {websiteMetadata.description}
                  </p>
                )}
              </div>
            )}

            {!websiteMetadata && !isScrapingWebsite && (
              <div className="space-y-2 pt-1">
                <Label htmlFor="manualName" className="text-xs text-muted-foreground">
                  No website? Enter village name manually
                </Label>
                <Input
                  id="manualName"
                  placeholder="Village name..."
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  maxLength={100}
                />
              </div>
            )}
          </div>


          {/* Google Maps URL field */}
          <div className="space-y-2">
            <Label htmlFor="googleMapsUrl" className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </Label>
            <div className="relative">
              <Input
                id="googleMapsUrl"
                placeholder="Paste Google Maps or Kakao Maps link..."
                value={googleMapsUrl}
                onChange={handleGoogleMapsUrlChange}
                disabled={isResolving}
                className="pr-10"
              />
              {isResolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              )}
              {coordinates && !isResolving && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Check className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
            {coordinates && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {locationName || `${coordinates[1].toFixed(4)}, ${coordinates[0].toFixed(4)}`}
              </p>
            )}
          </div>

          {/* Validation message */}
          {!canSubmit && (websiteUrl || googleMapsUrl) && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>
                {!coordinates && !getVillageName()
                  ? "Add a location and village name (or website) to continue"
                  : !coordinates
                    ? "Paste a Google Maps link for location"
                    : "Enter a village name or paste a website"}
              </span>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="sage" 
              className="flex-1" 
              disabled={isSubmitting || isResolving || isScrapingWebsite || !canSubmit}
            >
              {isSubmitting ? "Creating..." : "Create Village"}
            </Button>
          </div>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
