import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'XCPFOLIO - Premium Counterparty Asset Names'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
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
        {/* Logo/Title */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 'bold',
            marginBottom: 20,
            letterSpacing: '-2px',
          }}
        >
          XCPFOLIO
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 36,
            opacity: 0.9,
            marginBottom: 60,
          }}
        >
          Premium Counterparty Asset Names
        </div>

        {/* Example Assets */}
        <div
          style={{
            display: 'flex',
            gap: '30px',
            marginBottom: 60,
          }}
        >
          {['GOLD', 'MUSIC', 'ART', 'COIN'].map((name) => (
            <div
              key={name}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '15px 30px',
                borderRadius: '15px',
                fontSize: 28,
                fontWeight: 'bold',
              }}
            >
              {name}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          style={{
            fontSize: 24,
            opacity: 0.8,
          }}
        >
          Buy and own unique blockchain asset names
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}