// Crypto data service
export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  image: string;
  market_cap_rank: number;
  high_24h: number;
  low_24h: number;
}

export interface PriceHistory {
  prices: [number, number][];
  market_caps: [number, number][];
  total_volumes: [number, number][];
}

// API Configuration from environment variables
const API_BASE_URL =
  process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
  "https://api.coingecko.com/api/v3";
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "usd";

// Helper to build API URL with optional API key
const buildApiUrl = (
  endpoint: string,
  params: Record<string, string> = {},
): string => {
  const url = new URL(`${API_BASE_URL}${endpoint}`);
  Object.entries(params).forEach(([key, value]) =>
    url.searchParams.append(key, value),
  );
  if (API_KEY) {
    url.searchParams.append("x_cg_demo_api_key", API_KEY);
  }
  return url.toString();
};

// Using CoinGecko free API (demo data for development)
export const cryptoApi = {
  async getTopCryptos(limit = 10): Promise<CryptoPrice[]> {
    try {
      const url = buildApiUrl("/coins/markets", {
        vs_currency: DEFAULT_CURRENCY,
        order: "market_cap_desc",
        per_page: limit.toString(),
        page: "1",
        sparkline: "false",
        price_change_percentage: "24h",
      });
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch {
      return getMockCryptoData();
    }
  },

  async getCryptoHistory(coinId: string, days = 7): Promise<PriceHistory> {
    try {
      const url = buildApiUrl(`/coins/${coinId}/market_chart`, {
        vs_currency: DEFAULT_CURRENCY,
        days: days.toString(),
      });
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return await response.json();
    } catch {
      return getMockPriceHistory();
    }
  },
};

// Mock data for development/fallback
function getMockCryptoData(): CryptoPrice[] {
  return [
    {
      id: "bitcoin",
      symbol: "btc",
      name: "Bitcoin",
      current_price: 43250.5,
      price_change_percentage_24h: 2.45,
      market_cap: 847350000000,
      total_volume: 25400000000,
      image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      market_cap_rank: 1,
      high_24h: 43800.25,
      low_24h: 42100.75,
    },
    {
      id: "ethereum",
      symbol: "eth",
      name: "Ethereum",
      current_price: 2650.75,
      price_change_percentage_24h: -1.25,
      market_cap: 318750000000,
      total_volume: 12300000000,
      image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      market_cap_rank: 2,
      high_24h: 2720.5,
      low_24h: 2580.25,
    },
    {
      id: "binancecoin",
      symbol: "bnb",
      name: "BNB",
      current_price: 315.25,
      price_change_percentage_24h: 0.85,
      market_cap: 48750000000,
      total_volume: 1850000000,
      image:
        "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
      market_cap_rank: 3,
      high_24h: 320.75,
      low_24h: 310.5,
    },
  ];
}

function getMockPriceHistory(): PriceHistory {
  const now = Date.now();
  const prices: [number, number][] = [];

  for (let i = 0; i < 7; i++) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const price = 43000 + Math.random() * 2000;
    prices.unshift([timestamp, price]);
  }

  return {
    prices,
    market_caps: prices.map(([time, price]) => [time, price * 19400000]),
    total_volumes: prices.map(([time, price]) => [time, price * 580000]),
  };
}

export const formatCurrency = (amount: number): string => {
  if (amount == null || isNaN(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatLargeNumber = (num: number): string => {
  if (num == null || isNaN(num)) return "$0.00";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
};

export const formatPercentage = (percentage: number): string => {
  const sign = percentage >= 0 ? "+" : "";
  return `${sign}${percentage.toFixed(2)}%`;
};
