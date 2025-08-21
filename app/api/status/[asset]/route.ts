import { NextResponse } from 'next/server';
import { getAssetOrders, getAssetOrderMatches, getDetailedAsset, getAssetMetadata, formatAge } from '@/lib/api';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ asset: string }> }
) {
  const resolvedParams = await params;
  const asset = resolvedParams.asset.toUpperCase();
  
  try {
    // Fetch all data in parallel
    const [orders, orderMatches, detailedAsset, metadataInfo] = await Promise.all([
      getAssetOrders(asset),
      getAssetOrderMatches(asset),
      getDetailedAsset(asset),
      getAssetMetadata(false)
    ]);
    
    const metadata = metadataInfo?.metadata?.[asset];
    
    // Determine status (same logic as main app)
    const isSold = orderMatches.length > 0;
    const hasOrders = orders.length > 0;
    
    let status = 'NOT LISTED';
    let price = null;
    
    if (isSold) {
      status = 'SOLD';
    } else if (hasOrders) {
      status = 'AVAILABLE';
      // Get the price from the first order (same as displayOrder logic)
      const firstOrder = orders[0];
      if (firstOrder && firstOrder.get_quantity) {
        price = firstOrder.get_quantity / 100000000; // Convert from satoshis to XCP
      }
    }
    
    // Calculate age - prefer CSV data, fallback to blockchain data
    let age = null;
    const timestamp = metadata?.first_issued || detailedAsset?.first_issuance_block_time;
    if (timestamp) {
      const years = Math.floor((Date.now() / 1000 - timestamp) / (365 * 24 * 60 * 60));
      age = years;
    }
    
    // Build response
    const response = {
      asset,
      status,
      price,
      age,
      ageText: age ? `${age} ${age === 1 ? 'year' : 'years'} old` : null,
      category: metadata?.category || 'Asset',
      length: metadata?.length || asset.length,
      owner: detailedAsset?.owner || null,
      issuer: detailedAsset?.issuer || null,
      supply: detailedAsset?.supply || 0,
      divisible: detailedAsset?.divisible || false,
      locked: detailedAsset?.locked || false,
      description: detailedAsset?.description || '',
      first_issuance_time: detailedAsset?.first_issuance_block_time || null,
      registrationDate: detailedAsset?.first_issuance_block_time 
        ? formatAge(detailedAsset.first_issuance_block_time)
        : null
    };
    
    return NextResponse.json(response, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120', // Cache for 1 minute
      },
    });
  } catch (error) {
    console.error('Error fetching asset status:', error);
    
    return NextResponse.json(
      { 
        asset,
        status: 'UNKNOWN',
        error: 'Failed to fetch asset status' 
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}