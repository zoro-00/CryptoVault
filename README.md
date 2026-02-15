# 🚀 CryptoVault

A modern, real-time cryptocurrency dashboard built with Next.js 14, featuring live market data, advanced charts, portfolio tracking, and trading capabilities.

![CryptoVault](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

## ✨ Features

### 🌟 Core Features
- **Real-Time Market Data** - Live cryptocurrency prices powered by CoinGecko API
- **Interactive Price Charts** - Beautiful, responsive charts with multiple timeframes (24H, 7D, 30D, 90D)
- **Portfolio Management** - Track your crypto holdings and P/L in real-time
- **Trading Interface** - Simulated trading with order book, market/limit orders, and trade history
- **Crypto News** - Latest news articles with sentiment analysis and category filters
- **Advanced Search** - Search across 1000+ cryptocurrencies

### 🎨 UI/UX
- **Modern Dark Theme** - Sleek glassmorphic design with gradient accents
- **Fully Responsive** - Optimized for desktop, tablet, and mobile devices
- **Smooth Animations** - Polished micro-interactions and transitions
- **Accessibility** - WCAG compliant with keyboard navigation support

### 🔧 Technical
- **Type-Safe** - Full TypeScript implementation
- **Server Components** - Leveraging Next.js 14 App Router
- **Optimized Performance** - Fast page loads and smooth interactions
- **Error Handling** - Comprehensive error states and loading fallbacks

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **UI Components:** [shadcn/ui](https://ui.shadcn.com/)
- **Charts:** [Recharts](https://recharts.org/)
- **Forms:** [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **API:** [CoinGecko API](https://www.coingecko.com/en/api)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Notifications:** [Sonner](https://sonner.emilkowal.ski/)

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- CoinGecko API key ([get one here](https://www.coingecko.com/en/api))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/zoro-00/CryptoVault.git
   cd CryptoVault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Add your CoinGecko API key to `.env.local`**
   ```env
   NEXT_PUBLIC_COINGECKO_API_KEY=your-api-key-here
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Usage

### Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_COINGECKO_API_KEY` | CoinGecko API key for real-time data | Yes |
| `NEXT_PUBLIC_APP_NAME` | Custom app name (default: CryptoVault) | No |

## 📱 Pages

- **`/`** - Homepage with hero section, top cryptocurrencies, and Bitcoin price chart
- **`/markets`** - Complete market overview with sortable cryptocurrency table
- **`/trading`** - Trading interface with order placement and history
- **`/portfolio`** - Portfolio management and performance tracking
- **`/news`** - Cryptocurrency news with filters and search

## 🏗️ Project Structure

```
CryptoVault/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── markets/         # Market data endpoints
│   │   ├── news/            # News endpoints
│   │   ├── portfolio/       # Portfolio endpoints
│   │   └── trading/         # Trading endpoints
│   ├── markets/             # Markets page
│   ├── news/                # News page
│   ├── portfolio/           # Portfolio page
│   ├── trading/             # Trading page
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Homepage
├── components/              # React components
│   ├── ui/                  # shadcn/ui components
│   ├── crypto-header.tsx    # Navigation header
│   ├── crypto-hero.tsx      # Hero section
│   ├── market-overview.tsx  # Market stats cards
│   └── price-chart.tsx      # Bitcoin price chart
├── lib/                     # Utilities and libraries
│   ├── api/                 # API service modules
│   ├── types/               # TypeScript types
│   ├── crypto-api.ts        # CoinGecko API client
│   ├── validation.ts        # Zod schemas
│   └── utils.ts             # Helper functions
└── public/                  # Static assets
```

## 🔌 API Documentation

The app includes mock API routes for demonstration purposes. For production use, replace these with your backend:

- **Markets API** - `/api/markets` - Market data and global statistics
- **Trading API** - `/api/trading` - Order management and trade execution
- **Portfolio API** - `/api/portfolio` - Portfolio CRUD operations
- **News API** - `/api/news` - Cryptocurrency news articles
- **Search API** - `/api/search` - Multi-resource search

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed endpoint specifications.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [CoinGecko](https://www.coingecko.com/) for providing the cryptocurrency data API
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Vercel](https://vercel.com/) for Next.js and hosting platform

## 📧 Contact

Created by [@zoro-00](https://github.com/zoro-00)

---

**⭐ If you like this project, please give it a star on GitHub!**
