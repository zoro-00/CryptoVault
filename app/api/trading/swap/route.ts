import { NextRequest, NextResponse } from "next/server";
import { buildParaSwapTransaction, buildJupiterSwap } from "@/lib/api/trading";

// POST /api/trading/swap
// Body for EVM: { network, srcToken, destToken, srcAmount, destAmount, priceRoute, userAddress, slippage? }
// Body for Solana: { network: "solana", quoteResponse, userPublicKey }
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const network = body.network;

    // ── Solana (Jupiter) ──────────────────────────────────────────
    if (network === "solana") {
      if (!body.quoteResponse || !body.userPublicKey) {
        return NextResponse.json(
          { success: false, error: "quoteResponse and userPublicKey are required" },
          { status: 400 }
        );
      }

      const result = await buildJupiterSwap({
        quoteResponse: body.quoteResponse,
        userPublicKey: body.userPublicKey,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // ── EVM (ParaSwap) ────────────────────────────────────────────
    if (!body.srcToken || !body.destToken || !body.srcAmount || !body.destAmount || !body.priceRoute || !body.userAddress) {
      return NextResponse.json(
        { success: false, error: "srcToken, destToken, srcAmount, destAmount, priceRoute, and userAddress are required" },
        { status: 400 }
      );
    }

    const result = await buildParaSwapTransaction({
      srcToken: body.srcToken,
      destToken: body.destToken,
      srcAmount: body.srcAmount,
      destAmount: body.destAmount,
      priceRoute: body.priceRoute,
      userAddress: body.userAddress,
      network: parseInt(network),
      slippage: body.slippage,
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Swap API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
