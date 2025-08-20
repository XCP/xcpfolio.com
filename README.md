# XCPFOLIO - Counterparty Asset Name Marketplace

A marketplace for premium Counterparty asset names, enabling users to browse and purchase unique blockchain assets through the Counterparty DEX.

🌐 **Live at**: [xcpfolio.com](https://xcpfolio.com)

## 🚀 Features

- **Browse 200+ Premium Assets**: Curated collection of memorable Counterparty asset names
- **Smart Filtering & Search**: Filter by category, length, price, and age
- **XCP Wallet Integration**: Connect wallet to purchase assets directly on-chain
- **Real-time DEX Data**: Live order book and pricing from Counterparty
- **Mobile Optimized**: Responsive design for all devices
- **Privacy-First Analytics**: Fathom Analytics integration
- **Asset Metadata API**: JSON endpoints for each asset

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: XCP Wallet Extension integration
- **APIs**: Counterparty API v2, XCP.io
- **Analytics**: Fathom Analytics
- **Deployment**: Vercel

## 📦 Quick Start

1. Clone the repository:
```bash
git clone https://github.com/XCP/xcpfolio.com.git
cd xcpfolio.com
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

4. (Optional) Add your Fathom Analytics site ID:
```
NEXT_PUBLIC_FATHOM_SITE_ID=YOUR_SITE_ID
```

5. Run development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/XCP/xcpfolio.com)

1. Click the deploy button above
2. Add environment variables in Vercel dashboard (optional):
   - `NEXT_PUBLIC_FATHOM_SITE_ID`
3. Deploy!

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_FATHOM_SITE_ID` | No | Fathom Analytics site ID for privacy-first tracking |

## 🏗️ Project Structure

```
├── app/                  # Next.js App Router
│   ├── [asset]/         # Dynamic asset detail pages
│   ├── api/            # API routes
│   │   └── [asset]/    # JSON metadata endpoints
│   ├── how-it-works/   # How it works page
│   ├── fathom.tsx      # Analytics component
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Homepage
├── components/         # Reusable React components
│   ├── AssetCard.tsx
│   ├── AssetGrid.tsx
│   ├── Header.tsx
│   └── WalletButton.tsx
├── contexts/          # React Context providers
│   └── Web3Context.tsx
├── lib/              # Utilities and API functions
│   ├── api.ts        # Counterparty API integration
│   └── metadata.ts   # Asset metadata
├── public/           # Static assets
└── hooks/           # Custom React hooks
```

## 🔌 API Endpoints

### Asset Metadata
- `GET /api/[asset]` - Returns JSON metadata for any asset
- CORS enabled for cross-origin access
- Used in Counterparty asset descriptions

### External APIs Used
- **Counterparty API v2**: Asset data, orders, transactions
- **XCP.io API**: Additional blockchain data
- **XCP Wallet Extension**: Web3 transactions

## 🔐 Security & Privacy

- No server-side wallet operations
- Environment variables for sensitive configuration
- Privacy-focused analytics (no personal data collection)
- All transactions handled client-side via XCP Wallet

## 📊 Analytics Events

Tracked events (via Fathom):
- Page views
- `purchase_clicked` - When user clicks purchase button
- `inquire_clicked` - When user clicks inquire for unlisted assets

## 🧪 Development

### Commands

```bash
npm run dev        # Development server with hot reload
npm run build      # Production build
npm run start      # Start production server
npm run lint       # Run ESLint
npm run type-check # TypeScript type checking
```

### Testing Checklist

- [ ] Asset grid loads and displays correctly
- [ ] Search/filter functionality works
- [ ] Asset detail pages load
- [ ] XCP Wallet connection works
- [ ] Purchase flow initiates correctly
- [ ] Mobile responsive design
- [ ] JSON API endpoints return correct data

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 📞 Support

- **Email**: dan@droplister.com
- **GitHub Issues**: [github.com/XCP/xcpfolio.com/issues](https://github.com/XCP/xcpfolio.com/issues)
- **Twitter**: [@droplister](https://twitter.com/droplister)

## 🔗 Links

- **Production Site**: [xcpfolio.com](https://xcpfolio.com)
- **GitHub Repository**: [github.com/XCP/xcpfolio.com](https://github.com/XCP/xcpfolio.com)
- **Counterparty Protocol**: [counterparty.io](https://counterparty.io)
- **XCP Wallet Extension**: [Chrome Web Store](https://chromewebstore.google.com/detail/xcp-wallet/kbhdnpfnpdopceagifbmogmoapchoalk)

## 🚧 Beta Status

This marketplace is in beta. Current limitations:
- Purchase flow requires XCP Wallet Extension
- Some assets may show outdated pricing (cache delay)
- Limited to desktop browsers with extension support

## 🎯 Roadmap

- [ ] Mobile wallet support
- [ ] Batch purchasing
- [ ] Price alerts
- [ ] Asset watchlist
- [ ] Historical price charts
- [ ] Advanced filtering options

---

Built with ❤️ for the Counterparty community by [21e14](https://21e14.com)