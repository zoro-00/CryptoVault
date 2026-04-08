// Trading service — Real DEX swap via ParaSwap (EVM) + Jupiter (Solana)
import type { ApiResponse } from "@/lib/types";
import { CHAIN_TO_PARASWAP_NETWORK } from "@/lib/tokens";

const PARASWAP_API = "https://api.paraswap.io";
const JUPITER_API = "https://api.jup.ag/swap/v1";

// ── ParaSwap (EVM) ─────────────────────────────────────────────────

export interface ParaSwapQuote {
  srcToken: string;
  srcDecimals: number;
  srcAmount: string;
  destToken: string;
  destDecimals: number;
  destAmount: string;
  gasCostUSD: string;
  side: string;
  contractAddress: string;
  tokenTransferProxy: string;
  priceRoute: any; // full route needed for building tx
}

/**
 * Get a swap quote from ParaSwap.
 */
export async function getParaSwapQuote(params: {
  srcToken: string;
  destToken: string;
  amount: string;       // in wei / smallest unit
  srcDecimals: number;
  destDecimals: number;
  network: number;      // decimal chain ID
  side?: "SELL" | "BUY";
}): Promise<ApiResponse<ParaSwapQuote>> {
  try {
    const psNetwork = CHAIN_TO_PARASWAP_NETWORK[params.network];
    if (!psNetwork) {
      return { success: false, error: `Chain ${params.network} not supported by ParaSwap` };
    }

    const url = new URL(`${PARASWAP_API}/prices`);
    url.searchParams.set("srcToken", params.srcToken);
    url.searchParams.set("destToken", params.destToken);
    url.searchParams.set("amount", params.amount);
    url.searchParams.set("srcDecimals", String(params.srcDecimals));
    url.searchParams.set("destDecimals", String(params.destDecimals));
    url.searchParams.set("network", String(psNetwork));
    url.searchParams.set("side", params.side || "SELL");

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[paraswap] Quote error:", errBody);
      return { success: false, error: `ParaSwap quote failed: ${res.status}` };
    }

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error };
    }

    const route = data.priceRoute;
    return {
      success: true,
      data: {
        srcToken: route.srcToken,
        srcDecimals: route.srcDecimals,
        srcAmount: route.srcAmount,
        destToken: route.destToken,
        destDecimals: route.destDecimals,
        destAmount: route.destAmount,
        gasCostUSD: route.gasCostUSD,
        side: route.side,
        contractAddress: route.contractAddress,
        tokenTransferProxy: route.tokenTransferProxy,
        priceRoute: route,
      },
    };
  } catch (error) {
    console.error("[paraswap] getQuote error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Quote failed",
    };
  }
}

/**
 * Build a swap transaction from ParaSwap.
 * Returns tx data ready to be sent via MetaMask.
 */
export async function buildParaSwapTransaction(params: {
  srcToken: string;
  destToken: string;
  srcAmount: string;
  destAmount: string;
  priceRoute: any;
  userAddress: string;
  network: number;
  slippage?: number; // basis points, default 100 (1%)
}): Promise<ApiResponse<{ to: string; data: string; value: string; chainId: number; gasPrice?: string }>> {
  try {
    const psNetwork = CHAIN_TO_PARASWAP_NETWORK[params.network];
    if (!psNetwork) {
      return { success: false, error: `Chain ${params.network } not supported` };
    }

    const slippage = params.slippage ?? 100; // 1% default
    const minDestAmount = BigInt(params.destAmount) * BigInt(10000 - slippage) / BigInt(10000);

    const body = {
      srcToken: params.srcToken,
      destToken: params.destToken,
      srcAmount: params.srcAmount,
      destAmount: minDestAmount.toString(),
      priceRoute: params.priceRoute,
      userAddress: params.userAddress,
      partner: "cryptovault",
      srcDecimals: params.priceRoute.srcDecimals,
      destDecimals: params.priceRoute.destDecimals,
    };

    const res = await fetch(
      `${PARASWAP_API}/transactions/${psNetwork}?ignoreChecks=true`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[paraswap] Build tx error:", errBody);
      return { success: false, error: `Failed to build transaction: ${res.status}` };
    }

    const txData = await res.json();
    if (txData.error) {
      return { success: false, error: txData.error };
    }

    return {
      success: true,
      data: {
        to: txData.to,
        data: txData.data,
        value: txData.value,
        chainId: txData.chainId,
        gasPrice: txData.gasPrice,
      },
    };
  } catch (error) {
    console.error("[paraswap] buildTx error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Build transaction failed",
    };
  }
}

// ── Jupiter (Solana) ────────────────────────────────────────────────

export interface JupiterQuote {
  inputMint: string;
  inAmount: string;
  outputMint: string;
  outAmount: string;
  priceImpactPct: string;
  routePlan: any[];
  swapUsdValue: string;
  otherAmountThreshold: string;
  slippageBps: number;
}

/**
 * Get a swap quote from Jupiter (Solana).
 */
export async function getJupiterQuote(params: {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
}): Promise<ApiResponse<JupiterQuote>> {
  try {
    const url = new URL(`${JUPITER_API}/quote`);
    url.searchParams.set("inputMint", params.inputMint);
    url.searchParams.set("outputMint", params.outputMint);
    url.searchParams.set("amount", params.amount);
    url.searchParams.set("slippageBps", String(params.slippageBps ?? 50));

    const res = await fetch(url.toString());
    if (!res.ok) {
      const errBody = await res.text();
      console.error("[jupiter] Quote error:", errBody);
      return { success: false, error: `Jupiter quote failed: ${res.status}` };
    }

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      data: {
        inputMint: data.inputMint,
        inAmount: data.inAmount,
        outputMint: data.outputMint,
        outAmount: data.outAmount,
        priceImpactPct: data.priceImpactPct,
        routePlan: data.routePlan,
        swapUsdValue: data.swapUsdValue || "0",
        otherAmountThreshold: data.otherAmountThreshold,
        slippageBps: data.slippageBps,
      },
    };
  } catch (error) {
    console.error("[jupiter] getQuote error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Jupiter quote failed",
    };
  }
}

/**
 * Build a swap transaction for Jupiter (Solana).
 * Returns a serialized transaction to sign with Phantom.
 */
export async function buildJupiterSwap(params: {
  quoteResponse: any;
  userPublicKey: string;
}): Promise<ApiResponse<{ swapTransaction: string }>> {
  try {
    const res = await fetch(`${JUPITER_API}/swap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quoteResponse: params.quoteResponse,
        userPublicKey: params.userPublicKey,
        wrapAndUnwrapSol: true,
        dynamicSlippage: { maxBps: 300 },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[jupiter] Swap error:", errBody);
      return { success: false, error: `Jupiter swap build failed: ${res.status}` };
    }

    const data = await res.json();
    if (data.error) {
      return { success: false, error: data.error };
    }

    return {
      success: true,
      data: { swapTransaction: data.swapTransaction },
    };
  } catch (error) {
    console.error("[jupiter] buildSwap error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Jupiter swap build failed",
    };
  }
}

// ── Market Stats (CoinGecko — kept from previous version) ──────────

const PAIR_TO_COINGECKO: Record<string, string> = {
  "BTC/USDT": "bitcoin",
  "ETH/USDT": "ethereum",
  "BNB/USDT": "binancecoin",
  "SOL/USDT": "solana",
  "ADA/USDT": "cardano",
};

interface PriceCache {
  prices: Record<string, any>;
  timestamp: number;
}
let priceCache: PriceCache | null = null;
const PRICE_CACHE_TTL = 60_000;

async function fetchLivePrices(): Promise<Record<string, any>> {
  if (priceCache && Date.now() - priceCache.timestamp < PRICE_CACHE_TTL) {
    return priceCache.prices;
  }
  try {
    const ids = Object.values(PAIR_TO_COINGECKO).join(",");
    const apiKey = process.env.NEXT_PUBLIC_COINGECKO_API_KEY || "";
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true${apiKey ? `&x_cg_demo_api_key=${apiKey}` : ""}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    priceCache = { prices: data, timestamp: Date.now() };
    return data;
  } catch {
    return {};
  }
}

export async function getTradingStats(pair: string): Promise<
  ApiResponse<{
    volume24h: number;
    lastPrice: number;
    high24h: number;
    low24h: number;
    priceChange24h: number;
  }>
> {
  try {
    const prices = await fetchLivePrices();
    const cgId = PAIR_TO_COINGECKO[pair];
    const priceData = cgId ? prices[cgId] : null;
    const lastPrice = priceData?.usd ?? 0;
    const change = priceData?.usd_24h_change ?? 0;
    const volume = priceData?.usd_24h_vol ?? 0;
    const high24h = lastPrice * (1 + Math.abs(change) / 100 / 2);
    const low24h = lastPrice * (1 - Math.abs(change) / 100 / 2);

    return { success: true, data: { volume24h: volume, lastPrice, high24h, low24h, priceChange24h: change } };
  } catch (error) {
    console.error("Get trading stats error:", error);
    return { success: false, error: error instanceof Error ? error.message : "Failed to get trading stats" };
  }
}
