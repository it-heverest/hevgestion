import Redis from "ioredis";

// Disable Redis in development by default to avoid environment dependency.
// Set DISABLE_REDIS=false in production or when you want real Redis.
const disableRedis = (process.env.DISABLE_REDIS || "true") === "true" || process.env.NODE_ENV !== "production";

if (disableRedis) {
  // Simple in-memory fallback that implements a subset of ioredis API used by the app.
  const store = new Map<string, { value: string; expiresAt?: number }>();

  const now = () => Date.now();

  const matchPattern = (pattern: string) => {
    // Convert simple glob '*' to RegExp
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    return Array.from(store.keys()).filter((k) => regex.test(k));
  };

  const dummy: any = {
    get: async (key: string) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiresAt && entry.expiresAt < now()) {
        store.delete(key);
        return null;
      }
      return entry.value;
    },
    set: async (key: string, value: string) => {
      store.set(key, { value });
      return "OK";
    },
    setex: async (key: string, ttl: number, value: string) => {
      store.set(key, { value, expiresAt: now() + ttl * 1000 });
      return "OK";
    },
    del: async (...keys: string[]) => {
      let removed = 0;
      for (const k of keys) {
        if (store.delete(k)) removed++;
      }
      return removed;
    },
    scan: async (cursor: string, _match: string, pattern: string, _count: string, _countNum: number) => {
      const keys = matchPattern(pattern);
      return ["0", keys];
    },
    exists: async (key: string) => {
      return store.has(key) ? 1 : 0;
    },
    ttl: async (key: string) => {
      const entry = store.get(key);
      if (!entry || !entry.expiresAt) return -1;
      const secs = Math.floor((entry.expiresAt - now()) / 1000);
      return secs > 0 ? secs : -2;
    },
    expire: async (key: string, ttl: number) => {
      const entry = store.get(key);
      if (!entry) return 0;
      entry.expiresAt = now() + ttl * 1000;
      store.set(key, entry);
      return 1;
    },
    flushdb: async () => {
      store.clear();
      return "OK";
    },
    on: (_event: string, _cb: (...args: any[]) => void) => {
      // no-op
    },
    quit: async () => {
      store.clear();
      return "OK";
    },
  };

  console.log("⚠️ Redis disabled in this environment — using in-memory fallback");
  var exportedClient: any = dummy;
} else {
  const redisUrl = process.env.REDIS_URL;

  const client = redisUrl
    ? new Redis(redisUrl)
    : new Redis({
        host: process.env.REDIS_HOST || "127.0.0.1",
        port: Number(process.env.REDIS_PORT) || 6379,
        password: process.env.REDIS_PASSWORD || undefined,
      });

  client.on("error", (err) => {
    // Keep this simple: log connection issues to console
    // eslint-disable-next-line no-console
    console.error("Redis error:", err);
  });

  exportedClient = client;
}

// Single export to avoid emitting ESM 'export' tokens in branch blocks
export default exportedClient;
