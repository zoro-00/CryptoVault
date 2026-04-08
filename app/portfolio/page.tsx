"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/crypto-api";
import { CryptoHeader } from "@/components/crypto-header";
import { useWallet, EVM_CHAINS, getNativeCurrencySymbol, getNetworkName } from "@/hooks/use-wallet";
import { useSolanaWallet } from "@/hooks/use-solana-wallet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw,
  Loader2,
  ChevronDown,
  Globe,
  ExternalLink,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface TokenAsset {
  contractAddress: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  rawBalance: string;
  priceUsd: number;
  valueUsd: number;
  change24h: number;
  logo?: string;
}

interface WalletPortfolio {
  address: string;
  assets: TokenAsset[];
}

export default function PortfolioPage() {
  const {
    account: evmAccount,
    chainId,
    isConnected: evmConnected,
    connectWallet,
    disconnectWallet,
    switchChain,
    nativeBalance,
    networkName,
    currencySymbol,
  } = useWallet();

  const {
    account: solAccount,
    isConnected: solConnected,
    connectSolana,
    disconnectSolana,
    solBalance,
    refreshBalance: refreshSolBalance,
  } = useSolanaWallet();

  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (evmConnected && evmAccount) {
      loadPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [evmConnected, evmAccount, chainId]);

  const loadPortfolio = async () => {
    if (!evmAccount) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/portfolio?address=${evmAccount}`);
      const data = await res.json();
      if (data.error) {
        throw new Error(data.error);
      }
      setPortfolio(data);
    } catch (error) {
      toast.error("Failed to load real-time balances");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatPercent = (pct: number) => {
    if (pct == null || isNaN(pct) || !isFinite(pct)) return "0.00%";
    const formatted = Math.abs(pct).toFixed(2);
    if (pct >= 0) return `+${formatted}%`;
    return `-${formatted}%`;
  };

  const totalValue =
    portfolio?.assets.reduce((acc, asset) => acc + asset.valueUsd, 0) || 0;

  const anyConnected = evmConnected || solConnected;

  // Popular chains for the switcher
  const chainOptions = [
    { id: "0x1", label: "Ethereum", icon: "Ξ" },
    { id: "0x89", label: "Polygon", icon: "⬡" },
    { id: "0xa4b1", label: "Arbitrum", icon: "🔵" },
    { id: "0xa", label: "Optimism", icon: "🔴" },
    { id: "0x38", label: "BSC", icon: "💛" },
    { id: "0xaa36a7", label: "Sepolia", icon: "🧪" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              My Wallet
            </h1>
            <p className="text-muted-foreground">
              Multi-chain portfolio — Ethereum, Polygon, Solana & more
            </p>
          </div>
          <div className="flex gap-2">
            {evmConnected && (
              <Button
                variant="outline"
                onClick={loadPortfolio}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
            )}
          </div>
        </div>

        {/* Not connected at all */}
        {!anyConnected ? (
          <Card className="text-center py-16">
            <CardContent>
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Connect MetaMask for EVM chains (Ethereum, Polygon, Arbitrum…)
                or Phantom for Solana. Non-custodial and secure.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={connectWallet} size="lg">
                  <Wallet className="h-4 w-4 mr-2" />
                  Connect MetaMask
                </Button>
                <Button
                  onClick={connectSolana}
                  size="lg"
                  variant="outline"
                  className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Connect Phantom (Solana)
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Tabbed view: EVM / Solana */
          <Tabs defaultValue={evmConnected ? "evm" : "solana"} className="space-y-6">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="evm" className="gap-2">
                  <span>🦊</span> EVM
                  {evmConnected && (
                    <Badge
                      variant="outline"
                      className="text-xs ml-1 border-green-500 text-green-500"
                    >
                      Live
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="solana" className="gap-2">
                  <span>👻</span> Solana
                  {solConnected && (
                    <Badge
                      variant="outline"
                      className="text-xs ml-1 border-purple-500 text-purple-500"
                    >
                      Live
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Chain switcher for EVM */}
              {evmConnected && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Globe className="h-4 w-4" />
                      {networkName}
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {chainOptions.map((chain) => (
                      <DropdownMenuItem
                        key={chain.id}
                        onClick={() => switchChain(chain.id)}
                        className={
                          chainId === chain.id
                            ? "bg-primary/10 text-primary"
                            : ""
                        }
                      >
                        <span className="mr-2">{chain.icon}</span>
                        {chain.label}
                        {chainId === chain.id && (
                          <Badge className="ml-auto text-xs" variant="default">
                            Active
                          </Badge>
                        )}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* ── EVM Tab ──────────────────────────────────────── */}
            <TabsContent value="evm" className="space-y-6">
              {!evmConnected ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      MetaMask is not connected
                    </p>
                    <Button onClick={connectWallet}>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </Button>
                  </CardContent>
                </Card>
              ) : loading && !portfolio ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                  <p className="text-muted-foreground text-lg">
                    Scanning blockchain for your assets...
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          {currencySymbol} Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                          {nativeBalance !== null
                            ? `${nativeBalance} ${currencySymbol}`
                            : "Unavailable"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {networkName}
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Token Value (USD)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                          {formatCurrency(totalValue)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Tokens Found
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                          {portfolio?.assets.length || 0}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Connected Account
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          onClick={disconnectWallet}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <code className="text-sm text-muted-foreground break-all">
                        {evmAccount}
                      </code>
                    </CardContent>
                  </Card>

                  {/* Assets Table */}
                  {portfolio && (
                    <Card>
                      <CardHeader>
                        <CardTitle>On-Chain Tokens</CardTitle>
                        <CardDescription>
                          ERC-20 tokens on {networkName}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {portfolio.assets.length === 0 ? (
                          <div className="text-center py-12 text-muted-foreground">
                            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>
                              No ERC-20 tokens found on {networkName}.
                            </p>
                            <p className="text-xs mt-1">
                              Try switching to another network.
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b">
                                  <th className="text-left py-3 px-4">
                                    Asset
                                  </th>
                                  <th className="text-right py-3 px-4">
                                    Balance
                                  </th>
                                  <th className="text-right py-3 px-4">
                                    Price
                                  </th>
                                  <th className="text-right py-3 px-4">
                                    Value (USD)
                                  </th>
                                  <th className="text-right py-3 px-4">24h</th>
                                </tr>
                              </thead>
                              <tbody>
                                {portfolio.assets.map((asset) => (
                                  <tr
                                    key={asset.contractAddress}
                                    className="border-b hover:bg-muted/50 transition-colors"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-3">
                                        {asset.logo ? (
                                          <img
                                            src={asset.logo}
                                            alt={asset.symbol}
                                            className="h-8 w-8 rounded-full"
                                          />
                                        ) : (
                                          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                            {asset.symbol.substring(0, 2)}
                                          </div>
                                        )}
                                        <div>
                                          <div className="font-medium">
                                            {asset.name}
                                          </div>
                                          <div className="text-xs text-muted-foreground">
                                            {asset.symbol.toUpperCase()}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-right py-3 px-4 font-medium">
                                      {asset.balance.toLocaleString(undefined, {
                                        maximumFractionDigits: 6,
                                      })}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      {asset.priceUsd > 0
                                        ? formatCurrency(asset.priceUsd)
                                        : "-"}
                                    </td>
                                    <td className="text-right py-3 px-4 font-medium">
                                      {formatCurrency(asset.valueUsd)}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      {asset.change24h ? (
                                        <div
                                          className={`flex items-center justify-end gap-1 ${
                                            asset.change24h >= 0
                                              ? "text-green-500"
                                              : "text-red-500"
                                          }`}
                                        >
                                          {asset.change24h >= 0 ? (
                                            <ArrowUpRight className="h-4 w-4" />
                                          ) : (
                                            <ArrowDownRight className="h-4 w-4" />
                                          )}
                                          {formatPercent(asset.change24h)}
                                        </div>
                                      ) : (
                                        "-"
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </>
              )}
            </TabsContent>

            {/* ── Solana Tab ──────────────────────────────────── */}
            <TabsContent value="solana" className="space-y-6">
              {!solConnected ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      Phantom wallet is not connected
                    </p>
                    <Button
                      onClick={connectSolana}
                      className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                      variant="outline"
                    >
                      <Globe className="h-4 w-4 mr-2" />
                      Connect Phantom
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Solana summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          SOL Balance
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                          {solBalance !== null
                            ? `${solBalance} SOL`
                            : "Unavailable"}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Solana Mainnet
                        </p>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Network
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                          Solana
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          mainnet-beta
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Account info */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base">
                          Connected Account
                        </CardTitle>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={refreshSolBalance}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Refresh
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                            onClick={disconnectSolana}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-muted-foreground break-all">
                          {solAccount}
                        </code>
                        <a
                          href={`https://explorer.solana.com/address/${solAccount}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>

                  {/* SPL tokens placeholder */}
                  <Card>
                    <CardHeader>
                      <CardTitle>SPL Tokens</CardTitle>
                      <CardDescription>
                        Your Solana token holdings
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-12 text-muted-foreground">
                        <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>SPL token scanning coming soon.</p>
                        <p className="text-xs mt-1">
                          SOL balance is displayed above.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
