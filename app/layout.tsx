import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from './providers';
import { FathomAnalytics } from './fathom';
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "XCPFOLIO - Premium Counterparty Asset Names",
  description: "Browse and purchase premium Counterparty blockchain asset names. Unique, memorable names for tokens, NFTs, and digital assets on Bitcoin.",
  keywords: "Counterparty, XCP, blockchain assets, crypto names, NFT names, Bitcoin tokens, asset marketplace",
  authors: [{ name: "21e14" }],
  creator: "21e14",
  publisher: "XCPFOLIO",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: "XCPFOLIO - Premium Counterparty Asset Names",
    description: "Browse and purchase premium Counterparty blockchain asset names. Unique, memorable names for your blockchain projects.",
    url: "https://xcpfolio.com",
    siteName: "XCPFOLIO",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XCPFOLIO - Counterparty Asset Marketplace"
      }
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XCPFOLIO - Premium Counterparty Asset Names",
    description: "Browse and purchase premium Counterparty blockchain asset names",
    images: ["/og-image.png"],
    creator: "@droplister",
  },
  metadataBase: new URL("https://xcpfolio.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-inter antialiased">
        <FathomAnalytics />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
