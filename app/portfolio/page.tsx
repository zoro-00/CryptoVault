"use client";

import { useEffect, useState } from "react";
import { formatCurrency } from "@/lib/crypto-api";
import { CryptoHeader } from "@/components/crypto-header";
import { useWallet } from "@/hooks/use-wallet";
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
} from "lucide-react";
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
  const { account, isConnected, connectWallet, ethBalance } = useWallet();
  const [portfolio, setPortfolio] = useState<WalletPortfolio | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected && account) {
      loadPortfolio();
    } else {
      setPortfolio(null);
    }
  }, [isConnected, account]);

  const loadPortfolio = async () => {
    if (!account) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/wallet/portfolio?address=${account}`);
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

  const totalValue = portfolio?.assets.reduce((acc, asset) => acc + asset.valueUsd, 0) || 0;

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
              Track your real on-chain crypto holdings auto-synced from MetaMask
            </p>
          </div>
          <div className="flex gap-2">
            {isConnected && (
              <Button variant="outline" onClick={loadPortfolio} disabled={loading}>
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

        {!isConnected ? (
          <Card className="text-center py-16">
            <CardContent>
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
              <p className="text-muted-foreground mb-4">
                Connect your MetaMask wallet to see your real-time on-chain portfolio. 
                Non-custodial and secure.
              </p>
              <Button onClick={connectWallet} size="lg">
                <Wallet className="h-4 w-4 mr-2" />
                Connect MetaMask
              </Button>
            </CardContent>
          </Card>
        ) : loading && !portfolio ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-lg">Scanning blockchain for your assets...</p>
          </div>
        ) : portfolio ? (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total Balance (USD)
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
                    ETH Balance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    {ethBalance !== null ? `${ethBalance} ETH` : "Unavailable"}
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
                    {portfolio.assets.length}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Assets Table */}
            <Card>
              <CardHeader>
                <CardTitle>On-Chain Assets</CardTitle>
                <CardDescription>
                  Your current holdings on the connected network
                </CardDescription>
              </CardHeader>
              <CardContent>
                {portfolio.assets.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No tokens found in this wallet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">Asset</th>
                          <th className="text-right py-3 px-4">Balance</th>
                          <th className="text-right py-3 px-4">Price</th>
                          <th className="text-right py-3 px-4">Value (USD)</th>
                          <th className="text-right py-3 px-4">24h</th>
                        </tr>
                      </thead>
                      <tbody>
                        {portfolio.assets.map((asset) => (
                          <tr key={asset.contractAddress} className="border-b hover:bg-muted/50 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                {asset.logo ? (
                                  <img src={asset.logo} alt={asset.symbol} className="h-8 w-8 rounded-full" />
                                ) : (
                                  <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                                    {asset.symbol.substring(0, 2)}
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{asset.name}</div>
                                  <div className="text-xs text-muted-foreground">{asset.symbol.toUpperCase()}</div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              {asset.balance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                            </td>
                            <td className="text-right py-3 px-4">
                              {asset.priceUsd > 0 ? formatCurrency(asset.priceUsd) : "-"}
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              {formatCurrency(asset.valueUsd)}
                            </td>
                            <td className="text-right py-3 px-4">
                              {asset.change24h ? (
                                <div className={`flex items-center justify-end gap-1 ${asset.change24h >= 0 ? "text-green-500" : "text-red-500"}`}>
                                  {asset.change24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
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
          </div>
        ) : null}
      </main>
    </div>
  );
}
