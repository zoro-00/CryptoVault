"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, DollarSign, BarChart3 } from "lucide-react";
import {
  cryptoApi,
  CryptoPrice,
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
} from "@/lib/crypto-api";

export function CryptoHero() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [globalData, setGlobalData] = useState<any>(null);

  const fetchData = async () => {
    setError(false);
    try {
      const data = await cryptoApi.getTopCryptos(4);
      setCryptos(data);

      // Fetch global market data for stats section
      try {
        const globalRes = await fetch("/api/markets?type=global");
        const globalJson = await globalRes.json();
        if (globalJson.success) setGlobalData(globalJson.data);
      } catch {
        // Global stats are non-critical, fail silently
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const refreshInterval = parseInt(
      process.env.NEXT_PUBLIC_HERO_REFRESH_INTERVAL || "30000",
    );
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-background via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="h-12 bg-muted/50 rounded-lg mb-4 animate-pulse" />
            <div className="h-6 bg-muted/30 rounded-lg max-w-2xl mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card
                key={i}
                className="bg-card/50 border-border backdrop-blur-sm animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-4 bg-muted/50 rounded mb-2" />
                  <div className="h-8 bg-muted/30 rounded mb-2" />
                  <div className="h-4 bg-muted/40 rounded w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="relative py-20 bg-gradient-to-br from-background via-background to-accent/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Failed to load market data</h2>
            <p className="text-muted-foreground mb-4">Please check your connection and try again.</p>
            <Button onClick={fetchData} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-20 bg-gradient-to-br from-background via-background to-accent/10 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,212,255,0.1),transparent_50%)]" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Hero Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-4">
            Track Every
            <span className="bg-crypto-gradient bg-clip-text text-transparent">
              {" "}
              Crypto Move
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time cryptocurrency prices, advanced charts, and portfolio
            tracking. Stay ahead in the digital asset revolution.
          </p>
        </div>

        {/* Live Crypto Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {cryptos.map((crypto, index) => {
            const isPositive = crypto.price_change_percentage_24h >= 0;
            return (
              <Card
                key={crypto.id}
                className="group bg-glass-gradient border-border backdrop-blur-sm hover:scale-105 transition-all duration-300 hover:shadow-xl hover:shadow-primary/20"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#${crypto.symbol === "btc" ? "F7931A" : crypto.symbol === "eth" ? "627EEA" : "00D4FF"}"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="12" font-weight="bold">${crypto.symbol.toUpperCase()}</text></svg>`)}`;
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-foreground">
                          {crypto.symbol.toUpperCase()}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {crypto.name}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      #{crypto.market_cap_rank}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-foreground font-mono">
                      {formatCurrency(crypto.current_price)}
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${isPositive ? "text-success" : "text-destructive"}`}
                    >
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span className="font-semibold">
                        {formatPercentage(crypto.price_change_percentage_24h)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-glass-gradient border-border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Total Market Cap
              </h3>
              <p className="text-2xl font-bold text-foreground font-mono">
                {globalData?.total_market_cap?.usd
                  ? formatLargeNumber(globalData.total_market_cap.usd)
                  : "--"}
              </p>
              <p className="text-sm text-muted-foreground">
                {globalData?.market_cap_change_percentage_24h_usd
                  ? `${globalData.market_cap_change_percentage_24h_usd >= 0 ? "+" : ""}${globalData.market_cap_change_percentage_24h_usd.toFixed(1)}% (24h)`
                  : ""}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass-gradient border-border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <BarChart3 className="h-8 w-8 text-secondary mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                24h Volume
              </h3>
              <p className="text-2xl font-bold text-foreground font-mono">
                {globalData?.total_volume?.usd
                  ? formatLargeNumber(globalData.total_volume.usd)
                  : "--"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-glass-gradient border-border backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-foreground mb-1">
                Market Dominance
              </h3>
              <p className="text-2xl font-bold text-foreground font-mono">
                BTC {globalData?.market_cap_percentage?.btc?.toFixed(1) ?? "--"}%
              </p>
              <p className="text-sm text-muted-foreground">
                ETH {globalData?.market_cap_percentage?.eth?.toFixed(1) ?? "--"}%
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
