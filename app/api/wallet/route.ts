import { NextRequest, NextResponse } from "next/server";
import {
  getWalletConnections,
  getActiveWallet,
  connectWallet,
  disconnectWallet,
  disconnectAllWallets,
  updateWalletBalance,
  verifyWalletSignature,
  getWalletBalance,
} from "@/lib/api/wallet";

// GET /api/wallet - Get wallet connections
// GET /api/wallet?active=true - Get active wallet
// GET /api/wallet?balance=true&address=xxx&chainId=1 - Get wallet balance
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session
    const active = searchParams.get("active") === "true";
    const getBalance = searchParams.get("balance") === "true";
    const address = searchParams.get("address");
    const chainId = searchParams.get("chainId");

    // Get wallet balance
    if (getBalance && address && chainId) {
      const result = await getWalletBalance(address, parseInt(chainId));
      return NextResponse.json(result);
    }

    // Get active wallet
    if (active) {
      const result = await getActiveWallet(userId);
      return NextResponse.json(result);
    }

    // Get all wallet connections
    const result = await getWalletConnections(userId);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Wallet GET error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/wallet - Connect wallet or verify signature
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    // Verify signature
    if (body.action === "verify") {
      if (!body.address || !body.signature || !body.message) {
        return NextResponse.json(
          {
            success: false,
            error: "Address, signature, and message are required",
          },
          { status: 400 },
        );
      }

      const result = await verifyWalletSignature(
        body.address,
        body.signature,
        body.message,
      );
      return NextResponse.json(result);
    }

    // Connect wallet
    if (!body.address || !body.provider || body.chainId === undefined) {
      return NextResponse.json(
        {
          success: false,
          error: "Address, provider, and chainId are required",
        },
        { status: 400 },
      );
    }

    const validProviders = ["metamask", "walletconnect", "coinbase", "phantom"];
    if (!validProviders.includes(body.provider)) {
      return NextResponse.json(
        { success: false, error: "Invalid wallet provider" },
        { status: 400 },
      );
    }

    const result = await connectWallet(userId, {
      address: body.address,
      provider: body.provider,
      chainId: body.chainId,
      balance: body.balance,
    });

    return NextResponse.json(result, {
      status: result.success ? 200 : 400,
    });
  } catch (error) {
    console.error("Wallet POST error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PATCH /api/wallet - Update wallet data
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const userId = body.userId || "demo-user"; // In production, get from session

    if (!body.walletId) {
      return NextResponse.json(
        { success: false, error: "Wallet ID is required" },
        { status: 400 },
      );
    }

    // Update balance
    if (body.balance !== undefined) {
      const result = await updateWalletBalance(
        userId,
        body.walletId,
        body.balance,
      );
      return NextResponse.json(result);
    }

    return NextResponse.json(
      { success: false, error: "No valid updates provided" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Wallet PATCH error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE /api/wallet - Disconnect wallet
// DELETE /api/wallet?all=true - Disconnect all wallets
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || "demo-user"; // In production, get from session
    const disconnectAll = searchParams.get("all") === "true";
    const walletId = searchParams.get("id");

    // Disconnect all wallets
    if (disconnectAll) {
      const result = await disconnectAllWallets(userId);
      return NextResponse.json(result);
    }

    // Disconnect specific wallet
    if (!walletId) {
      return NextResponse.json(
        { success: false, error: "Wallet ID is required" },
        { status: 400 },
      );
    }

    const result = await disconnectWallet(userId, walletId);
    return NextResponse.json(result, {
      status: result.success ? 200 : 404,
    });
  } catch (error) {
    console.error("Wallet DELETE error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
