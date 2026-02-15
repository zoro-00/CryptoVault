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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Activity,
  DollarSign,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

interface Order {
  id: string;
  userId: string;
  pair: string;
  type: "buy" | "sell";
  orderType: "market" | "limit" | "stop";
  amount: number;
  price?: number;
  filled: number;
  status: "pending" | "filled" | "cancelled" | "partial";
  createdAt: string;
}

interface Trade {
  id: string;
  orderId: string;
  pair: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  total: number;
  fee: number;
  timestamp: string;
}

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export default function TradingPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orderBook, setOrderBook] = useState<{
    bids: OrderBookEntry[];
    asks: OrderBookEntry[];
  }>({
    bids: [],
    asks: [],
  });
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Order form state
  const [orderForm, setOrderForm] = useState({
    pair: "BTC/USDT",
    type: "buy" as "buy" | "sell",
    orderType: "limit" as "market" | "limit" | "stop",
    amount: "",
    price: "",
  });

  const tradingPairs = [
    "BTC/USDT",
    "ETH/USDT",
    "BNB/USDT",
    "SOL/USDT",
    "ADA/USDT",
  ];

  useEffect(() => {
    loadTradingData();
  }, []);

  const loadTradingData = async () => {
    setLoading(true);
    try {
      const [ordersRes, tradesRes, orderBookRes, statsRes] = await Promise.all([
        fetch("/api/trading?type=orders"),
        fetch("/api/trading?type=trades&limit=20"),
        fetch("/api/trading?type=orderbook&pair=BTC/USDT"),
        fetch("/api/trading?type=stats&pair=BTC/USDT"),
      ]);

      const [ordersData, tradesData, orderBookData, statsData] =
        await Promise.all([
          ordersRes.json(),
          tradesRes.json(),
          orderBookRes.json(),
          statsRes.json(),
        ]);

      if (ordersData.success) setOrders(ordersData.data || []);
      if (tradesData.success) setTrades(tradesData.data || []);
      if (orderBookData.success)
        setOrderBook(orderBookData.data || { bids: [], asks: [] });
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      toast.error("Failed to load trading data");
    } finally {
      setLoading(false);
    }
  };

  const placeOrder = async () => {
    if (
      !orderForm.amount ||
      (orderForm.orderType !== "market" && !orderForm.price)
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const res = await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "placeOrder",
          order: {
            pair: orderForm.pair,
            type: orderForm.type,
            orderType: orderForm.orderType,
            amount: parseFloat(orderForm.amount),
            price: orderForm.price ? parseFloat(orderForm.price) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order placed successfully!");
        setOrderForm({ ...orderForm, amount: "", price: "" });
        loadTradingData();
      } else {
        toast.error(data.error || "Failed to place order");
      }
    } catch (error) {
      toast.error("Failed to place order");
    }
  };

  const cancelOrder = async (orderId: string) => {
    try {
      const res = await fetch("/api/trading", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "cancelOrder",
          orderId,
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Order cancelled");
        loadTradingData();
      } else {
        toast.error(data.error || "Failed to cancel order");
      }
    } catch (error) {
      toast.error("Failed to cancel order");
    }
  };



  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "filled":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "cancelled":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Trading</h1>
          <p className="text-muted-foreground">
            Place orders, view trades, and manage your positions
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.volume24h)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Last Price
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stats.lastPrice)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h High
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-500">
                  {formatCurrency(stats.high24h)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  24h Low
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-500">
                  {formatCurrency(stats.low24h)}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trading Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Place Order</CardTitle>
                <CardDescription>Buy or sell cryptocurrency</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pair Selection */}
                <div className="space-y-2">
                  <Label>Trading Pair</Label>
                  <Select
                    value={orderForm.pair}
                    onValueChange={(val) =>
                      setOrderForm({ ...orderForm, pair: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {tradingPairs.map((pair) => (
                        <SelectItem key={pair} value={pair}>
                          {pair}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Buy/Sell Toggle */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={orderForm.type === "buy" ? "default" : "outline"}
                    onClick={() => setOrderForm({ ...orderForm, type: "buy" })}
                    className={
                      orderForm.type === "buy"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    Buy
                  </Button>
                  <Button
                    variant={orderForm.type === "sell" ? "default" : "outline"}
                    onClick={() => setOrderForm({ ...orderForm, type: "sell" })}
                    className={
                      orderForm.type === "sell"
                        ? "bg-red-500 hover:bg-red-600"
                        : ""
                    }
                  >
                    Sell
                  </Button>
                </div>

                {/* Order Type */}
                <div className="space-y-2">
                  <Label>Order Type</Label>
                  <Select
                    value={orderForm.orderType}
                    onValueChange={(val: any) =>
                      setOrderForm({ ...orderForm, orderType: val })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price (for limit/stop orders) */}
                {orderForm.orderType !== "market" && (
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (USDT)</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={orderForm.price}
                      onChange={(e) =>
                        setOrderForm({ ...orderForm, price: e.target.value })
                      }
                    />
                  </div>
                )}

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={orderForm.amount}
                    onChange={(e) =>
                      setOrderForm({ ...orderForm, amount: e.target.value })
                    }
                  />
                </div>

                {/* Total */}
                {orderForm.amount && orderForm.price && (
                  <div className="p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total</div>
                    <div className="text-lg font-bold">
                      {formatCurrency(
                        parseFloat(orderForm.amount) *
                          parseFloat(orderForm.price),
                      )}
                    </div>
                  </div>
                )}

                {/* Place Order Button */}
                <Button
                  onClick={placeOrder}
                  className={`w-full ${
                    orderForm.type === "buy"
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {orderForm.type === "buy" ? "Buy" : "Sell"}{" "}
                  {orderForm.pair.split("/")[0]}
                </Button>
              </CardContent>
            </Card>

            {/* Order Book */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Order Book</CardTitle>
                <CardDescription>Current bids and asks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Asks */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      ASKS
                    </div>
                    <div className="space-y-1">
                      {orderBook.asks.slice(0, 5).map((ask, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-red-500">
                            {formatCurrency(ask.price)}
                          </span>
                          <span className="text-muted-foreground">
                            {ask.amount.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Spread */}
                  <div className="text-center py-2 border-y">
                    <div className="text-xs text-muted-foreground">Spread</div>
                    {orderBook.asks[0] && orderBook.bids[0] && (
                      <div className="text-sm font-medium">
                        {formatCurrency(
                          orderBook.asks[0].price - orderBook.bids[0].price,
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bids */}
                  <div>
                    <div className="text-xs font-medium text-muted-foreground mb-2">
                      BIDS
                    </div>
                    <div className="space-y-1">
                      {orderBook.bids.slice(0, 5).map((bid, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-green-500">
                            {formatCurrency(bid.price)}
                          </span>
                          <span className="text-muted-foreground">
                            {bid.amount.toFixed(4)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders & Trades */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="orders" className="space-y-4">
              <TabsList>
                <TabsTrigger value="orders">Open Orders</TabsTrigger>
                <TabsTrigger value="history">Order History</TabsTrigger>
                <TabsTrigger value="trades">Trade History</TabsTrigger>
              </TabsList>

              {/* Open Orders */}
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Open Orders</CardTitle>
                    <CardDescription>Your active orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading orders...
                      </div>
                    ) : orders.filter(
                        (o) => o.status === "pending" || o.status === "partial",
                      ).length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No open orders
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Pair</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Order Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Filled</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders
                            .filter(
                              (o) =>
                                o.status === "pending" ||
                                o.status === "partial",
                            )
                            .map((order) => (
                              <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                  {order.pair}
                                </TableCell>
                                <TableCell>
                                  <Badge
                                    variant={
                                      order.type === "buy"
                                        ? "default"
                                        : "destructive"
                                    }
                                  >
                                    {order.type.toUpperCase()}
                                  </Badge>
                                </TableCell>
                                <TableCell>{order.orderType}</TableCell>
                                <TableCell className="text-right">
                                  {order.amount}
                                </TableCell>
                                <TableCell className="text-right">
                                  {order.price
                                    ? formatCurrency(order.price)
                                    : "Market"}
                                </TableCell>
                                <TableCell className="text-right">
                                  {order.filled} (
                                  {(
                                    (order.filled / order.amount) *
                                    100
                                  ).toFixed(0)}
                                  %)
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getStatusIcon(order.status)}
                                    {order.status}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => cancelOrder(order.id)}
                                  >
                                    Cancel
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Order History */}
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Order History</CardTitle>
                    <CardDescription>All your orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading history...
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No order history
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Pair</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.id}>
                              <TableCell>
                                {formatDate(order.createdAt)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {order.pair}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    order.type === "buy"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {order.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {order.amount}
                              </TableCell>
                              <TableCell className="text-right">
                                {order.price
                                  ? formatCurrency(order.price)
                                  : "Market"}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {getStatusIcon(order.status)}
                                  {order.status}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Trade History */}
              <TabsContent value="trades">
                <Card>
                  <CardHeader>
                    <CardTitle>Trade History</CardTitle>
                    <CardDescription>Your executed trades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading trades...
                      </div>
                    ) : trades.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No trade history
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Pair</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Price</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                            <TableHead className="text-right">Fee</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {trades.map((trade) => (
                            <TableRow key={trade.id}>
                              <TableCell>
                                {formatDate(trade.timestamp)}
                              </TableCell>
                              <TableCell className="font-medium">
                                {trade.pair}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    trade.type === "buy"
                                      ? "default"
                                      : "destructive"
                                  }
                                >
                                  {trade.type.toUpperCase()}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                {trade.amount}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(trade.price)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(trade.total)}
                              </TableCell>
                              <TableCell className="text-right">
                                {formatCurrency(trade.fee)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
