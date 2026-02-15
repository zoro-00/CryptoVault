import { NextRequest, NextResponse } from "next/server";
import {
  getUserPortfolios,
  getPortfolio,
  createPortfolio,
  updatePortfolio,
  deletePortfolio,
  addAssetToPortfolio,
  updateAsset,
  removeAssetFromPortfolio,
  getPortfolioSummary,
} from "@/lib/api/portfolio";

// GET /api/portfolio - Get all portfolios
// GET /api/portfolio?id=xxx - Get specific portfolio
// GET /api/portfolio?summary=true - Get portfolio summary
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user";
    const portfolioId = searchParams.get("id");
    const getSummary = searchParams.get("summary") === "true";

    if (getSummary) {
      const result = await getPortfolioSummary(userId);
      return NextResponse.json(result);
    }

    if (portfolioId) {
      const result = await getPortfolio(userId, portfolioId);
      return NextResponse.json(result, {
        status: result.success ? 200 : 404,
      });
    }

    const result = await getUserPortfolios(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Portfolio GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/portfolio - Create portfolio or add asset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user";

    // Add asset to portfolio
    if (body.action === "addAsset") {
      if (!body.portfolioId || !body.asset) {
        return NextResponse.json(
          { success: false, error: "Portfolio ID and asset data are required" },
          { status: 400 },
        );
      }

      const result = await addAssetToPortfolio(
        userId,
        body.portfolioId,
        body.asset,
      );
      return NextResponse.json(result, {
        status: result.success ? 200 : 400,
      });
    }

    // Create new portfolio
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Portfolio name is required" },
        { status: 400 },
      );
    }

    const result = await createPortfolio(userId, body.name);
    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("Portfolio POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/portfolio - Update portfolio or asset
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user";

    if (!body.portfolioId) {
      return NextResponse.json(
        { success: false, error: "Portfolio ID is required" },
        { status: 400 },
      );
    }

    // Update asset
    if (body.assetId) {
      const result = await updateAsset(
        userId,
        body.portfolioId,
        body.assetId,
        body.updates,
      );
      return NextResponse.json(result);
    }

    // Update portfolio name
    if (!body.name) {
      return NextResponse.json(
        { success: false, error: "Portfolio name is required" },
        { status: 400 },
      );
    }

    const result = await updatePortfolio(userId, body.portfolioId, body.name);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Portfolio PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/portfolio - Delete portfolio or remove asset
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user";
    const portfolioId = searchParams.get("portfolioId");
    const assetId = searchParams.get("assetId");

    if (!portfolioId) {
      return NextResponse.json(
        { success: false, error: "Portfolio ID is required" },
        { status: 400 },
      );
    }

    // Remove asset from portfolio
    if (assetId) {
      const result = await removeAssetFromPortfolio(
        userId,
        portfolioId,
        assetId,
      );
      return NextResponse.json(result);
    }

    // Delete portfolio
    const result = await deletePortfolio(userId, portfolioId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Portfolio DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
