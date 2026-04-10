"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import EchoBlob from "@/components/EchoBlob";
import type { EchoState } from "@/components/EchoBlob";
import { latLngToTileId } from "@/lib/tiles";

const FogMap = dynamic(() => import("@/components/FogMap"), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a]" />,
});

// A real walking route through UW campus — actual coordinates
const UW_WALK_ROUTE: [number, number][] = [
  [47.6553, -122.3035], // Start: Red Square
  [47.6555, -122.3028],
  [47.6558, -122.3020],
  [47.6561, -122.3012], // Suzzallo Library
  [47.6564, -122.3004],
  [47.6567, -122.2996],
  [47.6570, -122.2988], // Allen Library
  [47.6572, -122.2980],
  [47.6570, -122.2972],
  [47.6567, -122.2965], // Drumheller Fountain
  [47.6563, -122.2958],
  [47.6559, -122.2952],
  [47.6555, -122.2948], // Rainier Vista
  [47.6551, -122.2944],
  [47.6547, -122.2940],
  [47.6543, -122.2938], // Near IMA
  [47.6539, -122.2942],
  [47.6536, -122.2948],
  [47.6533, -122.2955],
  [47.6530, -122.2962], // Heading south
  [47.6528, -122.2970],
  [47.6526, -122.2978],
  [47.6525, -122.2986],
  [47.6527, -122.2994], // Turning west
  [47.6530, -122.3002],
  [47.6533, -122.3010],
  [47.6536, -122.3018],
  [47.6540, -122.3024],
  [47.6544, -122.3028],
  [47.6548, -122.3032],
  [47.6553, -122.3035], // Back to Red Square
];

// Echo conversation beats timed to the walk
const CONVERSATION_BEATS: {
  triggerStep: number;
  echoState: EchoState;
  message: string;
  duration: number;
}[] = [
  {
    triggerStep: 0,
    echoState: "speaking",
    message: "Hey. Glad you're out here. Where are we headed today?",
    duration: 4000,
  },
  {
    triggerStep: 5,
    echoState: "speaking",
    message: "The light's nice right now. You notice that?",
    duration: 3500,
  },
  {
    triggerStep: 10,
    echoState: "speaking",
    message: "Oh — new street for us. What made you turn here?",
    duration: 3500,
  },
  {
    triggerStep: 16,
    echoState: "speaking",
    message: "What's the best thing you ate today?",
    duration: 3000,
  },
  {
    triggerStep: 22,
    echoState: "speaking",
    message: "I like this route. Feels different.",
    duration: 3000,
  },
  {
    triggerStep: 28,
    echoState: "speaking",
    message: "Good walk. Same time tomorrow?",
    duration: 3500,
  },
];

export default function DemoPage() {
  const [step, setStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [echoState, setEchoState] = useState<EchoState>("idle");
  const [echoMessage, setEchoMessage] = useState("");
  const [heatMap, setHeatMap] = useState<Record<string, number>>({});
  const [walkPath, setWalkPath] = useState<[number, number][]>([]);
  const [currentPos, setCurrentPos] = useState<[number, number] | null>(null);
  const [chatHistory, setChatHistory] = useState<
    { sender: "echo" | "user"; text: string }[]
  >([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulated user responses
  const USER_RESPONSES: Record<number, string> = {
    0: "Just... clearing my head, I think.",
    10: "Honestly? I don't know. My feet just went this way.",
    16: "A really good croissant from that place on the Ave.",
  };

  const advanceStep = useCallback(() => {
    setStep((prev) => {
      const next = prev + 1;
      if (next >= UW_WALK_ROUTE.length) {
        setIsPlaying(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
        return prev;
      }

      const pos = UW_WALK_ROUTE[next];
      setCurrentPos(pos);
      setWalkPath((p) => [...p, pos]);

      // Update heat map
      const tileId = latLngToTileId(pos[0], pos[1]);
      setHeatMap((h) => ({ ...h, [tileId]: (h[tileId] || 0) + 1 }));

      // Check conversation beats
      const beat = CONVERSATION_BEATS.find((b) => b.triggerStep === next);
      if (beat) {
        setEchoState(beat.echoState);
        setEchoMessage(beat.message);
        setChatHistory((h) => [...h, { sender: "echo", text: beat.message }]);

        // Add user response after Echo speaks
        const userResp = USER_RESPONSES[next];
        if (userResp) {
          setTimeout(() => {
            setChatHistory((h) => [
              ...h,
              { sender: "user", text: userResp },
            ]);
            setEchoState("listening");
            setTimeout(() => setEchoState("idle"), 1500);
          }, beat.duration - 500);
        } else {
          setTimeout(() => {
            setEchoState("idle");
            setEchoMessage("");
          }, beat.duration);
        }
      }

      return next;
    });
  }, []);

  const startDemo = useCallback(() => {
    // Reset
    setStep(0);
    setHeatMap({});
    setWalkPath([UW_WALK_ROUTE[0]]);
    setCurrentPos(UW_WALK_ROUTE[0]);
    setChatHistory([]);
    setEchoMessage("");
    setEchoState("idle");
    setIsPlaying(true);

    // Initial tile
    const tileId = latLngToTileId(UW_WALK_ROUTE[0][0], UW_WALK_ROUTE[0][1]);
    setHeatMap({ [tileId]: 1 });

    // Start walking
    intervalRef.current = setInterval(advanceStep, 1200);
  }, [advanceStep]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Auto scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  const progress =
    UW_WALK_ROUTE.length > 0
      ? Math.round((step / (UW_WALK_ROUTE.length - 1)) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-orange-500" />
          <span className="font-semibold">Roam</span>
          <span className="text-gray-600 text-sm ml-2">/ Interactive Demo</span>
        </a>
        <a
          href="/"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          &larr; Back to site
        </a>
      </div>

      {/* Main demo area */}
      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-[1fr,380px] gap-4 h-[calc(100vh-100px)]">
          {/* Map */}
          <div className="relative rounded-2xl overflow-hidden border border-white/[0.06] min-h-[400px]">
            <FogMap
              heatMap={heatMap}
              currentPosition={currentPos}
              walkPath={walkPath}
              center={[-122.2990, 47.6550]}
              zoom={15}
              interactive={true}
            />

            {/* Play button overlay */}
            {!isPlaying && step === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startDemo}
                  className="flex flex-col items-center gap-4"
                >
                  <div className="w-20 h-20 rounded-full bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                    <svg
                      className="w-8 h-8 text-black ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <span className="text-white font-medium text-lg">
                    Start the walk
                  </span>
                  <span className="text-gray-400 text-sm">
                    Watch Echo walk through UW campus
                  </span>
                </motion.button>
              </div>
            )}

            {/* Replay button */}
            {!isPlaying && step > 0 && (
              <div className="absolute bottom-4 left-4 z-10">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startDemo}
                  className="px-4 py-2 bg-amber-500 text-black text-sm font-medium rounded-full"
                >
                  Replay walk
                </motion.button>
              </div>
            )}

            {/* Progress bar */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 z-10 h-1 bg-white/10">
                <motion.div
                  className="h-full bg-amber-500"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            )}

            {/* Location label */}
            <div className="absolute top-4 left-4 z-10 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1.5 text-xs text-gray-300">
              UW Seattle Campus
            </div>
          </div>

          {/* Echo sidebar */}
          <div className="flex flex-col rounded-2xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
            {/* Echo blob area */}
            <div className="flex flex-col items-center pt-8 pb-4 border-b border-white/[0.06]">
              <EchoBlob state={echoState} size={90} />
              <div className="mt-3 text-sm text-gray-500">
                {echoState === "speaking"
                  ? "Echo is talking..."
                  : echoState === "listening"
                    ? "Echo is listening..."
                    : echoState === "thinking"
                      ? "Echo is thinking..."
                      : "Echo is with you"}
              </div>
            </div>

            {/* Echo message bubble */}
            <AnimatePresence>
              {echoMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="px-4 py-3 bg-amber-500/5 border-b border-white/[0.06]"
                >
                  <p className="text-amber-200/80 text-sm text-center italic">
                    &ldquo;{echoMessage}&rdquo;
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Chat history */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-[200px]">
              {chatHistory.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-600 text-sm text-center">
                    {isPlaying
                      ? "Echo will start talking soon..."
                      : "Press play to start the demo walk"}
                  </p>
                </div>
              )}
              {chatHistory.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.sender === "echo"
                        ? "bg-white/[0.06] text-gray-200 rounded-bl-sm"
                        : "bg-amber-500/20 text-amber-100 rounded-br-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Mic button (visual only in demo) */}
            <div className="p-4 border-t border-white/[0.06] flex justify-center">
              <div className="w-12 h-12 rounded-full bg-white/[0.06] flex items-center justify-center text-gray-500">
                <svg
                  className="w-5 h-5"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
