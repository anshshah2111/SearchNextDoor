"use client";

import { motion } from "framer-motion";
import EchoBlob from "./EchoBlob";
import { formatDistance, formatDuration } from "@/lib/geo";

interface SessionSummaryProps {
  distanceMeters: number;
  durationSeconds: number;
  tilesRevealed: number;
  echoMessage: string;
  streak: number;
  onDone: () => void;
}

export default function SessionSummary({
  distanceMeters,
  durationSeconds,
  tilesRevealed,
  echoMessage,
  streak,
  onDone,
}: SessionSummaryProps) {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-6 py-12">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center max-w-sm w-full"
      >
        {/* Echo blob */}
        <EchoBlob state="idle" size={80} className="mb-6" />

        {/* Echo's closing line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/80 text-lg text-center mb-10 italic"
        >
          &ldquo;{echoMessage}&rdquo;
        </motion.p>

        {/* Stats grid */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 w-full mb-10"
        >
          <StatCard label="Distance" value={formatDistance(distanceMeters)} />
          <StatCard
            label="Time"
            value={formatDuration(durationSeconds)}
          />
          <StatCard label="New tiles" value={tilesRevealed.toString()} />
        </motion.div>

        {/* Streak */}
        {streak > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.7 }}
            className="flex items-center gap-2 mb-10 text-amber-400/80"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                clipRule="evenodd"
              />
            </svg>
            <span className="text-sm font-medium">{streak} day streak</span>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex gap-3 w-full"
        >
          <button
            onClick={onDone}
            className="flex-1 py-3 bg-amber-500 text-black font-medium rounded-full"
          >
            Done
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/5 rounded-2xl p-4 text-center">
      <div className="text-white text-xl font-semibold">{value}</div>
      <div className="text-gray-500 text-xs mt-1">{label}</div>
    </div>
  );
}
