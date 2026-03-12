// backend/src/middleware/cache.middleware.ts
import { Request, Response, NextFunction } from "express";
import { cacheService, cacheInvalidator } from "../services/redis.service";

/**
 * Cache middleware - caches GET responses
 */
export function cacheMiddleware(
  keyGenerator: (req: Request) => string,
  ttl?: number,
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== "GET") {
      return next();
    }

    try {
      const key = keyGenerator(req);
      const cachedData = await cacheService.get(key);

      if (cachedData) {
        console.log(`📦 Cache HIT: ${key}`);
        return res.json(cachedData);
      }

      console.log(`📦 Cache MISS: ${key}`);

      // Override res.json to cache the response
      const originalJson = res.json.bind(res);
      res.json = (data: any) => {
        // Cache the response
        if (data && !data.error) {
          cacheService.set(key, data, ttl).catch(console.error);
        }
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
}

/**
 * Invalidate cache after mutations (POST, PUT, DELETE)
 */
export function invalidateCache(
  keyPatterns: string[] | ((req: Request) => string[]),
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store original json to run after response is sent
    const originalJson = res.json.bind(res);

    res.json = (data: any) => {
      // Invalidate cache after successful mutation
      if (req.method !== "GET" && data && !data.error) {
        (async () => {
          try {
            const patterns =
              typeof keyPatterns === "function"
                ? keyPatterns(req)
                : keyPatterns;

            for (const pattern of patterns) {
              await cacheService.clearPattern(pattern);
            }
            console.log("🗑️ Cache invalidated for patterns:", patterns);
          } catch (error) {
            console.error("Cache invalidation error:", error);
          }
        })();
      }

      return originalJson(data);
    };

    next();
  };
}

export { cacheInvalidator };
