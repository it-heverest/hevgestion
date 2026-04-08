import redis from "../lib/redis";

// OTP helpers
const otpKey = (contact: string) => `otp:${contact}`;
export const setOTP = async (
  contact: string,
  code: string,
  ttlSeconds = 5 * 60,
) => {
  await redis.set(otpKey(contact), code, "EX", ttlSeconds);
};

export const getOTP = async (contact: string) => {
  return await redis.get(otpKey(contact));
};

export const deleteOTP = async (contact: string) => {
  await redis.del(otpKey(contact));
};

// JWT blacklist helpers
const blacklistKey = (jti: string) => `bl:${jti}`;
export const blacklistToken = async (jti: string, ttlSeconds: number) => {
  await redis.set(blacklistKey(jti), "1", "EX", ttlSeconds);
};

export const isTokenBlacklisted = async (jti: string) => {
  const v = await redis.get(blacklistKey(jti));
  return Boolean(v);
};

// Simple cache helpers
export const cacheSet = async (
  key: string,
  value: unknown,
  ttlSeconds?: number,
) => {
  const str = typeof value === "string" ? value : JSON.stringify(value);
  if (ttlSeconds) {
    await redis.set(key, str, "EX", ttlSeconds);
  } else {
    await redis.set(key, str);
  }
};

export const cacheGet = async (key: string) => {
  const v = await redis.get(key);
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch (e) {
    return v;
  }
};

export const cacheDel = async (key: string) => {
  await redis.del(key);
};
// backend/src/services/redis.service.ts
import Redis from "ioredis";
import { config } from "../config";

// Redis client singleton
let redisClient: Redis | null = null;

// Default TTL values (in seconds)
const DEFAULT_TTL = 3600; // 1 hour
const SHORT_TTL = 300; // 5 minutes
const LONG_TTL = 86400; // 24 hours

/**
 * Get or create Redis client
 */
export function getRedisClient(): Redis {
  // Respect the same dev-disable flag as lib/redis
  const disableRedis = (process.env.DISABLE_REDIS || "true") === "true" || process.env.NODE_ENV !== "production";
  if (disableRedis) {
    console.log("⚠️ Using lib/redis in-memory client (Redis disabled)");
    // Use the client exported by lib/redis (in-memory dummy) when Redis is disabled
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (require("../lib/redis").default as any) as Redis;
  }

  if (!redisClient) {
    redisClient = new Redis({
      host: config.redis?.host || "localhost",
      port: config.redis?.port || 6379,
      password: config.redis?.password || undefined,
      db: config.redis?.db || 0,
      // Fail-fast settings when Redis is not available in dev environments
      connectTimeout: 1000,
      retryStrategy: (times) => {
        // very short backoff to avoid long blocking
        const delay = Math.min(times * 50, 500);
        return delay;
      },
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    });

    redisClient.on("connect", () => {
      console.log("✅ Redis connected successfully");
    });

    redisClient.on("error", (err) => {
      console.error("❌ Redis connection error:", err.message);
    });
  }

  return redisClient;
}

/**
 * Close Redis connection
 */
export async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log("🔴 Redis connection closed");
  }
}

/**
 * Cache Service with TTL and pattern-based clearing
 */
export const cacheService = {
  /**
   * Get a value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      const client = getRedisClient();
      const value = await client.get(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Cache get error for key ${key}:`, error);
      return null;
    }
  },

  /**
   * Set a value in cache with TTL
   */
  async set<T>(
    key: string,
    value: T,
    ttl: number = DEFAULT_TTL,
  ): Promise<void> {
    try {
      const client = getRedisClient();
      await client.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error(`Cache set error for key ${key}:`, error);
    }
  },

  /**
   * Delete a specific key from cache
   */
  async delete(key: string): Promise<void> {
    try {
      const client = getRedisClient();
      await client.del(key);
    } catch (error) {
      console.error(`Cache delete error for key ${key}:`, error);
    }
  },

  /**
   * Delete multiple keys from cache
   */
  async deleteMany(keys: string[]): Promise<void> {
    try {
      const client = getRedisClient();
      if (keys.length > 0) {
        await client.del(...keys);
      }
    } catch (error) {
      console.error("Cache deleteMany error:", error);
    }
  },

  /**
   * Clear cache by pattern (supports wildcards)
   * Example: clearPattern("user:*") clears all keys starting with "user:"
   */
  async clearPattern(pattern: string): Promise<number> {
    try {
      const client = getRedisClient();
      let cursor = "0";
      let deletedCount = 0;

      do {
        const [newCursor, keys] = await client.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = newCursor;

        if (keys.length > 0) {
          await client.del(...keys);
          deletedCount += keys.length;
        }
      } while (cursor !== "0");

      console.log(
        `🗑️ Cleared ${deletedCount} keys matching pattern: ${pattern}`,
      );
      return deletedCount;
    } catch (error) {
      console.error(`Cache clearPattern error for ${pattern}:`, error);
      return 0;
    }
  },

  /**
   * Clear all cache (use with caution)
   */
  async clearAll(): Promise<void> {
    try {
      const client = getRedisClient();
      await client.flushdb();
      console.log("🗑️ Cleared all cache");
    } catch (error) {
      console.error("Cache clearAll error:", error);
    }
  },

  /**
   * Check if key exists in cache
   */
  async exists(key: string): Promise<boolean> {
    try {
      const client = getRedisClient();
      const result = await client.exists(key);
      return result === 1;
    } catch (error) {
      console.error(`Cache exists error for key ${key}:`, error);
      return false;
    }
  },

  /**
   * Get TTL remaining for a key
   */
  async getTTL(key: string): Promise<number> {
    try {
      const client = getRedisClient();
      return await client.ttl(key);
    } catch (error) {
      console.error(`Cache getTTL error for key ${key}:`, error);
      return -1;
    }
  },

  /**
   * Set expiration time for a key
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      const client = getRedisClient();
      await client.expire(key, ttl);
    } catch (error) {
      console.error(`Cache expire error for key ${key}:`, error);
    }
  },

  /**
   * Refresh TTL for a key (extend expiration)
   */
  async refresh(key: string, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const client = getRedisClient();
      await client.expire(key, ttl);
    } catch (error) {
      console.error(`Cache refresh error for key ${key}:`, error);
    }
  },

  // Predefined TTL constants
  TTL: {
    DEFAULT: DEFAULT_TTL,
    SHORT: SHORT_TTL,
    LONG: LONG_TTL,
  },

  // Helper to generate cache keys
  key: {
    user: (userId: string) => `user:${userId}`,
    users: () => `users:all`,
    folder: (folderId: string) => `folder:${folderId}`,
    folders: (userId: string) => `folders:user:${userId}`,
    foldersByClient: (clientId: string) => `folders:client:${clientId}`,
    client: (clientId: string) => `client:${clientId}`,
    clients: (userId: string) => `clients:user:${userId}`,
    dsf: (folderId: string) => `dsf:${folderId}`,
    dsfConfig: (userId: string) => `dsf:config:${userId}`,
    balance: (folderId: string) => `balance:${folderId}`,
  },
};

/**
 * Decorator or wrapper for caching function results
 */
export function withCache<T>(
  key: string,
  ttl: number = DEFAULT_TTL,
  refreshOnAccess: boolean = false,
) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      // Try to get from cache
      const cached = await cacheService.get<T>(key);
      if (cached !== null) {
        if (refreshOnAccess) {
          // Refresh TTL on access
          await cacheService.refresh(key, ttl);
        }
        return cached;
      }

      // Execute original method
      const result = await originalMethod.apply(this, args);

      // Store in cache
      if (result !== null && result !== undefined) {
        await cacheService.set(key, result, ttl);
      }

      return result;
    };

    return descriptor;
  };
}

/**
 * Cache invalidation helper for model updates
 * Call this after any create/update/delete operation
 */
export const cacheInvalidator = {
  /**
   * Invalidate all user-related cache
   */
  async invalidateUser(userId: string): Promise<void> {
    await cacheService.delete(cacheService.key.user(userId));
    await cacheService.clearPattern("users:*");
  },

  /**
   * Invalidate all folder-related cache for a user
   */
  async invalidateFolders(userId: string, clientId?: string): Promise<void> {
    await cacheService.delete(cacheService.key.folders(userId));
    if (clientId) {
      await cacheService.delete(cacheService.key.foldersByClient(clientId));
    }
    await cacheService.clearPattern("folders:*");
  },

  /**
   * Invalidate folder-specific cache
   */
  async invalidateFolder(folderId: string): Promise<void> {
    await cacheService.delete(cacheService.key.folder(folderId));
    await cacheService.delete(cacheService.key.dsf(folderId));
    await cacheService.delete(cacheService.key.balance(folderId));
  },

  /**
   * Invalidate all client-related cache
   */
  async invalidateClient(clientId: string, userId: string): Promise<void> {
    await cacheService.delete(cacheService.key.client(clientId));
    await cacheService.delete(cacheService.key.clients(userId));
    await cacheService.clearPattern("clients:*");
  },

  /**
   * Invalidate DSF configuration cache
   */
  async invalidateDSFConfig(userId: string): Promise<void> {
    await cacheService.delete(cacheService.key.dsfConfig(userId));
    await cacheService.clearPattern("dsf:config:*");
  },
};

export default cacheService;
