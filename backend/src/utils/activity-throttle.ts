// src/utils/activity-throttle.ts
// Limite la fréquence des écritures `updateLastActivity`.
//
// L'ancien middleware d'auth écrivait en base à CHAQUE requête authentifiée
// (updateLastActivity), ce qui divisait ~par deux le débit des endpoints
// authentifiés (une lecture + une écriture par requête). Ici on ne réécrit au
// plus qu'une fois par intervalle et par utilisateur (par process).
//
// Réglage : LAST_ACTIVITY_THROTTLE_MIN (minutes, défaut 5).

const int = (v: string | undefined, d: number): number => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const INTERVAL_MS = int(process.env.LAST_ACTIVITY_THROTTLE_MIN, 5) * 60 * 1000;

// userId → dernier instant d'écriture. Borné pour éviter une croissance mémoire.
const lastWrite = new Map<string, number>();
const MAX_ENTRIES = 50_000;

/**
 * Retourne true si l'activité de cet utilisateur doit être réécrite maintenant
 * (et enregistre l'instant). Sinon false — on saute l'écriture DB.
 */
export function shouldUpdateActivity(userId: string): boolean {
  const now = Date.now();
  const prev = lastWrite.get(userId);
  if (prev !== undefined && now - prev < INTERVAL_MS) {
    return false;
  }
  if (lastWrite.size >= MAX_ENTRIES) {
    // Purge grossière : on repart à neuf plutôt que de fuir en mémoire.
    lastWrite.clear();
  }
  lastWrite.set(userId, now);
  return true;
}
