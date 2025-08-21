import { Metadata } from 'next'

type Props = {
  params: Promise<{ asset: string }>
  children: React.ReactNode
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const asset = resolvedParams.asset.toUpperCase()
  
  // Fetch status from our API to get price and availability
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://xcpfolio.com'}/api/status/${asset}`, {
      next: { revalidate: 60 }
    })
    
    if (response.ok) {
      const data = await response.json()
      
      let title = `${asset} - Counterparty Asset Name`
      let description = `Own the ${asset} Counterparty asset name. `
      
      if (data.status === 'AVAILABLE' && data.price) {
        title = `${asset} - ${data.price} XCP | XCPFOLIO`
        description = `Buy ${asset} for ${data.price} XCP. ${data.category} Counterparty asset name${data.length ? ` (${data.length} characters)` : ''}. Instant ownership transfer on the Bitcoin blockchain.`
      } else if (data.status === 'SOLD') {
        title = `${asset} - Sold | XCPFOLIO`
        description = `${asset} has been sold. Browse other premium Counterparty asset names available for purchase.`
      } else {
        title = `${asset} - Not Listed | XCPFOLIO`
        description = `${asset} is not currently listed for sale. Check back later or browse other available Counterparty asset names.`
      }
      
      return {
        title,
        description,
        keywords: `${asset}, Counterparty, XCP, blockchain asset, crypto name, NFT name, ${data.category || 'asset'}`,
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