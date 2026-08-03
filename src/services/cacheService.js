import { get, set, del } from 'idb-keyval';

const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Generate a cache key based on bounding box or lat/lng + radius
 */
export function getCacheKey(lat, lng, radiusKm, category) {
  // Round lat/lng to ~100m grid for effective key sharing
  const latGrid = Math.round(lat * 100) / 100;
  const lngGrid = Math.round(lng * 100) / 100;
  return `nature_query_${latGrid}_${lngGrid}_${radiusKm}_${category}`;
}

/**
 * Get cached query data if valid
 */
export async function getCachedData(key) {
  try {
    const record = await get(key);
    if (!record) return null;

    const isExpired = Date.now() - record.timestamp > CACHE_EXPIRATION_MS;
    if (isExpired) {
      await del(key);
      return null;
    }

    return record.data;
  } catch (err) {
    console.warn('IndexedDB read error, skipping cache:', err);
    return null;
  }
}

/**
 * Save query data to IndexedDB
 */
export async function setCachedData(key, data) {
  try {
    await set(key, {
      timestamp: Date.now(),
      data,
    });
  } catch (err) {
    console.warn('IndexedDB write error:', err);
  }
}
