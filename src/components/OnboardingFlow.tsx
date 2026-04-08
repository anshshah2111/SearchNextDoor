"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EchoBlob from "./EchoBlob";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState(0);

  const screens = [
    // Screen 1: Your city is hidden in fog
    <motion.div
      key="fog"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        {/* Fog animation placeholder */}
        <div className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 flex items-center justify-center relative overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-transparent to-gray-700/50"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <span className="text-4xl opacity-30">🌫️</span>
        </div>
      </motion.div>
      <h1 className="text-2xl font-semibold text-white mb-3">
        Your city is hidden in fog
      </h1>
      <p className="text-gray-400 text-base max-w-xs">
        Every walk you take reveals a little more. Over time, your map becomes a
        record of everywhere you've been.
      </p>
    </motion.div>,

    // Screen 2: Meet Echo
    <motion.div
      key="echo"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="mb-8"
      >
        <EchoBlob state="idle" size={140} />
      </motion.div>
      <h1 className="text-2xl font-semibold text-white mb-3">Meet Echo</h1>
      <p className="text-gray-400 text-base max-w-xs">
        Your walking companion. Echo walks with you, chats, and notices things
        along the way. Like a friend in your pocket.
      </p>
    </motion.div>,

    // Screen 3: Location permission
    <motion.div
      key="location"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center h-full px-8 text-center"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center">
          <svg
            className="w-10 h-10 text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
            />
          </svg>
        </div>
      </motion.div>
      <h1 className="text-2xl font-semibold text-white mb-3">
        One thing before we go
      </h1>
      <p className="text-gray-400 text-base max-w-xs mb-8">
        Echo needs to see where you are so you can walk together. Your location
        stays on your device.
      </p>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          // Request location permission
          navigator.geolocation.getCurrentPosition(
            () => onComplete(),
            () => onComplete(), // Continue even if denied
            { enableHighAccuracy: true }
          );
        }}
        className="px-8 py-3 bg-amber-500 text-black font-medium rounded-full shadow-lg shadow-amber-500/20"
      >
        Allow location
      </motion.button>
      <button
        onClick={onComplete}
        className="mt-4 text-sm text-gray-500 hover:text-gray-400"
      >
        Skip for now
      </button>
    </motion.div>,
  ];

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] z-50 flex flex-col">
      <div className="flex-1 flex">
        <AnimatePresence mode="wait">{screens[step]}</AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="pb-12 px-8 flex items-center justify-between">
        {/* Dots */}
        <div className="flex gap-2">
          {screens.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-colors ${
                i === step ? "bg-amber-400" : "bg-gray-700"
              }`}
            />
          ))}
        </div>

        {/* Next button (not on last screen — it has its own CTA) */}
        {step < screens.length - 1 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setStep(step + 1)}
            className="px-6 py-2.5 bg-white/10 text-white rounded-full text-sm font-medium"
          >
            Next
          </motion.button>
        )}
      </div>
    </div>
  );
}
