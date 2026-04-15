# 🚀 CryptoVault

A comprehensive **Web3 cryptocurrency platform** built with Next.js 14. CryptoVault bridges traditional finance and decentralized finance (DeFi) — combining real-time market data, cross-chain portfolio tracking, decentralized swaps, and a native fiat-to-crypto on-ramp powered by Transak.

![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)
![Web3](https://img.shields.io/badge/Web3-MetaMask_&_Phantom-purple?style=flat-square)
![Transak](https://img.shields.io/badge/On--Ramp-Transak-1eb67e?style=flat-square)
![License](https://img.shields.io/badge/license-MIT-green?style=flat-square)

---

## ✨ Features

### 🔌 Non-Custodial Wallet Integration
- Connect **MetaMask** (EVM — Ethereum, Polygon, Arbitrum, Optimism, BSC) and **Phantom** (Solana)
- Live native balance display with one-click chain switching
- Wallet address displayed in profile badge — no passwords, no custodians

### 📊 Real-Time Market Data
- Live crypto rates powered by the **CoinGecko API**
- Interactive price charts with **24H / 7D / 30D / 90D** timeframes built in Recharts
- Full market table with volume, 24h change, and market cap — 1,000+ assets

### 💱 Decentralized Swaps
- **EVM swaps** via **ParaSwap** — deep aggregated liquidity across DEXes
- **Solana swaps** via **Jupiter** — best-route SPL token swaps
- Real token approval flow, slippage control, and live balance validation

### 💳 Fiat On-Ramp (Buy Crypto)
- Purchase **ETH, BTC, or SOL** directly with a credit/debit card via **Transak**
- Live price calculation using CoinGecko market rates
- Wallet address auto-filled from connected MetaMask — non-custodial delivery
- Saved payment methods persist across sessions via `localStorage`

### 🔔 Live Notifications
- Real market pulse alerts powered by live CoinGecko data
- Unread badge counter, "Mark all as read", and toast delivery
- Notification preferences persistent via `localStorage`

### 👤 Profile Management
- Edit display name and email — persisted to `localStorage` across reloads
- Linked wallet address badge in profile drawer
- **Settings** tab: toggle notifications and price alerts
- **Payment** tab: add/remove saved cards (persisted in `localStorage`)

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router), React 18, TypeScript 5 |
| **Styling / UI** | Tailwind CSS, shadcn/ui, Radix Primitives, Sonner (toasts) |
| **Web3 (EVM)** | Ethers.js, Alchemy SDK, MetaMask (`window.ethereum`) |
| **Web3 (Solana)** | `@solana/web3.js`, Phantom (`window.solana`) |
| **DEX Aggregators** | ParaSwap API (EVM), Jupiter API (Solana) |
| **Market Data** | CoinGecko REST API |
| **Charts** | Recharts |
| **Fiat On-Ramp** | Transak (staging + production) |

---

## 📦 Getting Started

### Prerequisites

- Node.js **18+** and `npm`
- [MetaMask](https://metamask.io/) browser extension
- [Phantom](https://phantom.app/) browser extension *(for Solana)*
- API keys (see environment setup below)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/zoro-00/CryptoVault.git
cd CryptoVault

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env.local   # or create .env.local manually

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

### 🔑 Environment Variables

Create a `.env.local` file in the project root and add the following keys:

```env
# CoinGecko — Market data (free tier available)
# https://www.coingecko.com/en/api
NEXT_PUBLIC_COINGECKO_API_KEY=your_coingecko_key

# Alchemy — On-chain wallet portfolio data
# https://www.alchemy.com/
ALCHEMY_API_KEY=your_alchemy_key

# Transak — Fiat to crypto on-ramp (staging sandbox)
# Register free at https://dashboard.transak.com
# Click "Add New Integration" → "On-Ramp" → "Staging"
NEXT_PUBLIC_TRANSAK_API_KEY=your_transak_staging_key

# App Config
NEXT_PUBLIC_APP_NAME=CryptoVault
NEXT_PUBLIC_DEFAULT_CURRENCY=usd
NEXT_PUBLIC_MARKET_REFRESH_INTERVAL=60000
NEXT_PUBLIC_HERO_REFRESH_INTERVAL=30000
NEXT_PUBLIC_DEFAULT_CRYPTO_LIMIT=10
```

---

## 🌐 Application Routes

| Route | Description |
|---|---|
| `/` | Dashboard hero, live BTC ticker, and market spotlights |
| `/markets` | Full sortable asset table with live prices and 24h data |
| `/portfolio` | Connect MetaMask/Phantom, view on-chain ERC-20 tokens |
| `/swap` | Decentralized token swaps (ParaSwap for EVM, Jupiter for Solana) |
| `/buy` | Fiat on-ramp — purchase ETH/BTC/SOL with card via Transak |
| `/news` | Aggregated crypto news feed |

---

## 💳 Using the Fiat On-Ramp (Buy Page)

1. Navigate to `/buy`
2. Connect your MetaMask wallet (your address is auto-filled as the delivery address)
3. Enter a USD amount (minimum $30)
4. Select your desired cryptocurrency (ETH, BTC, or SOL)
5. Click **"Buy via Transak"** — a secure Transak popup will open
6. Use the sandbox test card to complete the purchase:

```
Card Number : 4111 1111 1111 1111
Expiry      : 12/26
CVV         : 123
```

> **Note:** The Transak staging key must be set in `.env.local` before this feature is active. Register free at [dashboard.transak.com](https://dashboard.transak.com).

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 🙏 Acknowledgments

- **Alchemy** — Enterprise-grade on-chain node infrastructure
- **CoinGecko** — Market data backbone
- **ParaSwap & Jupiter** — DEX aggregation and deep liquidity routing
- **Transak** — Regulated fiat-to-crypto on-ramp gateway
- **Vercel** — Edge deployment platform
