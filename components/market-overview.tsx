"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Eye } from "lucide-react";
import {
  cryptoApi,
  CryptoPrice,
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
}
from "@/lib/crypto-api";

export function MarketOverview() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchData = useCallback(async () => {
    setError(false);
    setLoading(true); // Set loading to true when fetching data, especially for retry
    try {
      const data = await cryptoApi.getTopCryptos(20);
      setCryptos(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []); // No dependencies, as setError, setCryptos, setLoading are state setters

  useEffect(() => {
    fetchData();
    const refreshInterval = parseInt(
      process.env.NEXT_PUBLIC_MARKET_REFRESH_INTERVAL || "60000",
    );
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Failed to load market data</h2>
          <p className="text-muted-foreground mb-4">Unable to fetch cryptocurrency prices.</p>
          <Button onClick={fetchData} variant="outline">Retry</Button>
        </div>
      </section>
    );
  }

  if (loading) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-card/50 border-border backdrop-blur-sm">
            <CardHeader>
              <div className="h-8 bg-muted/50 rounded-lg w-48 animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-4 p-4 animate-pulse"
                  >
                    <div className="w-10 h-10 bg-muted/50 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-24" />
                      <div className="h-3 bg-muted/30 rounded w-16" />
                    </div>
                    <div className="text-right space-y-2">
                      <div className="h-4 bg-muted/50 rounded w-20" />
                      <div className="h-3 bg-muted/30 rounded w-16" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-glass-gradient border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-foreground">
                Market Overview
              </CardTitle>
              <Button
                variant="outline"
                className="border-border text-foreground hover:bg-muted"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {/* Header Row */}
            <div className="grid grid-cols-12 gap-4 p-4 border-b border-border text-sm font-medium text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-3">Name</div>
              <div className="col-span-2 text-right">Price</div>
              <div className="col-span-2 text-right">24h %</div>
              <div className="col-span-2 text-right">Market Cap</div>
              <div className="col-span-2 text-right">Volume (24h)</div>
            </div>

            {/* Crypto Rows */}
            <div className="divide-y divide-border">
              {cryptos.map((crypto, index) => {
                const isPositive = crypto.price_change_percentage_24h >= 0;
                const isFavorite = favorites.has(crypto.id);

                return (
                  <div
                    key={crypto.id}
                    className="grid grid-cols-12 gap-4 p-4 hover:bg-muted/20 transition-colors group"
                  >
                    {/* Rank */}
                    <div className="col-span-1 flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto mr-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => toggleFavorite(crypto.id)}
                      >
                        <Star
                          className={`h-4 w-4 ${isFavorite ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      </Button>
                      <span className="text-muted-foreground font-medium">
                        {crypto.market_cap_rank}
                      </span>
                    </div>

                    {/* Name & Symbol */}
                    <div className="col-span-3 flex items-center space-x-3">
                      <img
                        src={crypto.image}
                        alt={crypto.name}
                        className="w-8 h-8 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            `data:image/svg+xml;base64,${btoa(`<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="16" fill="#${crypto.symbol === "btc" ? "F7931A" : crypto.symbol === "eth" ? "627EEA" : "00D4FF"}"/><text x="16" y="20" text-anchor="middle" fill="white" font-size="10" font-weight="bold">${crypto.symbol.toUpperCase()}</text></svg>`)}`;
                        }}
                      />
                      <div>
                        <div className="font-semibold text-foreground">
                          {crypto.name}
                        </div>
                        <div className="text-sm text-muted-foreground uppercase">
                          {crypto.symbol}
                        </div>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono font-semibold text-foreground">
                        {formatCurrency(crypto.current_price)}
                      </div>
                    </div>

                    {/* 24h Change */}
                    <div className="col-span-2 text-right">
                      <Badge
                        variant="outline"
                        className={`font-mono ${
                          isPositive
                            ? "text-success border-success/20 bg-success/10"
                            : "text-destructive border-destructive/20 bg-destructive/10"
                        }`}
                      >
                        <div className="flex items-center space-x-1">
                          {isPositive ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>
                            {formatPercentage(
                              crypto.price_change_percentage_24h,
                            )}
                          </span>
                        </div>
                      </Badge>
                    </div>

                    {/* Market Cap */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-foreground">
                        {formatLargeNumber(crypto.market_cap)}
                      </div>
                    </div>

                    {/* Volume */}
                    <div className="col-span-2 text-right">
                      <div className="font-mono text-muted-foreground">
                        {formatLargeNumber(crypto.total_volume)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
