import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'How It Works - Buy Counterparty Assets on the DEX | XCPFOLIO',
  description: 'Learn how to purchase premium Counterparty asset names through XCPFOLIO. Simple process: connect wallet, browse assets, buy with XCP, receive instant ownership.',
  keywords: 'how to buy Counterparty assets, XCP DEX, blockchain asset purchase, crypto name marketplace, NFT name purchase guide',
  openGraph: {
    title: 'How to Buy Counterparty Asset Names - XCPFOLIO',
    description: 'Step-by-step guide to purchasing premium Counterparty asset names. Connect your XCP wallet, browse available assets, and complete purchases instantly on the blockchain.',
    url: 'https://xcpfolio.com/how-it-works',
    siteName: 'XCPFOLIO',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How to Buy Counterparty Asset Names - XCPFOLIO',
    description: 'Learn how to purchase premium Counterparty asset names with XCP on XCPFOLIO.',
  },
}

export default function HowItWorksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}