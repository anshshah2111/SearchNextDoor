"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import SessionSummary from "@/components/SessionSummary";

function SummaryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const distance = parseInt(searchParams.get("distance") || "0", 10);
  const duration = parseInt(searchParams.get("duration") || "0", 10);
  const tiles = parseInt(searchParams.get("tiles") || "0", 10);
  const streak = parseInt(searchParams.get("streak") || "0", 10);

  // Echo's closing message
  const closingMessages = [
    "Good walk. Same time tomorrow?",
    "Glad we did that. See you next time.",
    "That was nice. Let's do it again soon.",
    "Good one. The city's a little more yours now.",
  ];
  const echoMessage =
    closingMessages[Math.floor(Math.random() * closingMessages.length)];

  return (
    <SessionSummary
      distanceMeters={distance}
      durationSeconds={duration}
      tilesRevealed={tiles}
      echoMessage={echoMessage}
      streak={streak}
      onDone={() => router.push("/home")}
    />
  );
}

export default function SummaryPage() {
  return (
    <Suspense
      fallback={
        <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
        </div>
      }
    >
      <SummaryContent />
    </Suspense>
  );
}
