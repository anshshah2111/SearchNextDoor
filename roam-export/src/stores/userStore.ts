import { create } from "zustand";
import { getHeatMap, getStreak } from "@/lib/storage";

interface UserState {
  anonId: string | null;
  heatMap: Record<string, number>;
  streak: number;
  onboardingDone: boolean;

  init: () => void;
  setHeatMap: (tiles: Record<string, number>) => void;
  setStreak: (n: number) => void;
  setOnboardingDone: (done: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  anonId: null,
  heatMap: {},
  streak: 0,
  onboardingDone: false,

  init: () => {
    // Lazy import to avoid SSR issues
    import("@/lib/anon-id").then(({ getAnonId }) => {
      const anonId = getAnonId();
      import("@/lib/storage").then(({ isOnboardingDone }) => {
        set({
          anonId,
          heatMap: getHeatMap(),
          streak: getStreak(),
          onboardingDone: isOnboardingDone(),
        });
      });
    });
  },

  setHeatMap: (tiles) => set({ heatMap: tiles }),
  setStreak: (n) => set({ streak: n }),
  setOnboardingDone: (done) => set({ onboardingDone: done }),
}));
