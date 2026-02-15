"use client";

import { useEffect, useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  PieChart,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface PortfolioAsset {
  id: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  buyPrice: number;
  currentPrice: number;
  change24h: number;
  image?: string;
}

interface Portfolio {
  id: string;
  name: string;
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercentage: number;
  assets: PortfolioAsset[];
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [activePortfolio, setActivePortfolio] = useState<Portfolio | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [showAddPortfolio, setShowAddPortfolio] = useState(false);
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState("");
  const [newAsset, setNewAsset] = useState({
    coinId: "",
    symbol: "",
    name: "",
    amount: "",
    buyPrice: "",
  });

  useEffect(() => {
    loadPortfolios();
  }, []);

  const loadPortfolios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const data = await res.json();
      if (data.success) {
        setPortfolios(data.data || []);
        if (data.data?.length > 0 && !activePortfolio) {
          setActivePortfolio(data.data[0]);
        }
      }
    } catch (error) {
      toast.error("Failed to load portfolios");
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    if (!newPortfolioName.trim()) {
      toast.error("Please enter a portfolio name");
      return;
    }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create", name: newPortfolioName }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Portfolio created!");
        setShowAddPortfolio(false);
        setNewPortfolioName("");
        loadPortfolios();
      }
    } catch (error) {
      toast.error("Failed to create portfolio");
    }
  };

  const addAsset = async () => {
    if (!activePortfolio) return;
    if (!newAsset.coinId || !newAsset.amount || !newAsset.buyPrice) {
      toast.error("Please fill all fields");
      return;
    }
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addAsset",
          portfolioId: activePortfolio.id,
          asset: {
            coinId: newAsset.coinId,
            symbol: newAsset.symbol || newAsset.coinId.toUpperCase(),
            name: newAsset.name || newAsset.coinId,
            amount: parseFloat(newAsset.amount),
            buyPrice: parseFloat(newAsset.buyPrice),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset added!");
        setShowAddAsset(false);
        setNewAsset({
          coinId: "",
          symbol: "",
          name: "",
          amount: "",
          buyPrice: "",
        });
        loadPortfolios();
      }
    } catch (error) {
      toast.error("Failed to add asset");
    }
  };

  const removeAsset = async (assetId: string) => {
    if (!activePortfolio) return;
    try {
      const res = await fetch("/api/portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "removeAsset",
          portfolioId: activePortfolio.id,
          assetId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Asset removed");
        loadPortfolios();
      }
    } catch (error) {
      toast.error("Failed to remove asset");
    }
  };



  const formatPercent = (pct: number) => {
    if (pct == null || isNaN(pct) || !isFinite(pct)) return "0.00%";
    const formatted = Math.abs(pct).toFixed(2);
    if (pct >= 0) return `+${formatted}%`;
    return `-${formatted}%`;
  };

  const cryptoOptions = [
    { id: "bitcoin", symbol: "BTC", name: "Bitcoin" },
    { id: "ethereum", symbol: "ETH", name: "Ethereum" },
    { id: "binancecoin", symbol: "BNB", name: "Binance Coin" },
    { id: "solana", symbol: "SOL", name: "Solana" },
    { id: "ripple", symbol: "XRP", name: "Ripple" },
    { id: "cardano", symbol: "ADA", name: "Cardano" },
    { id: "avalanche-2", symbol: "AVAX", name: "Avalanche" },
    { id: "polkadot", symbol: "DOT", name: "Polkadot" },
    { id: "chainlink", symbol: "LINK", name: "Chainlink" },
    { id: "dogecoin", symbol: "DOGE", name: "Dogecoin" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Portfolio
            </h1>
            <p className="text-muted-foreground">
              Track your crypto investments and profit/loss
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadPortfolios}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={showAddPortfolio} onOpenChange={setShowAddPortfolio}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Portfolio
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Portfolio</DialogTitle>
                  <DialogDescription>
                    Create a new portfolio to track your crypto investments.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="portfolio-name">Portfolio Name</Label>
                    <Input
                      id="portfolio-name"
                      placeholder="My Portfolio"
                      value={newPortfolioName}
                      onChange={(e) => setNewPortfolioName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddPortfolio(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={createPortfolio}>Create</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading portfolios...</p>
          </div>
        ) : portfolios.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <Wallet className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Portfolios Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first portfolio to start tracking your investments.
              </p>
              <Button onClick={() => setShowAddPortfolio(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Portfolio
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Summary Cards */}
            {activePortfolio && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Value
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(activePortfolio.totalValue)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(activePortfolio.totalCost)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Profit/Loss
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        activePortfolio.profitLoss >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {formatCurrency(activePortfolio.profitLoss)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      P/L %
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold flex items-center gap-1 ${
                        activePortfolio.profitLossPercentage >= 0
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {activePortfolio.profitLossPercentage >= 0 ? (
                        <ArrowUpRight className="h-5 w-5" />
                      ) : (
                        <ArrowDownRight className="h-5 w-5" />
                      )}
                      {formatPercent(activePortfolio.profitLossPercentage)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Portfolio Selector + Assets */}
            <Tabs
              value={activePortfolio?.id || ""}
              onValueChange={(id) => {
                const p = portfolios.find((p) => p.id === id);
                if (p) setActivePortfolio(p);
              }}
            >
              <div className="flex items-center justify-between">
                <TabsList>
                  {portfolios.map((p) => (
                    <TabsTrigger key={p.id} value={p.id}>
                      {p.name}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <Dialog open={showAddAsset} onOpenChange={setShowAddAsset}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Asset
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Asset</DialogTitle>
                      <DialogDescription>
                        Add a cryptocurrency to your portfolio.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Cryptocurrency</Label>
                        <Select
                          value={newAsset.coinId}
                          onValueChange={(val) => {
                            const crypto = cryptoOptions.find(
                              (c) => c.id === val,
                            );
                            if (crypto) {
                              setNewAsset({
                                ...newAsset,
                                coinId: crypto.id,
                                symbol: crypto.symbol,
                                name: crypto.name,
                              });
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select coin" />
                          </SelectTrigger>
                          <SelectContent>
                            {cryptoOptions.map((c) => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name} ({c.symbol})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="amount">Amount</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newAsset.amount}
                          onChange={(e) =>
                            setNewAsset({ ...newAsset, amount: e.target.value })
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="buyPrice">Buy Price (USD)</Label>
                        <Input
                          id="buyPrice"
                          type="number"
                          placeholder="0.00"
                          value={newAsset.buyPrice}
                          onChange={(e) =>
                            setNewAsset({
                              ...newAsset,
                              buyPrice: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddAsset(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={addAsset}>Add Asset</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>

              {portfolios.map((portfolio) => (
                <TabsContent key={portfolio.id} value={portfolio.id}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{portfolio.name} - Assets</CardTitle>
                      <CardDescription>
                        {portfolio.assets.length} asset
                        {portfolio.assets.length !== 1 ? "s" : ""} in this
                        portfolio
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {portfolio.assets.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                          <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>
                            No assets yet. Click &quot;Add Asset&quot; to get started.
                          </p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-3 px-4">Asset</th>
                                <th className="text-right py-3 px-4">Amount</th>
                                <th className="text-right py-3 px-4">
                                  Buy Price
                                </th>
                                <th className="text-right py-3 px-4">
                                  Current Price
                                </th>
                                <th className="text-right py-3 px-4">Value</th>
                                <th className="text-right py-3 px-4">P/L</th>
                                <th className="text-right py-3 px-4">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {portfolio.assets.map((asset) => {
                                const currentValue =
                                  asset.amount * asset.currentPrice;
                                const costBasis = asset.amount * asset.buyPrice;
                                const pl = currentValue - costBasis;
                                const plPercent =
                                  costBasis > 0 ? (pl / costBasis) * 100 : 0;

                                return (
                                  <tr
                                    key={asset.id}
                                    className="border-b hover:bg-muted/50"
                                  >
                                    <td className="py-3 px-4">
                                      <div className="flex items-center gap-2">
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
                                    <td className="text-right py-3 px-4">
                                      {asset.amount}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      {formatCurrency(asset.buyPrice)}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      {formatCurrency(asset.currentPrice)}
                                    </td>
                                    <td className="text-right py-3 px-4 font-medium">
                                      {formatCurrency(currentValue)}
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      <div
                                        className={
                                          pl >= 0
                                            ? "text-green-500"
                                            : "text-red-500"
                                        }
                                      >
                                        <div>{formatCurrency(pl)}</div>
                                        <div className="text-xs">
                                          {formatPercent(plPercent)}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="text-right py-3 px-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeAsset(asset.id)}
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
}
