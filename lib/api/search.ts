// Search service for cryptocurrencies
import type { SearchResult, ApiResponse } from "@/lib/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_COINGECKO_API_URL ||
  "https://api.coingecko.com/api/v3";
const API_KEY = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";

/**
 * Search for cryptocurrencies by name or symbol
 */
export async function searchCryptocurrencies(
  query: string,
): Promise<ApiResponse<SearchResult[]>> {
  try {
    if (!query || query.trim().length < 2) {
      return {
        success: true,
        data: [],
        message: "Query too short",
      };
    }

    const url = new URL(`${API_BASE_URL}/search`);
    url.searchParams.append("query", query.trim());
    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`Search API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Transform API response to our SearchResult format
    const results: SearchResult[] = [];

    // Add coins
    if (data.coins && Array.isArray(data.coins)) {
      results.push(
        ...data.coins.slice(0, 10).map((coin: any) => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          name: coin.name,
          type: "crypto" as const,
          image: coin.thumb || coin.large,
          market_cap_rank: coin.market_cap_rank,
        })),
      );
    }

    return {
      success: true,
      data: results,
    };
  } catch (error) {
    console.error("Search error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Search failed",
      data: getMockSearchResults(query),
    };
  }
}

/**
 * Get detailed information about a specific cryptocurrency
 */
export async function getCryptoDetails(
  coinId: string,
): Promise<ApiResponse<any>> {
  try {
    const url = new URL(`${API_BASE_URL}/coins/${coinId}`);
    url.searchParams.append("localization", "false");
    url.searchParams.append("tickers", "false");
    url.searchParams.append("community_data", "false");
    url.searchParams.append("developer_data", "false");
    if (API_KEY) {
      url.searchParams.append("x_cg_demo_api_key", API_KEY);
    }

    const response = await fetch(url.toString(), {
      next: { revalidate: 60 }, // Cache for 1 minute
    });

    if (!response.ok) {
      throw new Error(`Details API error: ${response.statusText}`);
    }

    const data = await response.json();

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Get crypto details error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get details",
    };
  }
}

/**
 * Mock search results for development/fallback
 */
function getMockSearchResults(query: string): SearchResult[] {
  const mockData: SearchResult[] = [
    {
      id: "bitcoin",
      symbol: "BTC",
      name: "Bitcoin",
      type: "crypto",
      image: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
      current_price: 43250.5,
      market_cap: 847350000000,
      market_cap_rank: 1,
    },
    {
      id: "ethereum",
      symbol: "ETH",
      name: "Ethereum",
      type: "crypto",
      image: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
      current_price: 2650.75,
      market_cap: 318750000000,
      market_cap_rank: 2,
    },
    {
      id: "binancecoin",
      symbol: "BNB",
      name: "BNB",
      type: "crypto",
      image:
        "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
      current_price: 315.25,
      market_cap: 48750000000,
      market_cap_rank: 3,
    },
    {
      id: "solana",
      symbol: "SOL",
      name: "Solana",
      type: "crypto",
      image: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
      current_price: 98.45,
      market_cap: 42350000000,
      market_cap_rank: 4,
    },
    {
      id: "cardano",
      symbol: "ADA",
      name: "Cardano",
      type: "crypto",
      image: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
      current_price: 0.52,
      market_cap: 18250000000,
      market_cap_rank: 5,
    },
  ];

  const lowerQuery = query.toLowerCase();
  return mockData.filter(
    (item) =>
      item.name.toLowerCase().includes(lowerQuery) ||
      item.symbol.toLowerCase().includes(lowerQuery),
  );
}
