// src/utils/login-throttle.ts
// Verrouillage par COMPTE (en plus du rate-limit par IP).
// Compte les échecs de connexion par identifiant (numéro de téléphone) et
// bloque temporairement le compte au-delà d'un seuil. Complète le limiteur par
// IP : protège un compte ciblé même depuis des IP différentes.
//
// Compromis assumé : un attaquant peut provoquer un verrouillage temporaire d'un
// compte (déni de service ciblé). C'est pourquoi la fenêtre est courte et le
// seuil configurable. Réglages : LOGIN_ACCOUNT_MAX_FAILURES, LOGIN_ACCOUNT_WINDOW_MIN.

import { getRateLimitRedis } from "../middleware/rateLimit";

const int = (v: string | undefined, d: number): number => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

const MAX_FAILURES = int(process.env.LOGIN_ACCOUNT_MAX_FAILURES, 10);
const WINDOW_SEC = int(process.env.LOGIN_ACCOUNT_WINDOW_MIN, 15) * 60;

const key = (id: string) => `laf:${id.toLowerCase()}`;

// ── Fallback mémoire (par process) quand Redis est absent ────────────────────
const mem = new Map<string, { count: number; expiresAt: number }>();
const now = () => Date.now();

function memPrune(k: string) {
  const e = mem.get(k);
  if (e && e.expiresAt <= now()) mem.delete(k);
}

export interface LockState {
  locked: boolean;
  retryAfter: number; // secondes
  failures: number;
}

export async function getLockState(id: string): Promise<LockState> {
  const k = key(id);
  const redis = getRateLimitRedis();
  if (redis) {
    try {
      const [countStr, ttl] = await Promise.all([
        redis.get(k),
        redis.ttl(k),
      ]);
      const failures = parseInt(countStr ?? "0", 10) || 0;
      const locked = failures >= MAX_FAILURES;
      return { locked, retryAfter: locked && ttl > 0 ? ttl : 0, failures };
    } catch {
      return { locked: false, retryAfter: 0, failures: 0 };
    }
  }
  memPrune(k);
  const e = mem.get(k);
  const failures = e?.count ?? 0;
  const locked = failures >= MAX_FAILURES;
  const retryAfter =
    locked && e ? Math.max(0, Math.ceil((e.expiresAt - now()) / 1000)) : 0;
  return { locked, retryAfter, failures };
}

export async function registerFailedLogin(id: string): Promise<void> {
  const k = key(id);
  const redis = getRateLimitRedis();
  if (redis) {
    try {
      const count = await redis.incr(k);
      if (count === 1) await redis.expire(k, WINDOW_SEC);
      return;
    } catch {
      /* fail-open : on n'empêche pas la tentative si Redis tombe */
    }
    return;
  }
  memPrune(k);
  const e = mem.get(k);
  if (e && e.expiresAt > now()) {
    e.count += 1;
  } else {
    mem.set(k, { count: 1, expiresAt: now() + WINDOW_SEC * 1000 });
  }
}

export async function clearFailedLogins(id: string): Promise<void> {
  const k = key(id);
  const redis = getRateLimitRedis();
  if (redis) {
    try {
      await redis.del(k);
    } catch {
      /* ignore */
    }
    return;
  }
  mem.delete(k);
}
