"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import OnboardingFlow from "@/components/OnboardingFlow";
import { isOnboardingDone, markOnboardingDone } from "@/lib/storage";

export default function Page() {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    const done = isOnboardingDone();
    if (done) {
      router.replace("/home");
    } else {
      setShowOnboarding(true);
    }
  }, [router]);

  // Loading state
  if (showOnboarding === null) {
    return (
      <div className="h-full flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <OnboardingFlow
        onComplete={() => {
          markOnboardingDone();
          router.push("/home");
        }}
      />
    );
  }

  return null;
}
