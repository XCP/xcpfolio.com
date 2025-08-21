#!/usr/bin/env node
/**
 * Generate static JSON files for all assets and status endpoint
 * Run this periodically (e.g., every 5 minutes via cron) to keep data fresh
 */

import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface AssetData {
  asset: string;
  ask_price?: number;
  category?: string;
  length?: number;
  keyword?: string;
  first_issued?: number;
}

interface Order {
  give_asset: string;
  get_asset: string;
  give_quantity: number;
  get_quantity: number;
  status: string;
  tx_hash?: string;
  block_index?: number;
  give_asset_info?: {
    asset_longname?: string;
  };
}

const XCPFOLIO_ADDRESS = '1BotpWeW4cWRZ26rLvBCRHTeWtaH5fUYPX';
const PUBLIC_DIR = path.join(process.cwd(), 'public');
const DATA_DIR = path.join(PUBLIC_DIR, 'data');
const ASSETS_DIR = path.join(DATA_DIR, 'assets');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

async function loadAssets(): Promise<Map<string, AssetData>> {
  return new Promise((resolve) => {
    const assetsMap = new Map<string, AssetData>();
    const csvPath = path.join(process.cwd(), 'subassets_priced.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.warn('CSV file not found:', csvPath);
      resolve(assetsMap);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: Record<string, string>) => {
        assetsMap.set(data.asset, {
          asset: data.asset,
          ask_price: data['ask price'] ? parseFloat(data['ask price']) : undefined,
          category: data.category || 'Other',
          keyword: data.keyword || 'Other',
          length: data.length ? parseInt(data.length) : undefined,
          first_issued: data['first issued'] ? parseInt(data['first issued']) : undefined,
        });
      })
      .on('end', () => {
        console.log(`Loaded ${assetsMap.size} assets from CSV`);
        resolve(assetsMap);
      })
      .on('error', (error) => {
        console.error('Error reading CSV:', error);
        resolve(assetsMap);
      });
  });
}

async function fetchOrdersFrom1Bot(): Promise<{
  openOrders: Order[];
  filledOrders: Order[];
}> {
  try {
    console.log('Fetching orders from Counterparty API...');
    
    // Fetch open orders
    const openResponse = await fetch(
      `https://api.counterparty.io:4000/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=open&limit=1000&verbose=true`,
      { 
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    );
    
    // Fetch filled orders
    const filledResponse = await fetch(
      `https://api.counterparty.io:4000/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=filled&limit=1000&verbose=true`,
      {
        signal: AbortSignal.timeout(30000) // 30 second timeout
      }
    );
    
    const openData = openResponse.ok ? await openResponse.json() : { result: [] };
    const filledData = filledResponse.ok ? await filledResponse.json() : { result: [] };
    
    // Filter for XCPFOLIO.* subassets (checking both give_asset and asset_longname)
    const openOrders = (openData.result || []).filter((order: Order) => {
      const assetName = order.give_asset_info?.asset_longname || order.give_asset;
      return assetName?.startsWith('XCPFOLIO.');
    });
    
    const filledOrders = (filledData.result || []).filter((order: Order) => {
      const assetName = order.give_asset_info?.asset_longname || order.give_asset;
      return assetName?.startsWith('XCPFOLIO.');
    });
    
    console.log(`Found ${openOrders.length} open orders, ${filledOrders.length} filled orders`);
    
    return { openOrders, filledOrders };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { openOrders: [], filledOrders: [] };
  }
}

function generateAssetJSON(
  assetName: string,
  assetData: AssetData | undefined,
  status: 'available' | 'sold' | 'not-listed',
  actualPrice?: number
) {
  const subassetName = `XCPFOLIO.${assetName}`;
  
  // Generate status-specific description
  let description = `Ownership token for ${assetName} Counterparty asset`;
  let statusImage = 'https://xcpfolio.com/status/not-listed.svg';
  
  if (status === 'available' && actualPrice) {
    statusImage = 'https://xcpfolio.com/status/available.svg';
    description = `🟢 FOR SALE: Buy 1 ${subassetName} for ${actualPrice} XCP to receive ownership of ${assetName}`;
  } else if (status === 'sold') {
    statusImage = 'https://xcpfolio.com/status/sold.svg';
    description = `🔴 SOLD: ${assetName} ownership has been transferred. This token is no longer redeemable.`;
  } else {
    description = `⚫ NOT LISTED: ${assetName} is not currently available for purchase on XCPFOLIO.`;
  }
  
  // Ensure description doesn't exceed 2048 chars
  if (description.length > 2048) {
    description = description.substring(0, 2048);
  }
  
  return {
    asset: subassetName,
    description,
    image: statusImage,
    website: `https://xcpfolio.com/${assetName}`,
  };
}

async function generateStaticFiles() {
  console.log('Starting static file generation...');
  const startTime = Date.now();
  
  // Load assets from CSV
  const assets = await loadAssets();
  
  // Fetch orders from blockchain
  const { openOrders, filledOrders } = await fetchOrdersFrom1Bot();
  
  // Create order maps
  const openOrdersMap = new Map<string, Order>();
  openOrders.forEach(order => {
    const fullAssetName = order.give_asset_info?.asset_longname || order.give_asset;
    const assetName = fullAssetName.replace('XCPFOLIO.', '');
    openOrdersMap.set(assetName, order);
  });
  
  const filledOrdersMap = new Map<string, Order>();
  filledOrders.forEach(order => {
    const fullAssetName = order.give_asset_info?.asset_longname || order.give_asset;
    const assetName = fullAssetName.replace('XCPFOLIO.', '');
    filledOrdersMap.set(assetName, order);
  });
  
  // Track statistics
  let available = 0;
  let notListed = 0;
  let sold = 0;
  const assetStatuses: any[] = [];
  
  // Generate individual asset JSON files
  console.log('Generating individual asset JSON files...');
  for (const [assetName, assetData] of assets.entries()) {
    let status: 'available' | 'sold' | 'not-listed' = 'not-listed';
    let actualPrice: number | undefined;
    
    // Determine status
    if (openOrdersMap.has(assetName)) {
      status = 'available';
      const order = openOrdersMap.get(assetName)!;
      actualPrice = order.get_quantity / 100000000; // Convert satoshis to XCP
      available++;
    } else if (filledOrdersMap.has(assetName)) {
      status = 'sold';
      sold++;
    } else {
      notListed++;
    }
    
    // Generate JSON for this asset
    const assetJSON = generateAssetJSON(assetName, assetData, status, actualPrice);
    
    // Write individual asset JSON files
    const assetPath = path.join(ASSETS_DIR, `${assetName}.json`);
    fs.writeFileSync(assetPath, JSON.stringify(assetJSON, null, 2));
    
    // Also write with XCPFOLIO prefix for compatibility
    const prefixedPath = path.join(ASSETS_DIR, `XCPFOLIO.${assetName}.json`);
    fs.writeFileSync(prefixedPath, JSON.stringify(assetJSON, null, 2));
    
    // Add to status array
    assetStatuses.push({
      asset: assetName,
      status,
      ...(actualPrice && { price: actualPrice }),
      ...(assetData.ask_price && status === 'not-listed' && { suggestedPrice: assetData.ask_price }),
      ...(assetData.category && { category: assetData.category }),
      ...(assetData.length && { length: assetData.length }),
      url: `https://xcpfolio.com/${assetName}`,
      json: `https://xcpfolio.com/data/assets/${assetName}.json`,
    });
  }
  
  // Generate main status file
  console.log('Generating status.json...');
  const statusData = {
    generated: new Date().toISOString(),
    total: assets.size,
    available,
    sold,
    notListed,
    assets: assetStatuses,
  };
  
  const statusPath = path.join(DATA_DIR, 'status.json');
  fs.writeFileSync(statusPath, JSON.stringify(statusData, null, 2));
  
  // Generate minimal status file (for faster loading)
  const minimalStatus = {
    generated: statusData.generated,
    total: statusData.total,
    available,
    sold,
    notListed,
  };
  
  const minimalPath = path.join(DATA_DIR, 'status-minimal.json');
  fs.writeFileSync(minimalPath, JSON.stringify(minimalStatus, null, 2));
  
  const elapsed = Date.now() - startTime;
  console.log(`Generated ${assets.size} asset JSON files and status files in ${elapsed}ms`);
  
  // Write generation log
  const logData = {
    timestamp: new Date().toISOString(),
    duration: elapsed,
    assets: assets.size,
    available,
    sold,
    notListed,
    success: true,
  };
  
  const logPath = path.join(DATA_DIR, 'generation-log.json');
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
}

// Run generation
generateStaticFiles()
  .then(() => {
    console.log('Static file generation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Generation failed:', error);
    process.exit(1);
  });