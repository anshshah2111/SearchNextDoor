import { create } from "zustand";

interface WalkState {
  isWalking: boolean;
  isPaused: boolean;
  tileVisits: Record<string, number>;
  path: [number, number][];
  startedAt: number | null;
  lastTileVisitAt: Record<string, number>;
  distanceMeters: number;
  currentPosition: [number, number] | null;

  startWalk: () => void;
  pauseWalk: () => void;
  resumeWalk: () => void;
  endWalk: () => void;
  addPosition: (lat: number, lng: number) => void;
  visitTile: (tileId: string) => boolean; // returns true if actually incremented
  addDistance: (meters: number) => void;
  reset: () => void;
}

export const useWalkStore = create<WalkState>((set, get) => ({
  isWalking: false,
  isPaused: false,
  tileVisits: {},
  path: [],
  startedAt: null,
  lastTileVisitAt: {},
  distanceMeters: 0,
  currentPosition: null,

  startWalk: () =>
    set({
      isWalking: true,
      isPaused: false,
      tileVisits: {},
      path: [],
      startedAt: Date.now(),
      lastTileVisitAt: {},
      distanceMeters: 0,
    }),

  pauseWalk: () => set({ isPaused: true }),

  resumeWalk: () => set({ isPaused: false }),

  endWalk: () => set({ isWalking: false, isPaused: false }),

  addPosition: (lat, lng) =>
    set((state) => ({
      path: [...state.path, [lat, lng]],
      currentPosition: [lat, lng],
    })),

  visitTile: (tileId) => {
    const now = Date.now();
    const lastVisit = get().lastTileVisitAt[tileId];

    // Debounce: don't increment if same tile was visited within 30 seconds
    if (lastVisit && now - lastVisit < 30000) {
      return false;
    }

    set((state) => ({
      tileVisits: {
        ...state.tileVisits,
        [tileId]: (state.tileVisits[tileId] || 0) + 1,
      },
      lastTileVisitAt: {
        ...state.lastTileVisitAt,
        [tileId]: now,
      },
    }));
    return true;
  },

  addDistance: (meters) =>
    set((state) => ({
      distanceMeters: state.distanceMeters + meters,
    })),

  reset: () =>
    set({
      isWalking: false,
      isPaused: false,
      tileVisits: {},
      path: [],
      startedAt: null,
      lastTileVisitAt: {},
      distanceMeters: 0,
      currentPosition: null,
    }),
}));
