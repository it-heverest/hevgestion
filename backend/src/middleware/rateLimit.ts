// src/middleware/rateLimit.ts
// Rate-limiting durci et multi-instance.
//
//  - Compteurs SÉPARÉS par usage (login ≠ register ≠ refresh ≠ forgot ≠ otp ≠ global).
//    Auparavant un unique `strictLimiter` était partagé entre login/register/refresh/
//    forgot-password → épuiser l'un bloquait les autres.
//  - Store Redis maison (INCR + PEXPIRE) quand Redis est disponible, pour que la
//    limite tienne à travers plusieurs instances. Sinon store mémoire par défaut.
//  - Le store échoue « ouvert » : un incident Redis ne doit jamais bloquer l'auth.
//  - Toutes les valeurs sont surchargeables par variable d'environnement.

import rateLimit, { Options, Store } from "express-rate-limit";
import Redis from "ioredis";
import { config } from "../config";

const MIN = 60 * 1000;

const int = (v: string | undefined, d: number): number => {
  const n = parseInt(v ?? "", 10);
  return Number.isFinite(n) && n > 0 ? n : d;
};

// ── Client Redis dédié au rate-limiting ──────────────────────────────────────
// Activé uniquement si Redis est explicitement disponible (DISABLE_REDIS=false,
// ou prod sans désactivation). Ailleurs → null → store mémoire.
let rlRedis: Redis | null | undefined;
export function getRateLimitRedis(): Redis | null {
  if (rlRedis !== undefined) return rlRedis;

  const enabled =
    process.env.DISABLE_REDIS === "false" ||
    (config.isProduction && process.env.DISABLE_REDIS !== "true");

  if (!enabled) {
    rlRedis = null;
    return rlRedis;
  }

  try {
    rlRedis = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      db: config.redis.db,
      connectTimeout: 1000,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: (times) => Math.min(times * 50, 500),
    });
    rlRedis.on("error", (e) =>
      console.error("⚠️ Rate-limit Redis error:", e.message),
    );
    console.log("🛡️ Rate-limiting: store Redis actif");
  } catch (e) {
    console.error(
      "⚠️ Rate-limit Redis init échoué, fallback mémoire:",
      (e as Error).message,
    );
    rlRedis = null;
  }
  return rlRedis;
}

// ── Store Redis minimal implémentant l'interface express-rate-limit ──────────
class RedisRateStore implements Store {
  private windowMs = 15 * MIN;
  // NB: pas de champ `prefix` privé — le type `Store` déclare un `prefix?`
  // public, un `private prefix` casserait la compatibilité structurelle.
  constructor(
    private client: Redis,
    private keyPrefix: string,
  ) {}

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  private key(k: string): string {
    return `rl:${this.keyPrefix}:${k}`;
  }

  async increment(k: string): Promise<{ totalHits: number; resetTime: Date }> {
    try {
      const key = this.key(k);
      const totalHits = await this.client.incr(key);
      if (totalHits === 1) {
        await this.client.pexpire(key, this.windowMs);
      }
      let ttl = await this.client.pttl(key);
      if (ttl < 0) {
        await this.client.pexpire(key, this.windowMs);
        ttl = this.windowMs;
      }
      return { totalHits, resetTime: new Date(Date.now() + ttl) };
    } catch {
      // Fail-open : ne jamais bloquer une requête à cause de Redis.
      return { totalHits: 1, resetTime: new Date(Date.now() + this.windowMs) };
    }
  }

  async decrement(k: string): Promise<void> {
    try {
      await this.client.decr(this.key(k));
    } catch {
      /* fail-open */
    }
  }

  async resetKey(k: string): Promise<void> {
    try {
      await this.client.del(this.key(k));
    } catch {
      /* fail-open */
    }
  }
}

// ── Fabrique de limiteurs ────────────────────────────────────────────────────
function makeLimiter(opts: {
  prefix: string;
  windowMs: number;
  limit: number;
  message?: string;
}) {
  const client = getRateLimitRedis();
  return rateLimit({
    windowMs: opts.windowMs,
    limit: opts.limit,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: opts.message ?? "Too many requests. Please try again later.",
    },
    // store mémoire par défaut si pas de Redis (un store distinct par limiteur).
    store: client ? new RedisRateStore(client, opts.prefix) : undefined,
  });
}

// ── Limiteurs exportés (compteurs indépendants) ──────────────────────────────

// Global /api : garde-fou large. En dev on reste généreux pour ne pas gêner les
// tests ; en prod on serre. Surcharge : RATE_LIMIT_GLOBAL_MAX.
export const globalApiLimiter = makeLimiter({
  prefix: "global",
  windowMs: 15 * MIN,
  limit: int(
    process.env.RATE_LIMIT_GLOBAL_MAX,
    config.isProduction ? 1000 : 5000,
  ),
  message: "Too many requests. Please slow down.",
});

export const loginLimiter = makeLimiter({
  prefix: "login",
  windowMs: 15 * MIN,
  limit: int(process.env.RATE_LIMIT_LOGIN_MAX, 15),
  message: "Too many login attempts. Please try again in 15 minutes.",
});

export const registerLimiter = makeLimiter({
  prefix: "register",
  windowMs: 60 * MIN,
  limit: int(process.env.RATE_LIMIT_REGISTER_MAX, 10),
  message: "Too many registration attempts. Please try again later.",
});

export const refreshLimiter = makeLimiter({
  prefix: "refresh",
  windowMs: 15 * MIN,
  limit: int(process.env.RATE_LIMIT_REFRESH_MAX, 60),
  message: "Too many refresh attempts. Please try again later.",
});

export const forgotPasswordLimiter = makeLimiter({
  prefix: "forgot",
  windowMs: 60 * MIN,
  limit: int(process.env.RATE_LIMIT_FORGOT_MAX, 5),
  message: "Too many password reset requests. Please try again later.",
});

export const otpLimiter = makeLimiter({
  prefix: "otp",
  windowMs: 5 * MIN,
  limit: int(process.env.RATE_LIMIT_OTP_MAX, 30),
  message: "Too many OTP attempts. Please try again in 5 minutes.",
});
