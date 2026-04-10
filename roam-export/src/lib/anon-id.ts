const ANON_ID_KEY = "roam_anon_id";

/** Get or create a persistent anonymous user ID */
export function getAnonId(): string {
  if (typeof window === "undefined") return "server";

  let id = localStorage.getItem(ANON_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ANON_ID_KEY, id);
  }
  return id;
}
