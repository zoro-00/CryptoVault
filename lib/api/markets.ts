// Markets service - Get market data, trending coins, gainers/losers
import type { ApiResponse, CryptoPrice } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
  "https://api.coingecko.com/api/v3";
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
const DEFAULT_CURRENCY = process.env.NEXT_PUBLIC_DEFAULT_CURRENCY || "usd";

/**
 * Get market overview with top cryptocurrencies
 */
export async function getMarketOverview(options: {
  limit?: number;
  page?: number;
  sortBy?: "market_cap_desc" | "volume_desc" | "price_desc" | "price_asc";
  category?: string;
}): Promise<ApiResponse<CryptoPrice[]>> {
  try {
    const {
      limit = 100,
      page = 1,
      sortBy = "market_cap_desc",
      category,
    } = options;

    const url = new URL(`${API_BASE_URL}/coins/markets`);
    url.searchParams.append("vs_currency", DEFAULT_CURRENCY);
    url.searchParams.append("order", sortBy);
    url.searchParams.append("per_page", limit.toString());
    url.searchParams.append("page", page.toString());
    url.searchParams.append("sparkline", "true");
    url.searchParams.append("price_change_percentage", "1h,24h,7d");

    if (category) {
      url.searchParams.append("category", category);
    }

    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Markets API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get market overview error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get market overview",
      data: getMockMarketData(),
    };
  }
}

/**
 * Get trending cryptocurrencies
 */
export async function getTrendingCoins(): Promise<ApiResponse<any[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/search/trending`);
    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Trending API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.coins || [],
    };
  } catch (error) {
    console.error("Get trending coins error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get trending coins",
      data: [],
    };
  }
}

/**
 * Get top gainers (24h)
 */
export async function getTopGainers(
  limit: number = 10,
): Promise<ApiResponse<CryptoPrice[]>> {
  try {
    const result = await getMarketOverview({
      limit: 100,
      sortBy: "market_cap_desc",
    });

    if (result.success && result.data) {
      const gainers = result.data
        .filter((coin) => coin.price_change_percentage_24h > 0)
        .sort(
          (a, b) =>
            b.price_change_percentage_24h - a.price_change_percentage_24h,
        )
        .slice(0, limit);

      return {
        success: true,
        data: gainers,
      };
    }

    return result;
  } catch (error) {
    console.error("Get top gainers error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get top gainers",
      data: [],
    };
  }
}

/**
 * Get top losers (24h)
 */
export async function getTopLosers(
  limit: number = 10,
): Promise<ApiResponse<CryptoPrice[]>> {
  try {
    const result = await getMarketOverview({
      limit: 100,
      sortBy: "market_cap_desc",
    });

    if (result.success && result.data) {
      const losers = result.data
        .filter((coin) => coin.price_change_percentage_24h < 0)
        .sort(
          (a, b) =>
            a.price_change_percentage_24h - b.price_change_percentage_24h,
        )
        .slice(0, limit);

      return {
        success: true,
        data: losers,
      };
    }

    return result;
  } catch (error) {
    console.error("Get top losers error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get top losers",
      data: [],
    };
  }
}

/**
 * Get global market data
 */
export async function getGlobalMarketData(): Promise<ApiResponse<any>> {
  try {
    const url = new URL(`${API_BASE_URL}/global`);
    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Global data API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Get global market data error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get global market data",
      data: getMockGlobalData(),
    };
  }
}

/**
 * Get market categories
 */
export async function getMarketCategories(): Promise<ApiResponse<any[]>> {
  try {
    const url = new URL(`${API_BASE_URL}/coins/categories`);
    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Categories API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data: data.slice(0, 20), // Return top 20 categories
    };
  } catch (error) {
    console.error("Get market categories error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get market categories",
      data: [],
    };
  }
}

/**
 * Mock market data for development
 */
function getMockMarketData(): CryptoPrice[] {
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

/**
 * Mock global data
 */
function getMockGlobalData() {
  return {
    total_market_cap: { usd: 2450000000000 },
    total_volume: { usd: 89500000000 },
    market_cap_percentage: { btc: 52.3, eth: 17.8 },
    market_cap_change_percentage_24h_usd: 3.2,
    active_cryptocurrencies: 13847,
    markets: 952,
  };
}
