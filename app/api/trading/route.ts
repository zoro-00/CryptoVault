import { NextRequest, NextResponse } from "next/server";
import {
  getTradingPairs,
  getUserOrders,
  createOrder,
  cancelOrder,
  getTradeHistory,
  getOrderBook,
  getTradingStats,
} from "@/lib/api/trading";

// GET /api/trading - Get trading data
// GET /api/trading?type=pairs - Get trading pairs
// GET /api/trading?type=orders - Get user orders
// GET /api/trading?type=trades - Get trade history
// GET /api/trading?type=orderbook&pair=BTC/USD - Get order book
// GET /api/trading?type=stats - Get trading statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user";
    const type = searchParams.get("type") || "pairs";
    const status = searchParams.get("status") || undefined;
    const limit = parseInt(searchParams.get("limit") || "50");
    const pair = searchParams.get("pair") || "BTC/USD";

    switch (type) {
      case "pairs":
        const pairsResult = await getTradingPairs();
        return NextResponse.json(pairsResult);

      case "orders":
        const ordersResult = await getUserOrders(userId, { status, limit });
        return NextResponse.json(ordersResult);

      case "trades":
        const tradesResult = await getTradeHistory(userId, limit);
        return NextResponse.json(tradesResult);

      case "orderbook":
        const orderbookResult = await getOrderBook(pair);
        return NextResponse.json(orderbookResult);

      case "stats":
        const statsResult = await getTradingStats(userId);
        return NextResponse.json(statsResult);

      default:
        return NextResponse.json(
          { success: false, error: "Invalid type parameter" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Trading GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/trading - Create order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user";

    if (!body.pair || !body.type || !body.side || !body.amount) {
      return NextResponse.json(
        {
          success: false,
          error: "Pair, type, side, and amount are required",
        },
        { status: 400 },
      );
    }

    const validTypes = ["market", "limit", "stop"];
    const validSides = ["buy", "sell"];

    if (!validTypes.includes(body.type)) {
      return NextResponse.json(
        { success: false, error: "Invalid order type" },
        { status: 400 },
      );
    }

    if (!validSides.includes(body.side)) {
      return NextResponse.json(
        { success: false, error: "Invalid order side" },
        { status: 400 },
      );
    }

    if (body.type === "limit" && !body.price) {
      return NextResponse.json(
        { success: false, error: "Price is required for limit orders" },
        { status: 400 },
      );
    }

    if (body.type === "stop" && !body.stopPrice) {
      return NextResponse.json(
        { success: false, error: "Stop price is required for stop orders" },
        { status: 400 },
      );
    }

    const result = await createOrder(userId, {
      pair: body.pair,
      type: body.type,
      side: body.side,
      amount: body.amount,
      price: body.price,
      stopPrice: body.stopPrice,
    });

    return NextResponse.json(result, {
      status: result.success ? 201 : 400,
    });
  } catch (error) {
    console.error("Trading POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/trading?orderId=xxx - Cancel order
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user";
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const result = await cancelOrder(userId, orderId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    console.error("Trading DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
