import { z } from "zod";

// ===== Trading Validation Schemas =====
export const orderSchema = z.object({
  pair: z.string().min(1, "Trading pair is required"),
  side: z.enum(["buy", "sell"], { message: "Side must be 'buy' or 'sell'" }),
  type: z.enum(["market", "limit", "stop-loss", "take-profit"], {
    message: "Invalid order type",
  }),
  amount: z.number().positive("Amount must be positive").finite("Amount must be finite"),
  price: z.number().positive("Price must be positive").finite("Price must be finite").optional(),
  stopPrice: z.number().positive("Stop price must be positive").finite().optional(),
});

export type OrderInput = z.infer<typeof orderSchema>;

// ===== Portfolio Validation Schemas =====
export const portfolioNameSchema = z.object({
  name: z
    .string()
    .min(1, "Portfolio name is required")
    .max(50, "Portfolio name too long")
    .trim(),
});

export const addAssetSchema = z.object({
  portfolioId: z.string().min(1, "Portfolio ID is required"),
  symbol: z.string().min(1, "Symbol is required").max(10).toUpperCase(),
  name: z.string().min(1, "Asset name is required").max(100),
  amount: z.number().positive("Amount must be positive").finite(),
  buyPrice: z.number().positive("Buy price must be positive").finite(),
});

export type AddAssetInput = z.infer<typeof addAssetSchema>;

// ===== Search Validation =====
export const searchQuerySchema = z.object({
  query: z.string().min(1, "Search query is required").max(200).trim(),
});

// ===== Pagination =====
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

// ===== Wallet Validation =====
export const walletAddressSchema = z.object({
  address: z
    .string()
    .min(26, "Invalid wallet address")
    .max(62, "Invalid wallet address"),
  type: z.enum(["ethereum", "bitcoin", "solana", "polygon"], {
    message: "Unsupported wallet type",
  }),
});
