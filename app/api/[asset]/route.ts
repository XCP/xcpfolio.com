import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface AssetCSVData {
  asset: string;
  length: number;
  category: string;
  keyword: string;
  first_issued?: number;
  ask_price?: number;
}

// Cache for CSV data
let cachedAssets: Map<string, AssetCSVData> | null = null;
let cacheTime: number = 0;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

async function loadAssetData(): Promise<Map<string, AssetCSVData>> {
  // Return cached data if still valid
  if (cachedAssets && Date.now() - cacheTime < CACHE_DURATION) {
    return cachedAssets;
  }

  return new Promise((resolve) => {
    const assetsMap = new Map<string, AssetCSVData>();
    const csvPath = path.join(process.cwd(), 'subassets_priced.csv');
    
    // Check if file exists
    if (!fs.existsSync(csvPath)) {
      resolve(assetsMap);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: Record<string, string>) => {
        assetsMap.set(data.asset, {
          asset: data.asset,
          length: parseInt(data.length) || 0,
          category: data.category || 'Other',
          keyword: data.keyword || 'Other',
          first_issued: data['first issued'] ? parseInt(data['first issued']) : undefined,
          ask_price: data['ask price'] ? parseFloat(data['ask price']) : undefined
        });
      })
      .on('end', () => {
        cachedAssets = assetsMap;
        cacheTime = Date.now();
        resolve(assetsMap);
      })
      .on('error', () => {
        resolve(assetsMap);
      });
  });
}

// Check actual blockchain state via Counterparty API
async function checkAssetStatus(assetName: string): Promise<'available' | 'sold' | 'not-listed'> {
  try {
    const XCPFOLIO_ADDRESS = '1BoTXcPiDFJgXMbydpRPDKKaqM1MbaEuSe'; // 1Bot address
    const subassetName = `XCPFOLIO.${assetName}`;
    
    // Check for open orders from 1Bot for this subasset
    const ordersResponse = await fetch(
      `https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=open&asset=${subassetName}`
    );
    
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json();
      const orders = ordersData.result || [];
      
      // Check if there's an open sell order for this subasset
      const hasOpenOrder = orders.some((order: any) => 
        order.give_asset === subassetName && 
        order.status === 'open'
      );
      
      if (hasOpenOrder) {
        return 'available';
      }
    }
    
    // Check if it's been sold (order was filled)
    const filledOrdersResponse = await fetch(
      `https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=filled&asset=${subassetName}`
    );
    
    if (filledOrdersResponse.ok) {
      const filledData = await filledOrdersResponse.json();
      const filledOrders = filledData.result || [];
      
      const wasSold = filledOrders.some((order: any) => 
        order.give_asset === subassetName && 
        order.status === 'filled'
      );
      
      if (wasSold) {
        return 'sold';
      }
    }
    
    return 'not-listed';
  } catch (error) {
    console.error('Error checking asset status:', error);
    return 'not-listed';
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  // Await params in Next.js 15
  const resolvedParams = await params;
  
  // Extract asset name from the route (removes .json extension if present)
  // Could be either ASSETNAME or XCPFOLIO.ASSETNAME
  let assetName = resolvedParams.asset.replace('.json', '').toUpperCase();
  let parentAsset = assetName;
  
  // Check if this is already a subasset request
  if (assetName.startsWith('XCPFOLIO.')) {
    parentAsset = assetName.replace('XCPFOLIO.', '');
  } else {
    // Convert to subasset name for the JSON (this is what's actually traded)
    assetName = `XCPFOLIO.${assetName}`;
  }
  
  // Load asset data from CSV (using parent asset name)
  const assets = await loadAssetData();
  const assetData = assets.get(parentAsset);
  
  // Determine asset status
  const status = await checkAssetStatus(parentAsset);
  
  // Generate status-specific description for the SUBASSET
  let description = `Ownership token for ${parentAsset} Counterparty asset`;
  let statusImage = 'https://xcpfolio.com/status/not-listed.svg';
  
  if (status === 'available' && assetData?.ask_price) {
    statusImage = 'https://xcpfolio.com/status/available.svg';
    description = `🟢 FOR SALE: Buy 1 ${assetName} for ${assetData.ask_price} XCP to receive ownership of ${parentAsset}`;
  } else if (status === 'sold') {
    statusImage = 'https://xcpfolio.com/status/sold.svg';
    description = `🔴 SOLD: ${parentAsset} ownership has been transferred. This token is no longer redeemable.`;
  } else {
    description = `⚫ NOT LISTED: ${parentAsset} is not currently available for purchase on XCPFOLIO.`;
  }
  
  // Ensure description doesn't exceed 2048 chars per spec
  if (description.length > 2048) {
    description = description.substring(0, 2048);
  }
  
  // Build response following Counterparty Enhanced Asset Info v1.0.0 spec ONLY
  // No custom fields as they're not part of the standard
  const metadata = {
    // Required field - This is the SUBASSET name (what's actually being traded)
    asset: assetName,
    
    // Optional standard fields (v1.0.0 spec)
    description,
    image: statusImage, // 48x48 SVG status indicator
    website: `https://xcpfolio.com/${parentAsset}`,
    // pgpsig field omitted as not applicable
  };

  return NextResponse.json(metadata, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600', // Cache for 5 minutes, serve stale for 10
    },
  });
}