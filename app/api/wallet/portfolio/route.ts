import { NextResponse } from "next/server";
import { ethers } from "ethers";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const ALCHEMY_URL = ALCHEMY_API_KEY
  ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
  : null;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 });
  }

  // If no valid Alchemy key is configured, return empty assets gracefully
  // ETH balance is already fetched client-side via MetaMask (window.ethereum)
  if (!ALCHEMY_URL) {
    console.warn(
      "[portfolio] No ALCHEMY_API_KEY set — skipping ERC-20 token fetch. " +
      "ETH balance is fetched client-side via MetaMask."
    );
    return NextResponse.json({
      address,
      assets: [],
      message: "No Alchemy API key configured. ETH balance is shown from MetaMask. Add ALCHEMY_API_KEY to .env.local for ERC-20 token data.",
    });
  }

  try {
    // 1. Fetch Token Balances via Alchemy
    const tokenBalancesResponse = await fetch(ALCHEMY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "alchemy_getTokenBalances",
        params: [address, "erc20"],
        id: 1,
      }),
      next: { revalidate: 60 },
    });

    if (!tokenBalancesResponse.ok) {
      console.error(`[portfolio] Alchemy responded with ${tokenBalancesResponse.status}`);
      return NextResponse.json({
        address,
        assets: [],
        message: `Alchemy API error (${tokenBalancesResponse.status}). Check your ALCHEMY_API_KEY.`,
      });
    }

    const tokenBalancesData = await tokenBalancesResponse.json();
    const tokenBalances = tokenBalancesData.result?.tokenBalances || [];

    // Filter out zero and extremely small dust balances
    const nonZeroBalances = tokenBalances.filter(
      (token: any) =>
        token.tokenBalance !== "0x0" && token.tokenBalance !== "0x"
    );

    // 2. Fetch Token Metadata for each token (limit to 10 to avoid timeouts/rate limit)
    const tokens: any[] = [];
    const tokenPromises = nonZeroBalances
      .slice(0, 10)
      .map(async (tb: any) => {
        try {
          const metadataResponse = await fetch(ALCHEMY_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              jsonrpc: "2.0",
              method: "alchemy_getTokenMetadata",
              params: [tb.contractAddress],
              id: 1,
            }),
          });
          const metadata = await metadataResponse.json();

          if (metadata.result) {
            const decimals = metadata.result.decimals || 18;
            const rawBalanceHex = tb.tokenBalance;
            const rawBalanceBigInt = BigInt(rawBalanceHex);
            const balanceFormatted = Number(
              ethers.formatUnits(rawBalanceBigInt, decimals)
            );

            return {
              contractAddress: tb.contractAddress,
              symbol: metadata.result.symbol || "Unknown",
              name: metadata.result.name || "Unknown Token",
              decimals: decimals,
              balance: balanceFormatted,
              rawBalance: rawBalanceHex,
              logo: metadata.result.logo,
            };
          }
        } catch (e) {
          console.error("Failed mapping token", tb.contractAddress, e);
        }
        return null;
      });

    const resolvedTokens = (await Promise.all(tokenPromises)).filter(
      (t) => t !== null && t.balance > 0
    );
    tokens.push(...resolvedTokens);

    // 3. Fetch USD Prices from CoinGecko
    const contractAddresses = resolvedTokens
      .map((t) => t?.contractAddress)
      .join(",");
    let prices: any = {};

    try {
      if (contractAddresses.length > 0) {
        const cgRes = await fetch(
          `https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${contractAddresses}&vs_currencies=usd&include_24hr_change=true`
        );
        prices = await cgRes.json();
      }
    } catch (e) {
      console.error("CoinGecko error", e);
    }

    // 4. Map Final Balances
    const finalAssets = tokens.map((t: any) => {
      const priceInfo =
        prices[t.contractAddress.toLowerCase()] || {
          usd: 0,
          usd_24h_change: 0,
        };
      const valueUsd = t.balance * (priceInfo.usd || 0);

      return {
        ...t,
        priceUsd: priceInfo.usd || 0,
        valueUsd,
        change24h: priceInfo.usd_24h_change || 0,
      };
    });

    // Sort by value
    finalAssets.sort((a, b) => b.valueUsd - a.valueUsd);

    return NextResponse.json({
      address,
      assets: finalAssets,
    });
  } catch (error: any) {
    console.error("Error fetching portfolio:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
