import type { Platform, ConnectorFetchResult } from "./types";

interface CacheEntry {
  result: ConnectorFetchResult;
  expiresAt: number;
}

// In-memory cache for fast subsequent reads (5 min TTL)
const profileCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Deduplication map for in-flight requests
const inFlightRequests = new Map<string, Promise<ConnectorFetchResult>>();

function getCacheKey(platform: Platform, username: string): string {
  return `${platform}:${username.trim().toLowerCase()}`;
}

/**
 * Gets cached profile if still valid.
 */
export function getCachedProfile(
  platform: Platform,
  username: string
): ConnectorFetchResult | null {
  const key = getCacheKey(platform, username);
  const entry = profileCache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    profileCache.delete(key);
    return null;
  }

  return entry.result;
}

/**
 * Sets cached profile for a given TTL.
 */
export function setCachedProfile(
  platform: Platform,
  username: string,
  result: ConnectorFetchResult,
  ttlMs: number = CACHE_TTL_MS
): void {
  // Only cache successful results
  if (!result.success) return;

  const key = getCacheKey(platform, username);
  profileCache.set(key, {
    result,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Invalidates cache for a specific platform user.
 */
export function invalidateProfileCache(platform: Platform, username: string): void {
  const key = getCacheKey(platform, username);
  profileCache.delete(key);
}

/**
 * Deduplicates in-flight requests: if another fetch for the same platform + username
 * is already running, returns the existing Promise instead of firing a second request.
 */
export async function deduplicateRequest(
  platform: Platform,
  username: string,
  fetcher: () => Promise<ConnectorFetchResult>
): Promise<ConnectorFetchResult> {
  const key = getCacheKey(platform, username);
  const existing = inFlightRequests.get(key);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    try {
      return await fetcher();
    } finally {
      inFlightRequests.delete(key);
    }
  })();

  inFlightRequests.set(key, promise);
  return promise;
}
