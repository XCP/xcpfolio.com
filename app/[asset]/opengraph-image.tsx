import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'XCPFOLIO Asset'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Fetch asset data from our API
async function getAssetData(asset: string) {
  try {
    // Get metadata from our CSV data
    const metadataUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://xcpfolio.com'}/api/${asset}`;
    const metadataResponse = await fetch(metadataUrl, { 
      cache: 'no-store',
      next: { revalidate: 60 }
    });
    const metadata = await metadataResponse.json();
    
    // Get orders to check if available
    const ordersUrl = `https://api.counterparty.io/v2/assets/XCPFOLIO.${asset.toUpperCase()}/orders?status=open`;
    const ordersResponse = await fetch(ordersUrl, { 
      cache: 'no-store',
      next: { revalidate: 60 }
    });
    const ordersData = await ordersResponse.json();
    const orders = ordersData.result || [];
    
    // Determine status
    let status = 'NOT LISTED';
    let price = null;
    
    if (orders.length > 0) {
      status = 'AVAILABLE';
      // Get the lowest price order
      const sellOrders = orders.filter((o: any) => o.give_asset === `XCPFOLIO.${asset.toUpperCase()}`);
      if (sellOrders.length > 0) {
        const lowestPrice = Math.min(...sellOrders.map((o: any) => o.get_quantity / 100000000));
        price = lowestPrice;
      }
    }
    
    // Calculate age if we have first_issued
    let age = null;
    if (metadata.first_issued) {
      const years = Math.floor((Date.now() / 1000 - metadata.first_issued) / (365 * 24 * 60 * 60));
      age = `${years} ${years === 1 ? 'year' : 'years'} old`;
    }
    
    return {
      status,
      price,
      age,
      category: metadata.category || 'Asset',
      length: metadata.length
    };
  } catch (error) {
    console.error('Error fetching asset data:', error);
    return {
      status: 'UNKNOWN',
      price: null,
      age: null,
      category: 'Asset',
      length: null
    };
  }
}

export default async function Image({ params }: { params: Promise<{ asset: string }> }) {
  const resolvedParams = await params;
  const asset = resolvedParams.asset.toUpperCase();
  const data = await getAssetData(asset);
  
  // Determine status badge color
  const statusColor = data.status === 'AVAILABLE' ? '#10b981' : 
                     data.status === 'SOLD' ? '#ef4444' : '#6b7280';
  
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 128,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          position: 'relative',
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            backgroundColor: statusColor,
            padding: '10px 24px',
            borderRadius: '24px',
            fontSize: 20,
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {data.status}
        </div>

        {/* Asset Name */}
        <div
          style={{
            fontSize: asset.length > 8 ? 90 : asset.length > 6 ? 110 : 130,
            fontWeight: 'bold',
            marginBottom: 20,
            letterSpacing: '-2px',
          }}
        >
          {asset}
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 28,
            opacity: 0.9,
            marginBottom: 40,
          }}
        >
          Counterparty Asset Name
        </div>

        {/* Info Pills */}
        <div
          style={{
            display: 'flex',
            gap: '20px',
            marginBottom: 40,
          }}
        >
          {data.price && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontWeight: 'bold' }}>{data.price} XCP</span>
            </div>
          )}
          
          {data.age && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>🕰️</span>
              <span>{data.age}</span>
            </div>
          )}
          
          {data.length && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span>{data.length} chars</span>
            </div>
          )}
          
          {data.category && (
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '12px 24px',
                borderRadius: '20px',
                fontSize: 24,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {data.category}
            </div>
          )}
        </div>

        {/* XCPFOLIO Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            display: 'flex',
            alignItems: 'center',
            fontSize: 28,
            fontWeight: 'bold',
            opacity: 0.9,
          }}
        >
          XCPFOLIO.com
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}