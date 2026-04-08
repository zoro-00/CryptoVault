// ── Token Registry ──────────────────────────────────────────────────
// Common tokens per chain for the swap UI.
// Native gas tokens use the 0xEeee...EEeE sentinel or "native" for Solana.

export interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoUrl: string;
  chainId: number; // decimal chain ID, 0 = Solana
}

// ── Logos (CoinGecko CDN) ───────────────────────────────────────────
const LOGOS: Record<string, string> = {
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  USDC: "https://assets.coingecko.com/coins/images/6319/small/usdc.png",
  USDT: "https://assets.coingecko.com/coins/images/325/small/Tether.png",
  WBTC: "https://assets.coingecko.com/coins/images/7598/small/wrapped_bitcoin_wbtc.png",
  DAI: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uni.jpg",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  WETH: "https://assets.coingecko.com/coins/images/2518/small/weth.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  POL: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  BNB: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  OP: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  BONK: "https://assets.coingecko.com/coins/images/28600/small/bonk.jpg",
  JUP: "https://assets.coingecko.com/coins/images/36714/small/jup.png",
};

// Sentinel address for native gas tokens (ETH, MATIC, BNB) on EVM
export const NATIVE_TOKEN_ADDRESS =
  "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

// ── Ethereum Mainnet (chainId=1) ────────────────────────────────────
export const ETHEREUM_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_ADDRESS, decimals: 18, logoUrl: LOGOS.ETH, chainId: 1 },
  { symbol: "USDC", name: "USD Coin", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6, logoUrl: LOGOS.USDC, chainId: 1 },
  { symbol: "USDT", name: "Tether USD", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6, logoUrl: LOGOS.USDT, chainId: 1 },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", decimals: 8, logoUrl: LOGOS.WBTC, chainId: 1 },
  { symbol: "WETH", name: "Wrapped Ether", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18, logoUrl: LOGOS.WETH, chainId: 1 },
  { symbol: "DAI", name: "Dai", address: "0x6B175474E89094C44Da98b954EedeAC495271d0F", decimals: 18, logoUrl: LOGOS.DAI, chainId: 1 },
  { symbol: "UNI", name: "Uniswap", address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18, logoUrl: LOGOS.UNI, chainId: 1 },
  { symbol: "LINK", name: "Chainlink", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18, logoUrl: LOGOS.LINK, chainId: 1 },
];

// ── Polygon (chainId=137) ───────────────────────────────────────────
export const POLYGON_TOKENS: Token[] = [
  { symbol: "POL", name: "POL", address: NATIVE_TOKEN_ADDRESS, decimals: 18, logoUrl: LOGOS.POL, chainId: 137 },
  { symbol: "USDC", name: "USD Coin", address: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", decimals: 6, logoUrl: LOGOS.USDC, chainId: 137 },
  { symbol: "USDT", name: "Tether USD", address: "0xc2132D05D31c914a87C6611C10748AEb04B58e8F", decimals: 6, logoUrl: LOGOS.USDT, chainId: 137 },
  { symbol: "WETH", name: "Wrapped Ether", address: "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619", decimals: 18, logoUrl: LOGOS.WETH, chainId: 137 },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6", decimals: 8, logoUrl: LOGOS.WBTC, chainId: 137 },
];

// ── BNB Smart Chain (chainId=56) ────────────────────────────────────
export const BSC_TOKENS: Token[] = [
  { symbol: "BNB", name: "BNB", address: NATIVE_TOKEN_ADDRESS, decimals: 18, logoUrl: LOGOS.BNB, chainId: 56 },
  { symbol: "USDC", name: "USD Coin", address: "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d", decimals: 18, logoUrl: LOGOS.USDC, chainId: 56 },
  { symbol: "USDT", name: "Tether USD", address: "0x55d398326f99059fF775485246999027B3197955", decimals: 18, logoUrl: LOGOS.USDT, chainId: 56 },
  { symbol: "BTCB", name: "Bitcoin BEP2", address: "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead51b", decimals: 18, logoUrl: LOGOS.WBTC, chainId: 56 },
  { symbol: "ETH", name: "Binance-Peg ETH", address: "0x2170Ed0880ac9A755fd29B2688956BD959F933F8", decimals: 18, logoUrl: LOGOS.ETH, chainId: 56 },
];

// ── Arbitrum One (chainId=42161) ────────────────────────────────────
export const ARBITRUM_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_ADDRESS, decimals: 18, logoUrl: LOGOS.ETH, chainId: 42161 },
  { symbol: "USDC", name: "USD Coin", address: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", decimals: 6, logoUrl: LOGOS.USDC, chainId: 42161 },
  { symbol: "USDT", name: "Tether USD", address: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9", decimals: 6, logoUrl: LOGOS.USDT, chainId: 42161 },
  { symbol: "ARB", name: "Arbitrum", address: "0x912CE59144191C1204E64559FE8253a0e49E6548", decimals: 18, logoUrl: LOGOS.ARB, chainId: 42161 },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f", decimals: 8, logoUrl: LOGOS.WBTC, chainId: 42161 },
];

// ── Optimism (chainId=10) ───────────────────────────────────────────
export const OPTIMISM_TOKENS: Token[] = [
  { symbol: "ETH", name: "Ether", address: NATIVE_TOKEN_ADDRESS, decimals: 18, logoUrl: LOGOS.ETH, chainId: 10 },
  { symbol: "USDC", name: "USD Coin", address: "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85", decimals: 6, logoUrl: LOGOS.USDC, chainId: 10 },
  { symbol: "USDT", name: "Tether USD", address: "0x94b008aA00579c1307B0EF2c499aD98a8ce58e58", decimals: 6, logoUrl: LOGOS.USDT, chainId: 10 },
  { symbol: "OP", name: "Optimism", address: "0x4200000000000000000000000000000000000042", decimals: 18, logoUrl: LOGOS.OP, chainId: 10 },
  { symbol: "WBTC", name: "Wrapped BTC", address: "0x68f180fcCe6836688e9084f035309E29Bf0A2095", decimals: 8, logoUrl: LOGOS.WBTC, chainId: 10 },
];

// ── Solana (chainId=0 sentinel) ─────────────────────────────────────
export const SOLANA_TOKENS: Token[] = [
  { symbol: "SOL", name: "Solana", address: "So11111111111111111111111111111111111111112", decimals: 9, logoUrl: LOGOS.SOL, chainId: 0 },
  { symbol: "USDC", name: "USD Coin", address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", decimals: 6, logoUrl: LOGOS.USDC, chainId: 0 },
  { symbol: "USDT", name: "Tether USD", address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", decimals: 6, logoUrl: LOGOS.USDT, chainId: 0 },
  { symbol: "BONK", name: "Bonk", address: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", decimals: 5, logoUrl: LOGOS.BONK, chainId: 0 },
  { symbol: "JUP", name: "Jupiter", address: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", decimals: 6, logoUrl: LOGOS.JUP, chainId: 0 },
];

// ── Helpers ─────────────────────────────────────────────────────────

/** chainId (decimal) → ParaSwap network ID mapping */
export const CHAIN_TO_PARASWAP_NETWORK: Record<number, number> = {
  1: 1,       // Ethereum
  137: 137,   // Polygon
  56: 56,     // BSC
  42161: 42161, // Arbitrum
  10: 10,     // Optimism
};

/** Hex chain ID → decimal */
export function hexToDecimalChainId(hex: string): number {
  return parseInt(hex, 16);
}

/** Get tokens for a given decimal chain ID */
export function getTokensForChain(chainId: number): Token[] {
  switch (chainId) {
    case 1: return ETHEREUM_TOKENS;
    case 137: return POLYGON_TOKENS;
    case 56: return BSC_TOKENS;
    case 42161: return ARBITRUM_TOKENS;
    case 10: return OPTIMISM_TOKENS;
    case 0: return SOLANA_TOKENS;
    default: return ETHEREUM_TOKENS;
  }
}

/** Find a token by address (case-insensitive) on a given chain */
export function findToken(chainId: number, address: string): Token | undefined {
  return getTokensForChain(chainId).find(
    (t) => t.address.toLowerCase() === address.toLowerCase()
  );
}

/** Check if token is the native gas token */
export function isNativeToken(token: Token): boolean {
  if (token.chainId === 0) {
    return token.address === "So11111111111111111111111111111111111111112";
  }
  return token.address.toLowerCase() === NATIVE_TOKEN_ADDRESS.toLowerCase();
}
