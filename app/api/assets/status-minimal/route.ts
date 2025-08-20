import { NextResponse } from 'next/server';

interface MinimalStatus {
  asset: string;
  status: 'available' | 'sold' | 'not-listed';
}

const XCPFOLIO_ADDRESS = '1BoTXcPiDFJgXMbydpRPDKKaqM1MbaEuSe'; // 1Bot address

async function fetchOrdersFrom1Bot() {
  try {
    // Fetch only what we need - open and filled orders
    const [openResponse, filledResponse] = await Promise.all([
      fetch(`https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=open&limit=1000`),
      fetch(`https://api.counterparty.io/v2/addresses/${XCPFOLIO_ADDRESS}/orders?status=filled&limit=1000`)
    ]);
    
    const openData = openResponse.ok ? await openResponse.json() : { result: [] };
    const filledData = filledResponse.ok ? await filledResponse.json() : { result: [] };
    
    return {
      open: (openData.result || []).filter((o: any) => o.give_asset?.startsWith('XCPFOLIO.')),
      filled: (filledData.result || []).filter((o: any) => o.give_asset?.startsWith('XCPFOLIO.'))
    };
  } catch (error) {
    console.error('Error fetching orders:', error);
    return { open: [], filled: [] };
  }
}

export async function GET() {
  const { open, filled } = await fetchOrdersFrom1Bot();
  
  // Create a map of asset statuses
  const statusMap = new Map<string, 'available' | 'sold'>();
  
  // Mark available assets
  open.forEach((order: any) => {
    const asset = order.give_asset.replace('XCPFOLIO.', '');
    statusMap.set(asset, 'available');
  });
  
  // Mark sold assets (overrides available if both exist)
  filled.forEach((order: any) => {
    const asset = order.give_asset.replace('XCPFOLIO.', '');
    statusMap.set(asset, 'sold');
  });
  
  // Convert to minimal array format
  const statuses: MinimalStatus[] = Array.from(statusMap.entries()).map(([asset, status]) => ({
    asset,
    status
  }));
  
  // Minimal response - just asset names and their status
  const response = {
    timestamp: Date.now(),
    statuses
  };
  
  return NextResponse.json(response, {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=300, s-maxage=300', // 5 minute cache
    },
  });
}