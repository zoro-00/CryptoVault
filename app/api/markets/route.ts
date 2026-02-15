import { NextRequest, NextResponse } from "next/server";
import {
  getMarketOverview,
  getTrendingCoins,
  getTopGainers,
  getTopLosers,
  getGlobalMarketData,
  getMarketCategories,
} from "@/lib/api/markets";

// GET /api/markets - Get market data
// GET /api/markets?type=trending - Get trending coins
// GET /api/markets?type=gainers - Get top gainers
// GET /api/markets?type=losers - Get top losers
// GET /api/markets?type=global - Get global market data
// GET /api/markets?type=categories - Get market categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const limit = parseInt(searchParams.get("limit") || "100");
    const page = parseInt(searchParams.get("page") || "1");
    const sortBy = (searchParams.get("sortBy") as any) || "market_cap_desc";
    const category = searchParams.get("category") || undefined;

    switch (type) {
      case "trending":
        const trendingResult = await getTrendingCoins();
        return NextResponse.json(trendingResult);

      case "gainers":
        const gainersResult = await getTopGainers(limit);
        return NextResponse.json(gainersResult);

      case "losers":
        const losersResult = await getTopLosers(limit);
        return NextResponse.json(losersResult);

      case "global":
        const globalResult = await getGlobalMarketData();
        return NextResponse.json(globalResult);

      case "categories":
        const categoriesResult = await getMarketCategories();
        return NextResponse.json(categoriesResult);

      default:
        const result = await getMarketOverview({
          limit,
          page,
          sortBy,
          category,
        });
        return NextResponse.json(result);
    }
  } catch (error) {
    console.error("Markets API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
