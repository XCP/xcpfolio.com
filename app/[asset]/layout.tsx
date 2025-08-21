import { Metadata } from 'next'

type Props = {
  params: Promise<{ asset: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const asset = resolvedParams.asset.toUpperCase()
  
  // Fetch from static JSON files
  try {
    const assetResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://xcpfolio.com'}/data/assets/${asset}.json`, {
      next: { revalidate: 60 }
    })
    
    if (assetResponse.ok) {
      const assetData = await assetResponse.json()
      
      // Parse status and price from description
      let status = 'NOT LISTED'
      let price = null
      
      if (assetData.description.includes('🟢 FOR SALE:')) {
        status = 'AVAILABLE'
        const priceMatch = assetData.description.match(/for (\d+(?:\.\d+)?) XCP/)
        if (priceMatch) {
          price = parseFloat(priceMatch[1])
        }
      } else if (assetData.description.includes('🔴 SOLD:')) {
        status = 'SOLD'
      }
      
      // Fetch metadata from status.json
      let category = 'Asset'
      let length = null
      
      const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://xcpfolio.com'}/data/status.json`, {
        next: { revalidate: 60 }
      })
      
      if (statusResponse.ok) {
        const statusData = await statusResponse.json()
        const assetInfo = statusData.assets?.find((a: any) => a.asset === asset)
        if (assetInfo) {
          category = assetInfo.category || 'Asset'
          length = assetInfo.length
        }
      }
      
      let title = `${asset} - Counterparty Asset Name`
      let description = `Own the ${asset} Counterparty asset name. `
      
      if (status === 'AVAILABLE' && price) {
        title = `${asset} - ${price} XCP | XCPFOLIO`
        description = `Buy ${asset} for ${price} XCP. ${category} Counterparty asset name${length ? ` (${length} characters)` : ''}. Instant ownership transfer on the Bitcoin blockchain.`
      } else if (status === 'SOLD') {
        title = `${asset} - Sold | XCPFOLIO`
        description = `${asset} has been sold. Browse other premium Counterparty asset names available for purchase.`
      } else {
        title = `${asset} - Not Listed | XCPFOLIO`
        description = `${asset} is not currently listed for sale. Check back later or browse other available Counterparty asset names.`
      }
      
      return {
        title,
        description,
        keywords: `${asset}, Counterparty, XCP, blockchain asset, crypto name, NFT name, ${category || 'asset'}`,
        openGraph: {
          title,
          description,
          url: `https://xcpfolio.com/${asset}`,
          siteName: 'XCPFOLIO',
          type: 'website',
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
        },
      }
    }
  } catch (error) {
    console.error('Error fetching metadata:', error)
  }
  
  // Fallback metadata
  return {
    title: `${asset} - Counterparty Asset Name | XCPFOLIO`,
    description: `View details and purchase information for the ${asset} Counterparty asset name on XCPFOLIO.`,
    keywords: `${asset}, Counterparty, XCP, blockchain asset, crypto name, NFT name`,
  }
}

export default function AssetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}