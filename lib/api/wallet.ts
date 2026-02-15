// Wallet connection service
import type { WalletConnection, ApiResponse } from "@/lib/types";

// In-memory storage for demo (replace with database in production)
let walletConnections: Map<string, WalletConnection[]> = new Map();

/**
 * Get all wallet connections for a user
 */
export async function getWalletConnections(
  userId: string,
): Promise<ApiResponse<WalletConnection[]>> {
  try {
    const connections = walletConnections.get(userId) || [];

    return {
      success: true,
      data: connections,
    };
  } catch (error) {
    console.error("Get wallet connections error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to get wallet connections",
      data: [],
    };
  }
}

/**
 * Get active wallet connection
 */
export async function getActiveWallet(
  userId: string,
): Promise<ApiResponse<WalletConnection | null>> {
  try {
    const connections = walletConnections.get(userId) || [];

    // Return the most recently active wallet
    if (connections.length > 0) {
      const activeWallet = connections.sort(
        (a, b) => b.lastActive.getTime() - a.lastActive.getTime(),
      )[0];

      return {
        success: true,
        data: activeWallet,
      };
    }

    return {
      success: true,
      data: null,
    };
  } catch (error) {
    console.error("Get active wallet error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get active wallet",
      data: null,
    };
  }
}

/**
 * Connect a wallet
 */
export async function connectWallet(
  userId: string,
  walletData: {
    address: string;
    provider: "metamask" | "walletconnect" | "coinbase" | "phantom";
    chainId: number;
    balance?: string;
  },
): Promise<ApiResponse<WalletConnection>> {
  try {
    const connections = walletConnections.get(userId) || [];

    // Check if wallet is already connected
    const existingConnection = connections.find(
      (c) => c.address.toLowerCase() === walletData.address.toLowerCase(),
    );

    if (existingConnection) {
      // Update last active time
      existingConnection.lastActive = new Date();
      if (walletData.balance) {
        existingConnection.balance = walletData.balance;
      }

      walletConnections.set(userId, connections);

      return {
        success: true,
        data: existingConnection,
        message: "Wallet reconnected successfully",
      };
    }

    // Create new connection
    const newConnection: WalletConnection = {
      id: `wallet-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      userId,
      address: walletData.address,
      provider: walletData.provider,
      chainId: walletData.chainId,
      balance: walletData.balance,
      connectedAt: new Date(),
      lastActive: new Date(),
    };

    connections.push(newConnection);
    walletConnections.set(userId, connections);

    return {
      success: true,
      data: newConnection,
      message: "Wallet connected successfully",
    };
  } catch (error) {
    console.error("Connect wallet error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to connect wallet",
    };
  }
}

/**
 * Disconnect a wallet
 */
export async function disconnectWallet(
  userId: string,
  walletId: string,
): Promise<ApiResponse<void>> {
  try {
    const connections = walletConnections.get(userId) || [];
    const index = connections.findIndex((c) => c.id === walletId);

    if (index === -1) {
      return {
        success: false,
        error: "Wallet connection not found",
      };
    }

    connections.splice(index, 1);
    walletConnections.set(userId, connections);

    return {
      success: true,
      message: "Wallet disconnected successfully",
    };
  } catch (error) {
    console.error("Disconnect wallet error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to disconnect wallet",
    };
  }
}

/**
 * Disconnect all wallets for a user
 */
export async function disconnectAllWallets(
  userId: string,
): Promise<ApiResponse<void>> {
  try {
    walletConnections.set(userId, []);

    return {
      success: true,
      message: "All wallets disconnected successfully",
    };
  } catch (error) {
    console.error("Disconnect all wallets error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to disconnect all wallets",
    };
  }
}

/**
 * Update wallet balance
 */
export async function updateWalletBalance(
  userId: string,
  walletId: string,
  balance: string,
): Promise<ApiResponse<WalletConnection>> {
  try {
    const connections = walletConnections.get(userId) || [];
    const wallet = connections.find((c) => c.id === walletId);

    if (!wallet) {
      return {
        success: false,
        error: "Wallet connection not found",
      };
    }

    wallet.balance = balance;
    wallet.lastActive = new Date();

    walletConnections.set(userId, connections);

    return {
      success: true,
      data: wallet,
      message: "Wallet balance updated",
    };
  } catch (error) {
    console.error("Update wallet balance error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to update wallet balance",
    };
  }
}

/**
 * Verify wallet signature (mock implementation)
 */
export async function verifyWalletSignature(
  address: string,
  signature: string,
  message: string,
): Promise<ApiResponse<boolean>> {
  try {
    // This is a mock implementation
    // In production, you would verify the signature using web3 libraries

    // Simulate verification delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For demo purposes, always return true
    // In production, implement actual signature verification
    const isValid = signature.length > 0 && message.length > 0;

    return {
      success: true,
      data: isValid,
      message: isValid ? "Signature verified" : "Invalid signature",
    };
  } catch (error) {
    console.error("Verify signature error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to verify signature",
      data: false,
    };
  }
}

/**
 * Get wallet balance from blockchain (mock)
 */
export async function getWalletBalance(
  address: string,
  chainId: number,
): Promise<ApiResponse<string>> {
  try {
    // This is a mock implementation
    // In production, you would fetch actual balance from blockchain

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Generate mock balance
    const mockBalance = (Math.random() * 10).toFixed(4);

    return {
      success: true,
      data: mockBalance,
      message: "Balance fetched successfully",
    };
  } catch (error) {
    console.error("Get wallet balance error:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to get wallet balance",
      data: "0",
    };
  }
}
