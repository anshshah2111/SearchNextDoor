/**
 * localStorage-based persistence for the MVP.
 * Replaces Supabase — zero signup, works offline, perfect for demo.
 */

import { getAnonId } from "./anon-id";

interface WalkRecord {
  id: string;
  startedAt: string;
  endedAt: string;
  distanceMeters: number;
  durationSeconds: number;
  tileVisits: Record<string, number>;
  path: [number, number][];
}

const WALKS_KEY = "roam_walks";
const HEAT_MAP_KEY = "roam_heat_map";
const STREAK_KEY = "roam_streak";
const LAST_WALK_DATE_KEY = "roam_last_walk_date";
const ONBOARDING_KEY = "roam_onboarding_done";

/** Get the master heat map: { tileId: totalVisitCount } */
export function getHeatMap(): Record<string, number> {
  if (typeof window === "undefined") return {};
  const raw = localStorage.getItem(`${HEAT_MAP_KEY}_${getAnonId()}`);
  return raw ? JSON.parse(raw) : {};
}

/** Save the master heat map */
export function setHeatMap(tiles: Record<string, number>): void {
  localStorage.setItem(`${HEAT_MAP_KEY}_${getAnonId()}`, JSON.stringify(tiles));
}

/** Merge walk tile visits into the master heat map */
export function mergeWalkIntoHeatMap(
  walkTileVisits: Record<string, number>
): Record<string, number> {
  const master = getHeatMap();
  for (const [tileId, count] of Object.entries(walkTileVisits)) {
    master[tileId] = (master[tileId] || 0) + count;
  }
  setHeatMap(master);
  return master;
}

/** Save a completed walk record */
export function saveWalk(walk: WalkRecord): void {
  const walks = getWalks();
  walks.push(walk);
  localStorage.setItem(`${WALKS_KEY}_${getAnonId()}`, JSON.stringify(walks));
}

/** Get all walk records */
export function getWalks(): WalkRecord[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(`${WALKS_KEY}_${getAnonId()}`);
  return raw ? JSON.parse(raw) : [];
}

/** Get and update streak */
export function getStreak(): number {
  if (typeof window === "undefined") return 0;
  const raw = localStorage.getItem(`${STREAK_KEY}_${getAnonId()}`);
  return raw ? parseInt(raw, 10) : 0;
}

export function incrementStreak(): number {
  const today = new Date().toDateString();
  const lastDate = localStorage.getItem(`${LAST_WALK_DATE_KEY}_${getAnonId()}`);

  let streak = getStreak();

  if (lastDate === today) {
    // Already walked today, no change
    return streak;
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastDate === yesterday.toDateString()) {
    // Consecutive day
    streak += 1;
  } else {
    // Streak broken or first walk
    streak = 1;
  }

  localStorage.setItem(`${STREAK_KEY}_${getAnonId()}`, streak.toString());
  localStorage.setItem(`${LAST_WALK_DATE_KEY}_${getAnonId()}`, today);
  return streak;
}

/** Onboarding state */
export function isOnboardingDone(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(ONBOARDING_KEY) === "true";
}

export function markOnboardingDone(): void {
  localStorage.setItem(ONBOARDING_KEY, "true");
}

export type { WalkRecord };
