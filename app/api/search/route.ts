import { NextRequest, NextResponse } from "next/server";
import { searchCryptocurrencies } from "@/lib/api/search";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q") || "";

    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Query parameter 'q' is required and must be at least 2 characters",
        },
        { status: 400 },
      );
    }

    const result = await searchCryptocurrencies(query);

    return NextResponse.json(result, {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    console.error("Search API route error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
