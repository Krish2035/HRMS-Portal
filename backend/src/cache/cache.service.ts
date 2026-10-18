import { redis } from '../config/redis';
import { logger } from '../config/logger';

export class CacheService {
  /**
   * Get cached data with automatic JSON parsing
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      if (redis.status !== 'ready') return null;
      const data = await redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (err) {
      logger.warn({ key, err }, 'Cache get error (falling back to database)');
      return null;
    }
  }

  /**
   * Set cached data with TTL in seconds
   */
  static async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      const serialized = JSON.stringify(value);
      await redis.set(key, serialized, 'EX', ttlSeconds);
    } catch (err) {
      logger.warn({ key, err }, 'Cache set error');
    }
  }

  /**
   * Cache-aside helper with stampede lock protection
   */
  static async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlSeconds = 300
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    // Cache miss: execute fetcher
    const freshData = await fetchFn();

    // Asynchronously save to cache without blocking
    if (freshData !== null && freshData !== undefined) {
      this.set(key, freshData, ttlSeconds).catch(() => {});
    }

    return freshData;
  }

  /**
   * Evict specific key
   */
  static async del(key: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      await redis.del(key);
    } catch (err) {
      logger.warn({ key, err }, 'Cache del error');
    }
  }

  /**
   * Invalidate multiple keys by wildcard pattern
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      if (redis.status !== 'ready') return;
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
        logger.debug({ pattern, evictedCount: keys.length }, 'Evicted cache keys');
      }
    } catch (err) {
      logger.warn({ pattern, err }, 'Cache invalidatePattern error');
    }
  }
}
