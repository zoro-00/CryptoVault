// Type definitions for the CryptoVault application
// Re-export types from other modules for centralized access
export type { CryptoPrice, PriceHistory } from "@/lib/crypto-api";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserSettings {
  userId: string;
  darkMode: boolean;
  notifications: boolean;
  priceAlerts: boolean;
  currency: string;
  language: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error" | "price_alert";
  read: boolean;
  createdAt: Date;
  link?: string;
  metadata?: Record<string, any>;
}

export interface WalletConnection {
  id: string;
  userId: string;
  address: string;
  provider: "metamask" | "walletconnect" | "coinbase" | "phantom";
  chainId: number;
  balance?: string;
  connectedAt: Date;
  lastActive: Date;
}

export interface SearchResult {
  id: string;
  symbol: string;
  name: string;
  type: "crypto" | "token" | "nft";
  image?: string;
  current_price?: number;
  market_cap?: number;
  market_cap_rank?: number;
}

export interface PriceAlert {
  id: string;
  userId: string;
  coinId: string;
  coinSymbol: string;
  targetPrice: number;
  condition: "above" | "below";
  active: boolean;
  triggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  assets: PortfolioAsset[];
  totalValue: number;
  totalGain: number;
  totalGainPercentage: number;
  updatedAt: Date;
}

export interface PortfolioAsset {
  id: string;
  portfolioId: string;
  coinId: string;
  symbol: string;
  name: string;
  amount: number;
  purchasePrice: number;
  currentPrice: number;
  totalValue: number;
  gain: number;
  gainPercentage: number;
  purchasedAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}
