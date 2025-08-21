import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'XCPFOLIO Asset'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

// Fetch asset data from our status API
async function getAssetData(asset: string) {
  try {
    // Use our centralized status API endpoint
    const statusUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://xcpfolio.com'}/api/status/${asset}`;
    const response = await fetch(statusUrl, { 
      cache: 'no-store',
      next: { revalidate: 60 }
    });
    
    if (!response.ok) {
      throw new Error(`Status API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      status: data.status,
      price: data.price,
      age: data.ageText,
      category: data.category,
      length: data.length
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