import { GlobalMap } from "@/components/GlobalMap";
import { MAPBOX_TOKEN } from "@/lib/mapbox";


const Index = () => {
  return (
    <main className="w-screen overflow-hidden bg-background" style={{ height: 'var(--viewport-height, 100dvh)' }}>
      <GlobalMap mapboxToken={MAPBOX_TOKEN} />
    </main>
  );
};

export default Index;
