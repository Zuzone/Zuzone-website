import { GlobalMap } from "@/components/GlobalMap";
import { ZuThread } from "@/components/ZuThread";

const MAPBOX_TOKEN = "REDACTED_MAPBOX_TOKEN";

const Index = () => {
  return (
    <div id="top" className="bg-background">
      <main className="relative w-screen overflow-hidden bg-background" style={{ height: 'var(--viewport-height, 100dvh)' }}>
        <GlobalMap mapboxToken={MAPBOX_TOKEN} />
      </main>
      <ZuThread />
    </div>
  );
};

export default Index;
