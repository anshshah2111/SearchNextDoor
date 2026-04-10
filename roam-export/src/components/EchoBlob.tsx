"use client";

import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useCallback } from "react";

export type EchoState = "idle" | "speaking" | "listening" | "thinking";

interface EchoBlobProps {
  state: EchoState;
  size?: number;
  className?: string;
}

export default function EchoBlob({
  state = "idle",
  size = 120,
  className = "",
}: EchoBlobProps) {
  const controls = useAnimationControls();

  useEffect(() => {
    switch (state) {
      case "idle":
        controls.start({
          scale: [1, 1.05, 1],
          transition: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        });
        break;
      case "speaking":
        controls.start({
          scale: [1, 1.15, 0.95, 1.1, 1],
          transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: "easeInOut",
          },
        });
        break;
      case "listening":
        controls.start({
          scale: [1, 0.92, 1],
          transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          },
        });
        break;
      case "thinking":
        controls.start({
          scale: [1, 1.03, 0.97, 1],
          rotate: [0, 2, -2, 0],
          transition: {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          },
        });
        break;
    }
  }, [state, controls]);

  // Glow intensity changes with state
  const glowIntensity =
    state === "speaking"
      ? "0 0 60px rgba(244, 162, 97, 0.5), 0 0 120px rgba(244, 162, 97, 0.2)"
      : state === "listening"
        ? "0 0 40px rgba(244, 162, 97, 0.4), 0 0 80px rgba(244, 162, 97, 0.15)"
        : "0 0 30px rgba(244, 162, 97, 0.3), 0 0 60px rgba(244, 162, 97, 0.1)";

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <motion.div
        animate={controls}
        className="relative"
        style={{ width: size, height: size }}
      >
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: glowIntensity,
          }}
          transition={{ duration: 0.5 }}
          style={{
            background:
              "radial-gradient(circle, rgba(244, 162, 97, 0.08) 0%, transparent 70%)",
          }}
        />

        {/* Main blob */}
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full"
          style={{ filter: "url(#goo)" }}
        >
          <defs>
            {/* Gooey filter for organic blob shape */}
            <filter id="goo">
              <feGaussianBlur
                in="SourceGraphic"
                stdDeviation="6"
                result="blur"
              />
              <feColorMatrix
                in="blur"
                mode="matrix"
                values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                result="goo"
              />
            </filter>

            {/* Gradient for the blob */}
            <radialGradient id="blobGradient" cx="40%" cy="35%">
              <stop offset="0%" stopColor="#F4C77D" />
              <stop offset="50%" stopColor="#F4A261" />
              <stop offset="100%" stopColor="#E07640" />
            </radialGradient>
          </defs>

          {/* Core blob shape */}
          <motion.circle
            cx="100"
            cy="100"
            r="50"
            fill="url(#blobGradient)"
            animate={
              state === "speaking"
                ? { r: [50, 55, 48, 53, 50] }
                : state === "listening"
                  ? { r: [50, 46, 50] }
                  : { r: [50, 52, 50] }
            }
            transition={{
              duration: state === "speaking" ? 0.5 : 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Secondary orbiting blobs for organic feel */}
          <motion.circle
            cx="100"
            cy="100"
            r="12"
            fill="#F4A261"
            opacity={0.6}
            animate={{
              cx: [130, 120, 70, 80, 130],
              cy: [70, 130, 120, 70, 70],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.circle
            cx="100"
            cy="100"
            r="8"
            fill="#F4C77D"
            opacity={0.4}
            animate={{
              cx: [70, 80, 130, 120, 70],
              cy: [130, 70, 80, 130, 130],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </svg>

        {/* State indicator label */}
        {state === "listening" && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-amber-200/60 whitespace-nowrap"
          >
            listening...
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
