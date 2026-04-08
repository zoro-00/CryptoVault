import { NextRequest, NextResponse } from "next/server";
import { getParaSwapQuote, getJupiterQuote } from "@/lib/api/trading";

// GET /api/trading/quote?srcToken=...&destToken=...&amount=...&srcDecimals=...&destDecimals=...&network=1
// For Solana: GET /api/trading/quote?inputMint=...&outputMint=...&amount=...&network=solana
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const network = sp.get("network") || "1";

    // ── Solana (Jupiter) ──────────────────────────────────────────
    if (network === "solana") {
      const inputMint = sp.get("inputMint");
      const outputMint = sp.get("outputMint");
      const amount = sp.get("amount");
      const slippageBps = parseInt(sp.get("slippageBps") || "50");

      if (!inputMint || !outputMint || !amount) {
        return NextResponse.json(
          { success: false, error: "inputMint, outputMint, and amount are required" },
          { status: 400 }
        );
      }

      const result = await getJupiterQuote({
        inputMint,
        outputMint,
        amount,
        slippageBps,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    // ── EVM (ParaSwap) ────────────────────────────────────────────
    const srcToken = sp.get("srcToken");
    const destToken = sp.get("destToken");
    const amount = sp.get("amount");
    const srcDecimals = parseInt(sp.get("srcDecimals") || "18");
    const destDecimals = parseInt(sp.get("destDecimals") || "18");

    if (!srcToken || !destToken || !amount) {
      return NextResponse.json(
        { success: false, error: "srcToken, destToken, and amount are required" },
        { status: 400 }
      );
    }

    const result = await getParaSwapQuote({
      srcToken,
      destToken,
      amount,
      srcDecimals,
      destDecimals,
      network: parseInt(network),
    });

    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (error) {
    console.error("Quote API error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
