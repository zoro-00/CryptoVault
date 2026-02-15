"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatLargeNumber } from "@/lib/crypto-api";
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
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  BarChart3,
  Filter,
} from "lucide-react";
import type { CryptoPrice } from "@/lib/crypto-api";
import { toast } from "sonner";

export default function MarketsPage() {
  const [marketData, setMarketData] = useState<CryptoPrice[]>([]);
  const [trending, setTrending] = useState<any[]>([]);
  const [gainers, setGainers] = useState<CryptoPrice[]>([]);
  const [losers, setLosers] = useState<CryptoPrice[]>([]);
  const [globalData, setGlobalData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    setLoading(true);
    try {
      // Load all market data
      const [marketsRes, trendingRes, gainersRes, losersRes, globalRes] =
        await Promise.all([
          fetch("/api/markets"),
          fetch("/api/markets?type=trending"),
          fetch("/api/markets?type=gainers&limit=10"),
          fetch("/api/markets?type=losers&limit=10"),
          fetch("/api/markets?type=global"),
        ]);

      const [marketsData, trendingData, gainersData, losersData, globalData] =
        await Promise.all([
          marketsRes.json(),
          trendingRes.json(),
          gainersRes.json(),
          losersRes.json(),
          globalRes.json(),
        ]);

      if (marketsData.success) setMarketData(marketsData.data || []);
      if (trendingData.success) setTrending(trendingData.data || []);
      if (gainersData.success) setGainers(gainersData.data || []);
      if (losersData.success) setLosers(losersData.data || []);
      if (globalData.success) setGlobalData(globalData.data);

      toast.success("Market data loaded");
    } catch (error) {
      console.error("Failed to load market data:", error);
      toast.error("Failed to load market data");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Markets</h1>
          <p className="text-muted-foreground">
            Track cryptocurrency prices, market cap, and trading volume
          </p>
        </div>

        {/* Global Stats */}
        {globalData && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatLargeNumber(globalData.total_market_cap?.usd || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatLargeNumber(globalData.total_volume?.usd || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  BTC Dominance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {globalData.market_cap_percentage?.btc?.toFixed(1)}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Active Coins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {globalData.active_cryptocurrencies?.toLocaleString()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Market Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList>
            <TabsTrigger value="all">All Markets</TabsTrigger>
            <TabsTrigger value="gainers">Top Gainers</TabsTrigger>
            <TabsTrigger value="losers">Top Losers</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
          </TabsList>

          {/* All Markets */}
          <TabsContent value="all" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>All Cryptocurrencies</CardTitle>
                    <CardDescription>
                      Real-time cryptocurrency prices and market data
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">#</th>
                        <th className="text-left py-3 px-4">Name</th>
                        <th className="text-right py-3 px-4">Price</th>
                        <th className="text-right py-3 px-4">24h %</th>
                        <th className="text-right py-3 px-4">Market Cap</th>
                        <th className="text-right py-3 px-4">Volume (24h)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            Loading market data...
                          </td>
                        </tr>
                      ) : marketData.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="text-center py-8 text-muted-foreground"
                          >
                            No market data available
                          </td>
                        </tr>
                      ) : (
                        marketData.map((coin) => (
                          <tr
                            key={coin.id}
                            className="border-b hover:bg-muted/50"
                          >
                            <td className="py-3 px-4">
                              {coin.market_cap_rank}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {coin.image && (
                                  <img
                                    src={coin.image}
                                    alt={coin.name}
                                    className="w-6 h-6"
                                  />
                                )}
                                <div>
                                  <div className="font-medium">{coin.name}</div>
                                  <div className="text-xs text-muted-foreground uppercase">
                                    {coin.symbol}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(coin.current_price)}
                            </td>
                            <td className="text-right py-3 px-4">
                              <span
                                className={
                                  coin.price_change_percentage_24h >= 0
                                    ? "text-green-500"
                                    : "text-red-500"
                                }
                              >
                                {coin.price_change_percentage_24h?.toFixed(2)}%
                              </span>
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatLargeNumber(coin.market_cap)}
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatLargeNumber(coin.total_volume)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Gainers */}
          <TabsContent value="gainers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Top Gainers (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {gainers.map((coin) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10"
                          />
                        )}
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {coin.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(coin.current_price)}
                        </div>
                        <div className="text-sm text-green-500">
                          +{coin.price_change_percentage_24h?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Top Losers */}
          <TabsContent value="losers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  Top Losers (24h)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {losers.map((coin) => (
                    <div
                      key={coin.id}
                      className="flex items-center justify-between p-4 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {coin.image && (
                          <img
                            src={coin.image}
                            alt={coin.name}
                            className="w-10 h-10"
                          />
                        )}
                        <div>
                          <div className="font-medium">{coin.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {coin.symbol.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(coin.current_price)}
                        </div>
                        <div className="text-sm text-red-500">
                          {coin.price_change_percentage_24h?.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trending */}
          <TabsContent value="trending">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Trending Coins
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trending.map((item, index) => (
                    <div
                      key={item.item?.id || index}
                      className="flex items-center gap-4 p-4 rounded-lg border"
                    >
                      <div className="text-2xl font-bold text-muted-foreground">
                        #{index + 1}
                      </div>
                      <div className="flex items-center gap-3 flex-1">
                        {item.item?.thumb && (
                          <img
                            src={item.item.thumb}
                            alt={item.item.name}
                            className="w-10 h-10"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.item?.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {item.item?.symbol?.toUpperCase()}
                          </div>
                        </div>
                      </div>
                      <Badge>Trending</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
