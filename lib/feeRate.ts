/**
 * Fee Rate Utilities
 *
 * Fetches recommended fee rates from mempool.space API.
 */

export interface FeeRates {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

// Simple in-memory cache
let cachedRates: FeeRates | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 30 * 1000; // 30 seconds

/**
 * Fetch fee rates from mempool.space API.
 * Uses a 30-second cache to reduce API calls.
 *
 * @returns Fee rates in sat/vB
 */
export async function getFeeRates(): Promise<FeeRates> {
  const now = Date.now();

  // Return cached rates if still valid
  if (cachedRates && (now - cacheTimestamp) < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const response = await fetch('https://mempool.space/api/v1/fees/recommended');

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    cachedRates = {
      fastestFee: data.fastestFee,
      halfHourFee: data.halfHourFee,
      hourFee: data.hourFee,
      economyFee: data.economyFee,
      minimumFee: data.minimumFee,
    };
    cacheTimestamp = now;

    return cachedRates;
  } catch (error) {
    console.error('Failed to fetch fee rates:', error);

    // Return cached rates if available, even if stale
    if (cachedRates) {
      return cachedRates;
    }

    // Fallback to reasonable defaults
    return {
      fastestFee: 10,
      halfHourFee: 5,
      hourFee: 3,
      economyFee: 2,
      minimumFee: 1,
    };
  }
}

/**
 * Get the recommended fee rate for order transactions.
 * Uses the economy fee rate since orders are not time-sensitive.
 *
 * @returns Fee rate in sat/vB
 */
export async function getOrderFeeRate(): Promise<number> {
  const rates = await getFeeRates();
  // Use hourFee for orders - fast enough but not overpaying
  // Minimum of 1 sat/vB to ensure transaction is accepted
  return Math.max(rates.hourFee, 1);
}
