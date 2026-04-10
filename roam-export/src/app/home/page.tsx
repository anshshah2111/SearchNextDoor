"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import EchoBlob from "@/components/EchoBlob";
import { useUserStore } from "@/stores/userStore";
import { getHeatMap, getStreak } from "@/lib/storage";
import { latLngToTileId, getTilesInRadius } from "@/lib/tiles";

// Dynamic import for the map (no SSR — MapLibre needs window)
const FogMap = dynamic(() => import("@/components/FogMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a]" />,
});

export default function HomePage() {
  const router = useRouter();
  const [heatMap, setHeatMap] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    setHeatMap(getHeatMap());
    setStreak(getStreak());
  }, []);

  const handleLetsGo = () => {
    router.push("/walk");
  };

  // Debug: simulate 30 days of walks for demo footage
  const simulateWalks = useCallback(() => {
    const centerLat = 47.6553;
    const centerLng = -122.3035;
    const simulated: Record<string, number> = { ...heatMap };

    // Generate a few "routes" radiating from UW campus
    const routes = [
      { bearing: 0, distance: 1500 },
      { bearing: 45, distance: 1200 },
      { bearing: 90, distance: 2000 },
      { bearing: 135, distance: 800 },
      { bearing: 180, distance: 1800 },
      { bearing: 225, distance: 1000 },
      { bearing: 270, distance: 1600 },
      { bearing: 315, distance: 900 },
    ];

    for (const route of routes) {
      const steps = Math.floor(route.distance / 100);
      const bearingRad = (route.bearing * Math.PI) / 180;

      for (let i = 0; i < steps; i++) {
        const dist = (i * 100) / 111320;
        const lat =
          centerLat + dist * Math.cos(bearingRad) + (Math.random() - 0.5) * 0.001;
        const lng =
          centerLng +
          (dist * Math.sin(bearingRad)) /
            Math.cos((centerLat * Math.PI) / 180) +
          (Math.random() - 0.5) * 0.001;

        const tileId = latLngToTileId(lat, lng);
        // Simulate varying visit counts — routes closer to center get more visits
        const baseVisits = Math.max(1, Math.floor((steps - i) / 3));
        const visits = baseVisits + Math.floor(Math.random() * 8);
        simulated[tileId] = (simulated[tileId] || 0) + visits;
      }
    }

    // Also add some cluster tiles near campus with high visit counts
    const campusTiles = getTilesInRadius(centerLat, centerLng, 300);
    for (const tileId of campusTiles) {
      simulated[tileId] = (simulated[tileId] || 0) + 15 + Math.floor(Math.random() * 10);
    }

    setHeatMap(simulated);
    // Persist for demo purposes
    import("@/lib/storage").then(({ setHeatMap: save }) => save(simulated));
  }, [heatMap]);

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Full-screen fog map background */}
      <div className="absolute inset-0">
        <FogMap heatMap={heatMap} interactive={true} zoom={13} />
      </div>

      {/* Top bar — streak + brand */}
      <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 pb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-white/90 tracking-wide">
          Roam
        </h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 text-amber-400/80 text-sm">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            <span>{streak}</span>
          </div>
        )}
      </div>

      {/* Echo blob + Let's Go button — lower third */}
      <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-12">
        {/* Echo blob */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <EchoBlob state="idle" size={100} />
        </motion.div>

        {/* Let's Go button */}
        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleLetsGo}
          className="mt-6 px-10 py-4 bg-amber-500 text-black text-lg font-semibold rounded-full shadow-lg shadow-amber-500/25 hover:bg-amber-400 transition-colors"
        >
          Let&apos;s go
        </motion.button>

        {/* Debug button — small, tucked away */}
        <button
          onClick={simulateWalks}
          className="mt-4 text-xs text-gray-600 hover:text-gray-400 transition-colors"
        >
          Simulate 30 days
        </button>
      </div>
    </div>
  );
}
