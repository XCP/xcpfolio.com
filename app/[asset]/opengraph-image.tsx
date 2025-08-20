import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'XCPFOLIO Asset'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image({ params }: { params: { asset: string } }) {
  const asset = params.asset.toUpperCase()
  
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
        }}
      >
        {/* Status Badge */}
        <div
          style={{
            position: 'absolute',
            top: 40,
            right: 40,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '8px 20px',
            borderRadius: '20px',
            fontSize: 24,
            fontWeight: 'bold',
          }}
        >
          AVAILABLE
        </div>

        {/* Asset Name */}
        <div
          style={{
            fontSize: asset.length > 8 ? 100 : 140,
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
            fontSize: 32,
            opacity: 0.9,
            marginBottom: 40,
          }}
        >
          Counterparty Asset Name
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
          }}
        >
          XCPFOLIO
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}