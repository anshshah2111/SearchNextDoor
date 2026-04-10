"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import EchoBlob from "@/components/EchoBlob";
import VoiceController from "@/components/VoiceController";
import { useWalkStore } from "@/stores/walkStore";
import { latLngToTileId } from "@/lib/tiles";
import { distanceMeters } from "@/lib/geo";
import { getHeatMap, mergeWalkIntoHeatMap, saveWalk, incrementStreak } from "@/lib/storage";
import type { EchoState } from "@/components/EchoBlob";

const FogMap = dynamic(() => import("@/components/FogMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a]" />,
});

export default function WalkPage() {
  const router = useRouter();
  const [echoState, setEchoState] = useState<EchoState>("idle");
  const [combinedHeatMap, setCombinedHeatMap] = useState<Record<string, number>>({});
  const [echoMessage, setEchoMessage] = useState("");
  const [walkTime, setWalkTime] = useState(0);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [discoveryFired, setDiscoveryFired] = useState(false);
  const [checkinFired, setCheckinFired] = useState(false);

  const walkStore = useWalkStore();
  const watchIdRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const speakRef = useRef<((intent: string, msg?: string) => Promise<void>) | null>(null);
  const masterHeatMapRef = useRef<Record<string, number>>({});

  // Initialize walk
  useEffect(() => {
    masterHeatMapRef.current = getHeatMap();
    setCombinedHeatMap({ ...masterHeatMapRef.current });
    walkStore.startWalk();

    // Start timer
    timerRef.current = setInterval(() => {
      setWalkTime((t) => t + 1);
    }, 1000);

    // Start GPS tracking
    if (navigator.geolocation) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          const prevPos = walkStore.currentPosition;

          // Calculate distance from previous position
          if (prevPos) {
            const d = distanceMeters(prevPos[0], prevPos[1], latitude, longitude);
            if (d > 2 && d < 100) {
              // Filter GPS noise
              walkStore.addDistance(d);
            }
          }

          walkStore.addPosition(latitude, longitude);

          // Update tile visits
          const tileId = latLngToTileId(latitude, longitude);
          const isNew =
            !masterHeatMapRef.current[tileId] &&
            !walkStore.tileVisits[tileId];
          const wasIncremented = walkStore.visitTile(tileId);

          if (wasIncremented) {
            // Update combined heat map for rendering
            setCombinedHeatMap((prev) => ({
              ...prev,
              [tileId]: (prev[tileId] || 0) + 1,
            }));

            // Trigger discovery beat for new tiles
            if (isNew && !discoveryFired && speakRef.current) {
              setDiscoveryFired(true);
              speakRef.current("discovery");
              // Reset after 60 seconds to allow more discoveries
              setTimeout(() => setDiscoveryFired(false), 60000);
            }
          }
        },
        (err) => console.warn("GPS error:", err),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 }
      );
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check-in beat after 5 minutes of walking
  useEffect(() => {
    if (walkTime === 300 && !checkinFired && speakRef.current) {
      setCheckinFired(true);
      speakRef.current("checkin");
    }
  }, [walkTime, checkinFired]);

  // End walk handler
  const handleEndWalk = useCallback(async () => {
    // Stop GPS and timer
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }
    if (timerRef.current) clearInterval(timerRef.current);

    const store = useWalkStore.getState();

    // Fire closer beat
    if (speakRef.current) {
      await speakRef.current("closer");
    }

    // Save walk
    const walk = {
      id: crypto.randomUUID(),
      startedAt: new Date(store.startedAt || Date.now()).toISOString(),
      endedAt: new Date().toISOString(),
      distanceMeters: store.distanceMeters,
      durationSeconds: walkTime,
      tileVisits: store.tileVisits,
      path: store.path,
    };

    saveWalk(walk);
    mergeWalkIntoHeatMap(walk.tileVisits);

    // Update streak if walk was over 3 minutes
    let streak = 0;
    if (walkTime >= 180) {
      streak = incrementStreak();
    }

    store.endWalk();

    // Navigate to summary
    const newTiles = Object.keys(store.tileVisits).filter(
      (id) => !masterHeatMapRef.current[id]
    ).length;

    const params = new URLSearchParams({
      distance: Math.round(store.distanceMeters).toString(),
      duration: walkTime.toString(),
      tiles: newTiles.toString(),
      streak: streak.toString(),
    });

    router.push(`/summary?${params.toString()}`);
  }, [walkTime, router]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <VoiceController
      onStateChange={setEchoState}
      onEchoSpeak={setEchoMessage}
    >
      {({ speak, startListening, stopListening, isListening, isSpeaking }) => {
        // Store speak ref for beat triggers
        speakRef.current = speak as (intent: string, msg?: string) => Promise<void>;

        // Auto-greet on first render
        if (!hasGreeted) {
          setHasGreeted(true);
          // Small delay to let map load
          setTimeout(() => speak("opener"), 1500);
        }

        return (
          <div className="relative h-full w-full overflow-hidden">
            {/* Full-screen map */}
            <div className="absolute inset-0">
              <FogMap
                heatMap={combinedHeatMap}
                currentPosition={walkStore.currentPosition}
                walkPath={walkStore.path}
                interactive={true}
                zoom={16}
              />
            </div>

            {/* Top bar — time + distance */}
            <div className="absolute top-0 left-0 right-0 z-10 px-5 pt-12 pb-3">
              <div className="flex items-center justify-between">
                <div className="bg-black/60 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-4">
                  <span className="text-white text-sm font-mono">
                    {formatTime(walkTime)}
                  </span>
                  <span className="text-amber-400 text-sm font-mono">
                    {walkStore.distanceMeters < 1000
                      ? `${Math.round(walkStore.distanceMeters)}m`
                      : `${(walkStore.distanceMeters / 1000).toFixed(1)}km`}
                  </span>
                </div>
              </div>
            </div>

            {/* Echo message bubble */}
            {echoMessage && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute top-28 left-4 right-4 z-10"
              >
                <div className="bg-black/70 backdrop-blur-sm rounded-2xl px-5 py-3 max-w-sm mx-auto">
                  <p className="text-white/80 text-sm text-center">
                    {echoMessage}
                  </p>
                </div>
              </motion.div>
            )}

            {/* Bottom controls — Echo blob + mic + end */}
            <div className="absolute bottom-0 left-0 right-0 z-10 flex flex-col items-center pb-10">
              {/* Echo blob */}
              <EchoBlob state={echoState} size={80} className="mb-4" />

              <div className="flex items-center gap-6">
                {/* Mic button (push to talk) */}
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onTouchStart={startListening}
                  onTouchEnd={stopListening}
                  onMouseDown={startListening}
                  onMouseUp={stopListening}
                  className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                    isListening
                      ? "bg-amber-500 shadow-lg shadow-amber-500/30"
                      : "bg-white/10 backdrop-blur-sm"
                  }`}
                >
                  <svg
                    className={`w-6 h-6 ${isListening ? "text-black" : "text-white"}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </motion.button>

                {/* End walk button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEndWalk}
                  className="px-6 py-3 bg-white/10 backdrop-blur-sm text-white/80 rounded-full text-sm font-medium"
                >
                  End walk
                </motion.button>
              </div>
            </div>
          </div>
        );
      }}
    </VoiceController>
  );
}
