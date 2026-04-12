/**
 * Simple in-memory cache for analytics data
 * This reduces database load for frequently accessed analytics
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class AnalyticsCache {
  private cache = new Map<string, CacheEntry<unknown>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes in milliseconds

  /**
   * Get cached data by key
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set data in cache with optional TTL
   */
  set<T>(key: string, data: T, ttlMs?: number): void {
    const expiresAt = Date.now() + (ttlMs || this.defaultTTL);
    this.cache.set(key, { data, expiresAt });
  }

  /**
   * Delete data from cache
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  stats() {
    return {
      size: this.cache.size,
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
        key,
        expiresIn: Math.max(0, entry.expiresAt - Date.now()),
      })),
    };
  }
}

// Singleton instance
export const analyticsCache = new AnalyticsCache();

/**
 * Cache keys for analytics data
 */
export const CacheKeys = {
  totalUsers: 'analytics:totalUsers',
  totalPageViews: 'analytics:totalPageViews',
  activeSessions: 'analytics:activeSessions',
  totalLogins: 'analytics:totalLogins',
  avgDuration: 'analytics:avgDuration',
  topPages: 'analytics:topPages',
  monthlyData: 'analytics:monthlyData',
  loginsByProvider: 'analytics:loginsByProvider',
} as const;

/**
 * Helper function to get or fetch data with caching
 */
export async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlMs?: number
): Promise<T> {
  // Try to get from cache first
  const cached = analyticsCache.get<T>(key);
  if (cached !== null) {
    return cached;
  }

  // Fetch fresh data
  const data = await fetchFn();
  
  // Store in cache
  analyticsCache.set(key, data, ttlMs);
  
  return data;
}

/**
 * Invalidate specific cache keys
 */
export function invalidateCache(keys: string | string[]): void {
  const keysToInvalidate = Array.isArray(keys) ? keys : [keys];
  keysToInvalidate.forEach(key => analyticsCache.delete(key));
}