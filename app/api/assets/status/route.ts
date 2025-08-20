import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';

interface AssetData {
  asset: string;
  ask_price?: number;
  category?: string;
  length?: number;
}

interface Order {
  give_asset: string;
  get_asset: string;
  give_quantity: number;
  get_quantity: number;
  status: string;
}

const XCPFOLIO_ADDRESS = '1BoTXcPiDFJgXMbydpRPDKKaqM1MbaEuSe'; // 1Bot address

async function loadAssets(): Promise<AssetData[]> {
  return new Promise((resolve) => {
    const results: AssetData[] = [];
    const csvPath = path.join(process.cwd(), 'subassets_priced.csv');
    
    if (!fs.existsSync(csvPath)) {
      resolve([]);
      return;
    }

    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', (data: Record<string, string>) => {
        results.push({
          asset: data.asset,
          ask_price: data['ask price'] ? parseFloat(data['ask price']) : undefined,
          category: data.category,
          length: data.length ? parseInt(data.length) : undefined,
        });
      })
      .on('end', () => {
        resolve(results);
      })
      .on('error', () => {
        resolve([]);
      });
  });
}

async function fetchOrdersFrom1Bot(): Promise<{
  openOrders: Order[];
  filledOrders: Order[];
}> {
  try {
    // Fetch all open orders from 1Bot
    const openResponse = await fetch(
      `https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=open&limit=1000`
    );
    
    // Fetch all filled orders from 1Bot
    const filledResponse = await fetch(
      `https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=filled&limit=1000`
    );
    
    const openData = openResponse.ok ? await openResponse.json() : { result: [] };
    const filledData = filledResponse.ok ? await filledResponse.json() : { result: [] };
    
    // Filter for XCPFOLIO.* subassets where 1Bot is selling
    const openOrders = (openData.result || []).filter((order: Order) => 
      order.give_asset?.startsWith('XCPFOLIO.')
    );
    
    const filledOrders = (filledData.result || []).filter((order: Order) => 
      order.give_asset?.startsWith('XCPFOLIO.')
    );
    
    return { openOrders, filledOrders };
  } catch (error) {
    console.error('Error fetching orders from 1Bot:', error);
    return { openOrders: [], filledOrders: [] };
  }
}

export async function GET() {
  const assets = await loadAssets();
  const { openOrders, filledOrders } = await fetchOrdersFrom1Bot();
  
  // Create maps for quick lookup
  const openOrdersMap = new Map<string, Order>();
  openOrders.forEach(order => {
    const assetName = order.give_asset.replace('XCPFOLIO.', '');
    openOrdersMap.set(assetName, order);
  });
  
  const filledOrdersMap = new Map<string, Order>();
  filledOrders.forEach(order => {
    const assetName = order.give_asset.replace('XCPFOLIO.', '');
    filledOrdersMap.set(assetName, order);
  });
  
  // Count statuses
  let available = 0;
  let notListed = 0;
  let sold = 0;
  
  const assetStatuses = assets.map(asset => {
    let status: 'available' | 'sold' | 'not-listed' = 'not-listed';
    let actualPrice: number | undefined;
    
    // Check if there's an open order for this asset
    if (openOrdersMap.has(asset.asset)) {
      status = 'available';
      const order = openOrdersMap.get(asset.asset)!;
      // Calculate price from order (get_quantity is in satoshis for XCP)
      actualPrice = order.get_quantity / 100000000;
      available++;
    } 
    // Check if it was sold
    else if (filledOrdersMap.has(asset.asset)) {
      status = 'sold';
      sold++;
    } 
    // Otherwise it's not listed
    else {
      notListed++;
    }
    
    return {
      asset: asset.asset,
      status,
      ...(actualPrice && { price: actualPrice }), // Actual price from order
      ...(asset.ask_price && status === 'not-listed' && { suggestedPrice: asset.ask_price }), // CSV price as suggestion
      ...(asset.category && { category: asset.category }),
      ...(asset.length && { length: asset.length }),
      url: `https://xcpfolio.com/${asset.asset}`,
      json: `https://xcpfolio.com/api/${asset.asset}.json`,
    };
  });
  
  const response = {
    generated: new Date().toISOString(),
    total: assets.length,
    available,
    sold,
    notListed,
    assets: assetStatuses,
  };
  
  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600', // Cache for 60 minutes
    },
  });
}