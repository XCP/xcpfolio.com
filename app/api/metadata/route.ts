import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface AssetMetadata {
  asset: string;
  length: number;
  category: string;
  keyword: string;
  first_issued?: number;
  ask_price?: number;
}

// Cache the parsed CSV data
let cachedMetadata: AssetMetadata[] | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = process.env.NODE_ENV === 'development' 
  ? 5 * 1000 // 5 seconds in development
  : 60 * 60 * 1000; // 1 hour in production

async function loadMetadata(): Promise<AssetMetadata[]> {
  // Return cached data if still valid
  if (cachedMetadata && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedMetadata;
  }

  return new Promise((resolve, reject) => {
    const results: AssetMetadata[] = [];
    const csvPath = path.join(process.cwd(), 'subassets_priced.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: Record<string, string>) => {
        results.push({
          asset: data.asset,
          length: parseInt(data.length) || 0,
          category: data.category || 'Other',
          keyword: data.keyword || 'Other',
          first_issued: data['first issued'] ? parseInt(data['first issued']) : undefined,
          ask_price: data['ask price'] ? parseFloat(data['ask price']) : undefined
        });
      })
      .on('end', () => {
        cachedMetadata = results;
        cacheTime = Date.now();
        resolve(results);
      })
      .on('error', (err: Error) => {
        console.error('Error reading CSV:', err);
        resolve([]);
      });
  });
}

export async function GET(request: Request) {
  // Check if this is a force refresh request
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  // Clear cache if force refresh
  if (forceRefresh) {
    cachedMetadata = null;
    cacheTime = 0;
  }
  
  const metadata = await loadMetadata();
  
  // Get unique categories for filter options
  const categories = [...new Set(metadata.map(m => m.category))].sort();
  
  // Create a map for quick lookup
  const metadataMap: Record<string, AssetMetadata> = {};
  metadata.forEach(m => {
    metadataMap[m.asset] = m;
  });

  return NextResponse.json({
    metadata: metadataMap,
    categories,
    totalAssets: metadata.length
  }, {
    headers: {
      'Cache-Control': process.env.NODE_ENV === 'development' 
        ? 'no-cache' // No caching in development
        : 'public, max-age=3600', // Cache for 1 hour in production
    },
  });
}