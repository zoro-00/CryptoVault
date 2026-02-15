// Trading service - Manage trades and orders
import type { ApiResponse } from "@/lib/types";

export interface TradingPair {
  id: string;
  baseAsset: string;
  quoteAsset: string;
  symbol: string;
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  high24h: number;
  low24h: number;
}

export interface Order {
  id: string;
  userId: string;
  pair: string;
  type: "market" | "limit" | "stop";
  side: "buy" | "sell";
  amount: number;
  price?: number;
  stopPrice?: number;
  status: "pending" | "filled" | "cancelled" | "rejected";
  filledAmount: number;
  totalValue: number;
  fee: number;
  createdAt: Date;
  updatedAt: Date;
  filledAt?: Date;
}

export interface Trade {
  id: string;
  orderId: string;
  userId: string;
  pair: string;
  side: "buy" | "sell";
  amount: number;
  price: number;
  totalValue: number;
  fee: number;
  executedAt: Date;
}

// In-memory storage for demo
let orders: Map<string, Order[]> = new Map([
  [
    "demo-user",
    [
      {
        id: "order-1",
        userId: "demo-user",
        pair: "BTC/USD",
        type: "limit",
        side: "buy",
        amount: 0.1,
        price: 42000,
        status: "filled",
        filledAmount: 0.1,
        totalValue: 4200,
        fee: 8.4,
        createdAt: new Date("2024-02-10"),
        updatedAt: new Date("2024-02-10"),
        filledAt: new Date("2024-02-10"),
      },
      {
        id: "order-2",
        userId: "demo-user",
        pair: "ETH/USD",
        type: "market",
        side: "buy",
        amount: 2,
        status: "filled",
        filledAmount: 2,
        totalValue: 5300,
        fee: 10.6,
        createdAt: new Date("2024-02-12"),
        updatedAt: new Date("2024-02-12"),
        filledAt: new Date("2024-02-12"),
      },
    ],
  ],
]);

let trades: Map<string, Trade[]> = new Map();

const TRADING_FEE_PERCENTAGE = 0.002; // 0.2% trading fee

/**
 * Get available trading pairs
 */
export async function getTradingPairs(): Promise<ApiResponse<TradingPair[]>> {
  try {
    // Mock trading pairs
    const pairs: TradingPair[] = [
      {
        id: "btc-usd",
        baseAsset: "BTC",
        quoteAsset: "USD",
        symbol: "BTC/USD",
        currentPrice: 43250.5,
        priceChange24h: 2.45,
        volume24h: 25400000000,
        high24h: 43800.25,
        low24h: 42100.75,
      },
      {
        id: "eth-usd",
        baseAsset: "ETH",
        quoteAsset: "USD",
        symbol: "ETH/USD",
        currentPrice: 2650.75,
        priceChange24h: -1.25,
        volume24h: 12300000000,
        high24h: 2720.5,
        low24h: 2580.25,
      },
      {
        id: "bnb-usd",
        baseAsset: "BNB",
        quoteAsset: "USD",
        symbol: "BNB/USD",
        currentPrice: 315.25,
        priceChange24h: 0.85,
        volume24h: 1850000000,
        high24h: 320.75,
        low24h: 310.5,
      },
    ];

    return {
      success: true,
      data: pairs,
    };
  } catch (error) {
    console.error("Get trading pairs error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get trading pairs",
      data: [],
    };
  }
}

/**
 * Get user's orders
 */
export async function getUserOrders(
  userId: string,
  options?: { status?: string; limit?: number },
): Promise<ApiResponse<Order[]>> {
  try {
    let userOrders = orders.get(userId) || [];

    if (options?.status) {
      userOrders = userOrders.filter((o) => o.status === options.status);
    }

    // Sort by date desc
    userOrders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (options?.limit) {
      userOrders = userOrders.slice(0, options.limit);
    }

    return {
      success: true,
      data: userOrders,
    };
  } catch (error) {
    console.error("Get user orders error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get orders",
      data: [],
    };
  }
}

/**
 * Create a new order
 */
export async function createOrder(
  userId: string,
  orderData: {
    pair: string;
    type: "market" | "limit" | "stop";
    side: "buy" | "sell";
    amount: number;
    price?: number;
    stopPrice?: number;
  },
): Promise<ApiResponse<Order>> {
  try {
    const userOrders = orders.get(userId) || [];

    // Calculate total value and fee
    const price = orderData.price || 43250.5; // Use current market price if market order
    const totalValue = orderData.amount * price;
    const fee = totalValue * TRADING_FEE_PERCENTAGE;

    const newOrder: Order = {
      id: `order-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      pair: orderData.pair,
      type: orderData.type,
      side: orderData.side,
      amount: orderData.amount,
      price: orderData.price,
      stopPrice: orderData.stopPrice,
      status: orderData.type === "market" ? "filled" : "pending",
      filledAmount: orderData.type === "market" ? orderData.amount : 0,
      totalValue,
      fee,
      createdAt: new Date(),
      updatedAt: new Date(),
      filledAt: orderData.type === "market" ? new Date() : undefined,
    };

    userOrders.push(newOrder);
    orders.set(userId, userOrders);

    // Create trade if market order
    if (orderData.type === "market") {
      await createTradeFromOrder(userId, newOrder);
    }

    return {
      success: true,
      data: newOrder,
      message: "Order created successfully",
    };
  } catch (error) {
    console.error("Create order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create order",
    };
  }
}

/**
 * Cancel an order
 */
export async function cancelOrder(
  userId: string,
  orderId: string,
): Promise<ApiResponse<Order>> {
  try {
    const userOrders = orders.get(userId) || [];
    const order = userOrders.find((o) => o.id === orderId);

    if (!order) {
      return {
        success: false,
        error: "Order not found",
      };
    }

    if (order.status === "filled") {
      return {
        success: false,
        error: "Cannot cancel filled order",
      };
    }

    order.status = "cancelled";
    order.updatedAt = new Date();

    orders.set(userId, userOrders);

    return {
      success: true,
      data: order,
      message: "Order cancelled successfully",
    };
  } catch (error) {
    console.error("Cancel order error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to cancel order",
    };
  }
}

/**
 * Get user's trade history
 */
export async function getTradeHistory(
  userId: string,
  limit?: number,
): Promise<ApiResponse<Trade[]>> {
  try {
    let userTrades = trades.get(userId) || [];

    // Sort by date desc
    userTrades.sort((a, b) => b.executedAt.getTime() - a.executedAt.getTime());

    if (limit) {
      userTrades = userTrades.slice(0, limit);
    }

    return {
      success: true,
      data: userTrades,
    };
  } catch (error) {
    console.error("Get trade history error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get trade history",
      data: [],
    };
  }
}

/**
 * Create trade from order
 */
async function createTradeFromOrder(
  userId: string,
  order: Order,
): Promise<void> {
  const userTrades = trades.get(userId) || [];

  const newTrade: Trade = {
    id: `trade-${Date.now()}-${Math.random().toString(36).substring(7)}`,
    orderId: order.id,
    userId,
    pair: order.pair,
    side: order.side,
    amount: order.amount,
    price: order.price || order.totalValue / order.amount,
    totalValue: order.totalValue,
    fee: order.fee,
    executedAt: new Date(),
  };

  userTrades.push(newTrade);
  trades.set(userId, userTrades);
}

/**
 * Get order book (mock data)
 */
export async function getOrderBook(pair: string): Promise<
  ApiResponse<{
    bids: Array<{ price: number; amount: number; total: number }>;
    asks: Array<{ price: number; amount: number; total: number }>;
  }>
> {
  try {
    // Mock order book data
    const currentPrice = 43250.5;

    const bids = Array.from({ length: 20 }, (_, i) => {
      const price = currentPrice - (i + 1) * 10;
      const amount = Math.random() * 2;
      return {
        price,
        amount,
        total: price * amount,
      };
    });

    const asks = Array.from({ length: 20 }, (_, i) => {
      const price = currentPrice + (i + 1) * 10;
      const amount = Math.random() * 2;
      return {
        price,
        amount,
        total: price * amount,
      };
    });

    return {
      success: true,
      data: { bids, asks },
    };
  } catch (error) {
    console.error("Get order book error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get order book",
    };
  }
}

/**
 * Get trading statistics
 */
export async function getTradingStats(userId: string): Promise<
  ApiResponse<{
    totalOrders: number;
    filledOrders: number;
    totalVolume: number;
    totalFees: number;
    profitLoss: number;
  }>
> {
  try {
    const userOrders = orders.get(userId) || [];
    const userTrades = trades.get(userId) || [];

    const stats = {
      totalOrders: userOrders.length,
      filledOrders: userOrders.filter((o) => o.status === "filled").length,
      totalVolume: userTrades.reduce((sum, t) => sum + t.totalValue, 0),
      totalFees: userOrders.reduce((sum, o) => sum + o.fee, 0),
      profitLoss: 0, // Would calculate based on buy/sell trades
    };

    return {
      success: true,
      data: stats,
    };
  } catch (error) {
    console.error("Get trading stats error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get trading stats",
    };
  }
}
