"use client";

import { useEffect, useState, useCallback } from "react";
import { formatCurrency } from "@/lib/crypto-api";
import { CryptoHeader } from "@/components/crypto-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownUp,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Settings2,
  Wallet,
  Fuel,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/hooks/use-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import { useSwap } from "@/hooks/use-swap";
import type { Token } from "@/lib/tokens";
import {
  getTokensForChain,
  hexToDecimalChainId,
  SOLANA_TOKENS,
} from "@/lib/tokens";
import { ethers } from "ethers";

export default function SwapPage() {
  const wallet = useWallet();
  const solana = useSolanaWallet();

  // ── Chain mode ────────────────────────────────────────────────────
  const [chainMode, setChainMode] = useState<"evm" | "solana">("evm");

  // Unwrap Solana wallet state for cleaner access
  const solanaConnected = solana.isConnected;
  const solanaAccount = solana.account;

  const evmChainId = wallet.chainId
    ? hexToDecimalChainId(wallet.chainId)
    : 1;

  const availableTokens =
    chainMode === "solana" ? SOLANA_TOKENS : getTokensForChain(evmChainId);

  // ── Swap form ─────────────────────────────────────────────────────
  const [fromToken, setFromToken] = useState<Token>(availableTokens[0]);
  const [toToken, setToToken] = useState<Token>(availableTokens[1]);
  const [fromAmount, setFromAmount] = useState("");
  const [fromBalance, setFromBalance] = useState<string | null>(null);
  const [slippageBps, setSlippageBps] = useState(50);
  const [showSettings, setShowSettings] = useState(false);

  // ── Market stats ──────────────────────────────────────────────────
  const [stats, setStats] = useState<any>(null);

  // ── Swap hook ─────────────────────────────────────────────────────
  const { quote, status, txResult, error, getQuote, executeSwap, getTokenBalance, reset } =
    useSwap();

  // ── Load market stats ─────────────────────────────────────────────
  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/trading?pair=BTC/USDT");
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch {}
    };
    loadStats();
  }, []);

  // ── Update tokens when chain changes ──────────────────────────────
  useEffect(() => {
    const tokens =
      chainMode === "solana" ? SOLANA_TOKENS : getTokensForChain(evmChainId);
    setFromToken(tokens[0]);
    setToToken(tokens[1] || tokens[0]);
    setFromAmount("");
    reset();
  }, [chainMode, evmChainId, reset]);

  // ── Fetch from-token balance ──────────────────────────────────────
  useEffect(() => {
    const loadBalance = async () => {
      const userAddr =
        chainMode === "solana" ? solanaAccount : wallet.account;
      if (!userAddr) {
        setFromBalance(null);
        return;
      }
      const bal = await getTokenBalance(fromToken, userAddr);
      setFromBalance(bal);
    };
    loadBalance();
  }, [fromToken, chainMode, wallet.account, solanaAccount, getTokenBalance]);

  // ── Auto-quote on amount change (debounced) ───────────────────────
  useEffect(() => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      reset();
      return;
    }

    const timeout = setTimeout(() => {
      getQuote(fromToken, toToken, fromAmount, slippageBps);
    }, 800);

    return () => clearTimeout(timeout);
  }, [fromAmount, fromToken, toToken, slippageBps]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Flip tokens ───────────────────────────────────────────────────
  const flipTokens = useCallback(() => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount("");
    reset();
  }, [fromToken, toToken, reset]);

  // ── Set max balance ───────────────────────────────────────────────
  const setMaxBalance = useCallback(() => {
    if (fromBalance) {
      // Leave a small amount for gas if native token
      const bal = parseFloat(fromBalance);
      const maxAmount =
        fromToken.address.toLowerCase() ===
          "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" ||
        fromToken.address === "So11111111111111111111111111111111111111112"
          ? Math.max(0, bal - 0.005).toString()
          : fromBalance;
      setFromAmount(maxAmount);
    }
  }, [fromBalance, fromToken]);

  // ── Execute swap ──────────────────────────────────────────────────
  const handleSwap = async () => {
    if (!quote) return;
    await executeSwap(fromToken, toToken, fromAmount, quote, slippageBps);
  };

  // ── Format output amount ──────────────────────────────────────────
  const formattedOutput = (() => {
    if (!quote) return "";
    const raw = quote.destAmount || quote.outAmount || "0";
    const decimals = toToken.decimals;
    try {
      return ethers.formatUnits(BigInt(raw), decimals);
    } catch {
      return raw;
    }
  })();

  // ── Is wallet connected? ──────────────────────────────────────────
  const isConnected =
    chainMode === "evm" ? wallet.isConnected : solanaConnected;

  // ── Button state ──────────────────────────────────────────────────
  const buttonContent = (() => {
    if (!isConnected) return { text: "Connect Wallet", disabled: false, action: chainMode === "evm" ? wallet.connectWallet : solana.connectSolana };
    if (!fromAmount || parseFloat(fromAmount) <= 0) return { text: "Enter amount", disabled: true };
    if (status === "quoting") return { text: "Getting quote...", disabled: true, loading: true };
    if (status === "approving") return { text: "Approving token...", disabled: true, loading: true };
    if (status === "swapping") return { text: "Confirm in wallet...", disabled: true, loading: true };
    if (status === "confirming") return { text: "Confirming...", disabled: true, loading: true };
    if (fromBalance && parseFloat(fromAmount) > parseFloat(fromBalance)) return { text: `Insufficient ${fromToken.symbol}`, disabled: true };
    if (!quote) return { text: "Enter amount", disabled: true };
    if (error) return { text: "Swap", disabled: false, action: handleSwap };
    return { text: `Swap ${fromToken.symbol} → ${toToken.symbol}`, disabled: false, action: handleSwap };
  })();

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Page Header */}
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-2">Swap</h1>
          <p className="text-muted-foreground">
            Swap tokens on-chain — powered by ParaSwap & Jupiter
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-xs text-muted-foreground">BTC Price</div>
                <div className="text-lg font-bold">{formatCurrency(stats.lastPrice)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-xs text-muted-foreground">24h Volume</div>
                <div className="text-lg font-bold">${(stats.volume24h / 1e9).toFixed(1)}B</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-xs text-muted-foreground">24h High</div>
                <div className="text-lg font-bold text-green-500">{formatCurrency(stats.high24h)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 pb-3 px-4">
                <div className="text-xs text-muted-foreground">24h Low</div>
                <div className="text-lg font-bold text-red-500">{formatCurrency(stats.low24h)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Chain Mode Toggle */}
        <div className="flex justify-center mb-6 gap-2">
          <Button
            variant={chainMode === "evm" ? "default" : "outline"}
            size="sm"
            onClick={() => setChainMode("evm")}
            className={chainMode === "evm" ? "bg-cyan-500 hover:bg-cyan-600" : ""}
          >
            🦊 EVM Chains
          </Button>
          <Button
            variant={chainMode === "solana" ? "default" : "outline"}
            size="sm"
            onClick={() => setChainMode("solana")}
            className={chainMode === "solana" ? "bg-purple-500 hover:bg-purple-600" : ""}
          >
            👻 Solana
          </Button>
        </div>

        {/* ── Main Swap Card ───────────────────────────────────────── */}
        <Card className="relative overflow-hidden">
          {/* Settings Gear */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors z-10"
          >
            <Settings2 className="h-5 w-5 text-muted-foreground" />
          </button>

          {/* Slippage Settings Panel */}
          {showSettings && (
            <div className="absolute top-14 right-4 z-20 bg-card border rounded-lg p-4 shadow-lg w-64">
              <Label className="text-sm font-medium">Slippage Tolerance</Label>
              <div className="flex gap-2 mt-2">
                {[10, 50, 100, 300].map((bps) => (
                  <Button
                    key={bps}
                    variant={slippageBps === bps ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSlippageBps(bps)}
                    className="flex-1 text-xs"
                  >
                    {bps / 100}%
                  </Button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Custom"
                  className="text-xs h-8"
                  value={slippageBps / 100}
                  onChange={(e) => setSlippageBps(Math.round(parseFloat(e.target.value || "0.5") * 100))}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
            </div>
          )}

          <CardContent className="pt-8 pb-6 px-6 space-y-4">
            {/* ── FROM ─────────────────────────────────────────────── */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <Label className="text-xs text-muted-foreground">You pay</Label>
                {fromBalance && (
                  <button
                    onClick={setMaxBalance}
                    className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
                  >
                    Balance: {parseFloat(fromBalance).toFixed(6)} (MAX)
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="number"
                  placeholder="0.0"
                  value={fromAmount}
                  onChange={(e) => setFromAmount(e.target.value)}
                  className="text-2xl font-bold border-0 bg-transparent p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0 flex-1"
                />
                <Select
                  value={fromToken.address}
                  onValueChange={(addr) => {
                    const t = availableTokens.find((t) => t.address === addr);
                    if (t) setFromToken(t);
                  }}
                >
                  <SelectTrigger className="w-36 bg-card border">
                    <div className="flex items-center gap-2">
                      <img
                        src={fromToken.logoUrl}
                        alt={fromToken.symbol}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.map((t) => (
                      <SelectItem key={t.address} value={t.address}>
                        <div className="flex items-center gap-2">
                          <img src={t.logoUrl} alt="" className="w-4 h-4 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          {t.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Flip Button ──────────────────────────────────────── */}
            <div className="flex justify-center -my-2 relative z-10">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 bg-card border-2 hover:bg-muted transition-transform hover:rotate-180"
                onClick={flipTokens}
              >
                <ArrowDownUp className="h-4 w-4" />
              </Button>
            </div>

            {/* ── TO ───────────────────────────────────────────────── */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="flex justify-between mb-2">
                <Label className="text-xs text-muted-foreground">You receive</Label>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold flex-1 min-h-[2rem]">
                  {status === "quoting" ? (
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  ) : formattedOutput ? (
                    parseFloat(formattedOutput).toFixed(6)
                  ) : (
                    <span className="text-muted-foreground">0.0</span>
                  )}
                </div>
                <Select
                  value={toToken.address}
                  onValueChange={(addr) => {
                    const t = availableTokens.find((t) => t.address === addr);
                    if (t) setToToken(t);
                  }}
                >
                  <SelectTrigger className="w-36 bg-card border">
                    <div className="flex items-center gap-2">
                      <img
                        src={toToken.logoUrl}
                        alt={toToken.symbol}
                        className="w-5 h-5 rounded-full"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {availableTokens.map((t) => (
                      <SelectItem key={t.address} value={t.address}>
                        <div className="flex items-center gap-2">
                          <img src={t.logoUrl} alt="" className="w-4 h-4 rounded-full" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                          {t.symbol}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* ── Quote Details ─────────────────────────────────────── */}
            {quote && (
              <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
                {quote.gasCostUSD && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Fuel className="h-3.5 w-3.5" /> Gas cost
                    </span>
                    <span>${parseFloat(quote.gasCostUSD).toFixed(2)}</span>
                  </div>
                )}
                {quote.priceImpactPct && (
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <TrendingDown className="h-3.5 w-3.5" /> Price impact
                    </span>
                    <span className={parseFloat(quote.priceImpactPct) > 1 ? "text-red-500" : "text-green-500"}>
                      {parseFloat(quote.priceImpactPct).toFixed(4)}%
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Slippage</span>
                  <span>{slippageBps / 100}%</span>
                </div>
                {quote.otherAmountThreshold && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Min received</span>
                    <span>
                      {parseFloat(ethers.formatUnits(BigInt(quote.otherAmountThreshold), toToken.decimals)).toFixed(6)}{" "}
                      {toToken.symbol}
                    </span>
                  </div>
                )}
                {quote.swapUsdValue && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Swap value</span>
                    <span>${parseFloat(quote.swapUsdValue).toFixed(2)}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── Swap Button ──────────────────────────────────────── */}
            <Button
              onClick={buttonContent.action || (() => {})}
              disabled={buttonContent.disabled}
              className={`w-full h-14 text-lg font-semibold rounded-xl ${
                !isConnected
                  ? "bg-cyan-500 hover:bg-cyan-600"
                  : fromBalance && parseFloat(fromAmount) > parseFloat(fromBalance)
                    ? "bg-red-500/20 text-red-400"
                    : "bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600"
              }`}
            >
              {(buttonContent as any).loading && <Loader2 className="h-5 w-5 mr-2 animate-spin" />}
              {!isConnected && <Wallet className="h-5 w-5 mr-2" />}
              {buttonContent.text}
            </Button>

            {/* ── Transaction Result ───────────────────────────────── */}
            {txResult && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-500">Swap Successful!</span>
                </div>
                <a
                  href={txResult.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-cyan-500 hover:text-cyan-400 flex items-center gap-1"
                >
                  View on Explorer <ExternalLink className="h-3 w-3" />
                </a>
                <div className="text-xs text-muted-foreground mt-1 font-mono">
                  {txResult.txHash}
                </div>
              </div>
            )}

            {/* ── Error Display ────────────────────────────────────── */}
            {status === "error" && error && !txResult && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm text-red-400">{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Info Banner ──────────────────────────────────────────── */}
        <div className="mt-6 text-center text-xs text-muted-foreground space-y-1">
          <p>
            {chainMode === "evm"
              ? "Powered by ParaSwap — aggregates UniswapV3, SushiSwap, Curve & more."
              : "Powered by Jupiter — best Solana DEX aggregator."}
          </p>
          <p>Transactions are executed on-chain. You sign every transaction with your wallet.</p>
        </div>
      </main>
    </div>
  );
}
