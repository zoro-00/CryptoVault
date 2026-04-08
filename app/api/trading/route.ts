import { NextRequest, NextResponse } from "next/server";
import { getTradingStats } from "@/lib/api/trading";

// GET /api/trading?type=stats&pair=BTC/USDT — Live market stats
export async function GET(request: NextRequest) {
  try {
    const pair = request.nextUrl.searchParams.get("pair") || "BTC/USDT";
    const result = await getTradingStats(pair);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Trading GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
