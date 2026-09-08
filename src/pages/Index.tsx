import { GlobalMap } from "@/components/GlobalMap";

const MAPBOX_TOKEN = "REDACTED_MAPBOX_TOKEN";

const Index = () => {
  return (
    <main className="w-screen overflow-hidden bg-background" style={{ height: 'var(--viewport-height, 100dvh)' }}>
      <GlobalMap mapboxToken={MAPBOX_TOKEN} />
    </main>
  );
};

export default Index;
