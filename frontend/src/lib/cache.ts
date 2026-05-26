/**
 * src/lib/cache.ts
 * Simple in-memory cache with TTL
 * 
 * TTL defaults:
 *   - admin/dashboard/stats: 60s
 *   - reports/financial: 300s
 *   - workers list: 30s
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt < Date.now()) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds: number): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  delete(key: string): void {
    this.store.delete(key);
  }

  /**
   * Delete all keys matching a prefix pattern
   */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  size(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }
}

// Singleton — shared across requests in same Node process
export const cache = new MemoryCache();

// Cache TTL constants (seconds)
export const CACHE_TTL = {
  DASHBOARD_STATS: 60,
  REPORTS_FINANCIAL: 300,
  WORKERS_LIST: 30,
  PROJECTS_STATS: 60,
  WORKERS_STATS: 60,
} as const;

/**
 * Cache key builders
 */
export const cacheKey = {
  dashboardStats: () => "admin:dashboard:stats",
  reportsFinancial: (params: string) => `reports:financial:${params}`,
  workersList: (params: string) => `workers:list:${params}`,
  projectsStats: () => "admin:projects:stats",
  workersStats: () => "admin:workers:stats",
};

/**
 * Cache invalidation helpers — call after mutations
 */
export function invalidateDashboard(): void {
  cache.delete(cacheKey.dashboardStats());
  cache.delete(cacheKey.projectsStats());
  cache.delete(cacheKey.workersStats());
}

export function invalidateReports(): void {
  cache.invalidatePrefix("reports:");
}

export function invalidateWorkers(): void {
  cache.invalidatePrefix("workers:");
  invalidateDashboard();
}
