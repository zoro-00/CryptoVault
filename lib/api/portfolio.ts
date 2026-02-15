// Portfolio service - Manage user's crypto portfolio
import type { Portfolio, PortfolioAsset, ApiResponse } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
let portfolios: Map<string, Portfolio[]> = new Map([
  [
    "demo-user",
    [
      {
        id: "portfolio-1",
        userId: "demo-user",
        name: "Main Portfolio",
        assets: [
          {
            id: "asset-1",
            portfolioId: "portfolio-1",
            coinId: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
            amount: 0.5,
            purchasePrice: 40000,
            currentPrice: 43250.5,
            totalValue: 21625.25,
            gain: 1625.25,
            gainPercentage: 8.13,
            purchasedAt: new Date("2024-01-15"),
          },
          {
            id: "asset-2",
            portfolioId: "portfolio-1",
            coinId: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
            amount: 3,
            purchasePrice: 2500,
            currentPrice: 2650.75,
            totalValue: 7952.25,
            gain: 452.25,
            gainPercentage: 6.03,
            purchasedAt: new Date("2024-02-01"),
          },
        ],
        totalValue: 29577.5,
        totalGain: 2077.5,
        totalGainPercentage: 7.56,
        updatedAt: new Date(),
      },
    ],
  ],
]);

/**
 * Get all portfolios for a user
 */
export async function getUserPortfolios(
  userId: string,
): Promise<ApiResponse<Portfolio[]>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];

    return {
      success: true,
      data: userPortfolios,
    };
  } catch (error) {
    console.error("Get portfolios error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get portfolios",
      data: [],
    };
  }
}

/**
 * Get a specific portfolio
 */
export async function getPortfolio(
  userId: string,
  portfolioId: string,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const portfolio = userPortfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    return {
      success: true,
      data: portfolio,
    };
  } catch (error) {
    console.error("Get portfolio error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get portfolio",
    };
  }
}

/**
 * Create a new portfolio
 */
export async function createPortfolio(
  userId: string,
  name: string,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];

    const newPortfolio: Portfolio = {
      id: `portfolio-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      name,
      assets: [],
      totalValue: 0,
      totalGain: 0,
      totalGainPercentage: 0,
      updatedAt: new Date(),
    };

    userPortfolios.push(newPortfolio);
    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      data: newPortfolio,
      message: "Portfolio created successfully",
    };
  } catch (error) {
    console.error("Create portfolio error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create portfolio",
    };
  }
}

/**
 * Update portfolio name
 */
export async function updatePortfolio(
  userId: string,
  portfolioId: string,
  name: string,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const portfolio = userPortfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    portfolio.name = name;
    portfolio.updatedAt = new Date();

    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      data: portfolio,
      message: "Portfolio updated successfully",
    };
  } catch (error) {
    console.error("Update portfolio error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to update portfolio",
    };
  }
}

/**
 * Delete a portfolio
 */
export async function deletePortfolio(
  userId: string,
  portfolioId: string,
): Promise<ApiResponse<void>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const index = userPortfolios.findIndex((p) => p.id === portfolioId);

    if (index === -1) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    userPortfolios.splice(index, 1);
    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      message: "Portfolio deleted successfully",
    };
  } catch (error) {
    console.error("Delete portfolio error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete portfolio",
    };
  }
}

/**
 * Add asset to portfolio
 */
export async function addAssetToPortfolio(
  userId: string,
  portfolioId: string,
  asset: Omit<
    PortfolioAsset,
    "id" | "portfolioId" | "totalValue" | "gain" | "gainPercentage"
  >,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const portfolio = userPortfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    const newAsset: PortfolioAsset = {
      ...asset,
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      portfolioId,
      totalValue: asset.amount * asset.currentPrice,
      gain: (asset.currentPrice - asset.purchasePrice) * asset.amount,
      gainPercentage:
        ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) *
        100,
    };

    portfolio.assets.push(newAsset);

    // Recalculate portfolio totals
    recalculatePortfolioTotals(portfolio);

    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      data: portfolio,
      message: "Asset added successfully",
    };
  } catch (error) {
    console.error("Add asset error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add asset",
    };
  }
}

/**
 * Update asset in portfolio
 */
export async function updateAsset(
  userId: string,
  portfolioId: string,
  assetId: string,
  updates: Partial<
    Pick<PortfolioAsset, "amount" | "purchasePrice" | "currentPrice">
  >,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const portfolio = userPortfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    const asset = portfolio.assets.find((a) => a.id === assetId);

    if (!asset) {
      return {
        success: false,
        error: "Asset not found",
      };
    }

    // Update asset fields
    if (updates.amount !== undefined) asset.amount = updates.amount;
    if (updates.purchasePrice !== undefined)
      asset.purchasePrice = updates.purchasePrice;
    if (updates.currentPrice !== undefined)
      asset.currentPrice = updates.currentPrice;

    // Recalculate asset values
    asset.totalValue = asset.amount * asset.currentPrice;
    asset.gain = (asset.currentPrice - asset.purchasePrice) * asset.amount;
    asset.gainPercentage =
      ((asset.currentPrice - asset.purchasePrice) / asset.purchasePrice) * 100;

    // Recalculate portfolio totals
    recalculatePortfolioTotals(portfolio);

    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      data: portfolio,
      message: "Asset updated successfully",
    };
  } catch (error) {
    console.error("Update asset error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update asset",
    };
  }
}

/**
 * Remove asset from portfolio
 */
export async function removeAssetFromPortfolio(
  userId: string,
  portfolioId: string,
  assetId: string,
): Promise<ApiResponse<Portfolio>> {
  try {
    const userPortfolios = portfolios.get(userId) || [];
    const portfolio = userPortfolios.find((p) => p.id === portfolioId);

    if (!portfolio) {
      return {
        success: false,
        error: "Portfolio not found",
      };
    }

    const assetIndex = portfolio.assets.findIndex((a) => a.id === assetId);

    if (assetIndex === -1) {
      return {
        success: false,
        error: "Asset not found",
      };
    }

    portfolio.assets.splice(assetIndex, 1);

    // Recalculate portfolio totals
    recalculatePortfolioTotals(portfolio);

    portfolios.set(userId, userPortfolios);

    return {
      success: true,
      data: portfolio,
      message: "Asset removed successfully",
    };
  } catch (error) {
    console.error("Remove asset error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove asset",
    };
  }
}

/**
 * Recalculate portfolio totals
 */
function recalculatePortfolioTotals(portfolio: Portfolio): void {
  portfolio.totalValue = portfolio.assets.reduce(
    (sum, asset) => sum + asset.totalValue,
    0,
  );
  portfolio.totalGain = portfolio.assets.reduce(
    (sum, asset) => sum + asset.gain,
    0,
  );

  const totalInvestment = portfolio.assets.reduce(
    (sum, asset) => sum + asset.amount * asset.purchasePrice,
    0,
  );

  portfolio.totalGainPercentage =
    totalInvestment > 0 ? (portfolio.totalGain / totalInvestment) * 100 : 0;

  portfolio.updatedAt = new Date();
}

/**
 * Get portfolio summary
 */
export async function getPortfolioSummary(userId: string): Promise<
  ApiResponse<{
    totalPortfolios: number;
    totalValue: number;
    totalGain: number;
    totalGainPercentage: number;
    totalAssets: number;
  }>
> {
  try {
    const userPortfolios = portfolios.get(userId) || [];

    const summary = {
      totalPortfolios: userPortfolios.length,
      totalValue: userPortfolios.reduce((sum, p) => sum + p.totalValue, 0),
      totalGain: userPortfolios.reduce((sum, p) => sum + p.totalGain, 0),
      totalGainPercentage: 0,
      totalAssets: userPortfolios.reduce((sum, p) => sum + p.assets.length, 0),
    };

    const totalInvestment = summary.totalValue - summary.totalGain;
    summary.totalGainPercentage =
      totalInvestment > 0 ? (summary.totalGain / totalInvestment) * 100 : 0;

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    console.error("Get portfolio summary error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get portfolio summary",
    };
  }
}
