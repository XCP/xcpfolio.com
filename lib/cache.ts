import { unstable_cache } from 'next/cache';
import type { Subasset, Order } from './api';

const API_BASE = 'https://api.counterparty.io:4000';

// Cache subassets for 5 minutes
export const getCachedSubassets = unstable_cache(
  async (): Promise<Subasset[]> => {
    const response = await fetch(
      `${API_BASE}/v2/assets/XCPFOLIO/subassets?verbose=true&limit=1000`
    );
    const data = await response.json();
    return data.result || [];
  },
  ['xcpfolio-subassets'],
  {
    revalidate: 300, // 5 minutes
    tags: ['subassets']
  }
);

// Cache orders for 1 minute
export const getCachedOrders = unstable_cache(
  async (asset: string): Promise<Order[]> => {
    const fullAssetName = asset.includes('.') ? asset : `XCPFOLIO.${asset}`;
    const response = await fetch(
      `${API_BASE}/v2/assets/${fullAssetName}/orders?status=open&verbose=true`
    );
    const data = await response.json();
    return data.result || [];
  },
  ['xcpfolio-orders'],
  {
    revalidate: 60, // 1 minute
    tags: ['orders']
  }
);