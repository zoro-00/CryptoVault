// API Client for frontend components
import type {
  ApiResponse,
  PaginatedResponse,
  SearchResult,
  Notification,
  User,
  UserSettings,
  WalletConnection,
} from "@/lib/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`API request error for ${endpoint}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Network error",
    };
  }
}

/**
 * Search API
 */
export const searchApi = {
  /**
   * Search for cryptocurrencies
   */
  async search(query: string): Promise<ApiResponse<SearchResult[]>> {
    return apiRequest<SearchResult[]>(
      `/api/search?q=${encodeURIComponent(query)}`,
    );
  },
};

/**
 * Notifications API
 */
export const notificationsApi = {
  /**
   * Get all notifications
   */
  async getAll(options?: {
    page?: number;
    limit?: number;
    unreadOnly?: boolean;
  }): Promise<PaginatedResponse<Notification>> {
    const params = new URLSearchParams();
    if (options?.page) params.append("page", options.page.toString());
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.unreadOnly) params.append("unreadOnly", "true");

    return apiRequest<Notification[]>(
      `/api/notifications?${params.toString()}`,
    ) as Promise<PaginatedResponse<Notification>>;
  },

  /**
   * Get unread count
   */
  async getUnreadCount(): Promise<ApiResponse<number>> {
    return apiRequest<number>("/api/notifications?count=true");
  },

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<ApiResponse<Notification>> {
    return apiRequest<Notification>("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ notificationId }),
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<ApiResponse<number>> {
    return apiRequest<number>("/api/notifications", {
      method: "PATCH",
      body: JSON.stringify({ markAll: true }),
    });
  },

  /**
   * Delete a notification
   */
  async delete(notificationId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/notifications?id=${notificationId}`, {
      method: "DELETE",
    });
  },

  /**
   * Create a notification
   */
  async create(notification: {
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error" | "price_alert";
    link?: string;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<Notification>> {
    return apiRequest<Notification>("/api/notifications", {
      method: "POST",
      body: JSON.stringify(notification),
    });
  },
};

/**
 * User API
 */
export const userApi = {
  /**
   * Get current user (demo)
   */
  async getCurrent(): Promise<ApiResponse<User>> {
    return apiRequest<User>("/api/user?demo=true");
  },

  /**
   * Get user by ID
   */
  async getById(userId: string): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/api/user?id=${userId}`);
  },

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<ApiResponse<User>> {
    return apiRequest<User>(`/api/user?email=${encodeURIComponent(email)}`);
  },

  /**
   * Create a new user
   */
  async create(userData: {
    email: string;
    name: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> {
    return apiRequest<User>("/api/user", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  /**
   * Update user profile
   */
  async update(updates: {
    name?: string;
    email?: string;
    avatar?: string;
  }): Promise<ApiResponse<User>> {
    return apiRequest<User>("/api/user", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },

  /**
   * Authenticate user
   */
  async authenticate(
    email: string,
    password: string,
  ): Promise<ApiResponse<User>> {
    return apiRequest<User>("/api/user", {
      method: "POST",
      body: JSON.stringify({ email, password, action: "auth" }),
    });
  },

  /**
   * Delete user
   */
  async delete(userId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/user?id=${userId}`, {
      method: "DELETE",
    });
  },
};

/**
 * Settings API
 */
export const settingsApi = {
  /**
   * Get user settings
   */
  async get(): Promise<ApiResponse<UserSettings>> {
    return apiRequest<UserSettings>("/api/settings");
  },

  /**
   * Update settings
   */
  async update(
    settings: Partial<UserSettings>,
  ): Promise<ApiResponse<UserSettings>> {
    return apiRequest<UserSettings>("/api/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
  },

  /**
   * Toggle a specific setting
   */
  async toggle(
    setting:
      | "darkMode"
      | "notifications"
      | "priceAlerts"
      | "emailNotifications"
      | "pushNotifications",
  ): Promise<ApiResponse<UserSettings>> {
    return apiRequest<UserSettings>("/api/settings", {
      method: "POST",
      body: JSON.stringify({ action: "toggle", setting }),
    });
  },

  /**
   * Reset settings to defaults
   */
  async reset(): Promise<ApiResponse<UserSettings>> {
    return apiRequest<UserSettings>("/api/settings", {
      method: "POST",
      body: JSON.stringify({ action: "reset" }),
    });
  },
};

/**
 * Wallet API
 */
export const walletApi = {
  /**
   * Get all wallet connections
   */
  async getAll(): Promise<ApiResponse<WalletConnection[]>> {
    return apiRequest<WalletConnection[]>("/api/wallet");
  },

  /**
   * Get active wallet
   */
  async getActive(): Promise<ApiResponse<WalletConnection | null>> {
    return apiRequest<WalletConnection | null>("/api/wallet?active=true");
  },

  /**
   * Connect wallet
   */
  async connect(walletData: {
    address: string;
    provider: "metamask" | "walletconnect" | "coinbase" | "phantom";
    chainId: number;
    balance?: string;
  }): Promise<ApiResponse<WalletConnection>> {
    return apiRequest<WalletConnection>("/api/wallet", {
      method: "POST",
      body: JSON.stringify(walletData),
    });
  },

  /**
   * Disconnect wallet
   */
  async disconnect(walletId: string): Promise<ApiResponse<void>> {
    return apiRequest<void>(`/api/wallet?id=${walletId}`, {
      method: "DELETE",
    });
  },

  /**
   * Disconnect all wallets
   */
  async disconnectAll(): Promise<ApiResponse<void>> {
    return apiRequest<void>("/api/wallet?all=true", {
      method: "DELETE",
    });
  },

  /**
   * Update wallet balance
   */
  async updateBalance(
    walletId: string,
    balance: string,
  ): Promise<ApiResponse<WalletConnection>> {
    return apiRequest<WalletConnection>("/api/wallet", {
      method: "PATCH",
      body: JSON.stringify({ walletId, balance }),
    });
  },

  /**
   * Verify wallet signature
   */
  async verifySignature(
    address: string,
    signature: string,
    message: string,
  ): Promise<ApiResponse<boolean>> {
    return apiRequest<boolean>("/api/wallet", {
      method: "POST",
      body: JSON.stringify({ action: "verify", address, signature, message }),
    });
  },

  /**
   * Get wallet balance from blockchain
   */
  async getBalance(
    address: string,
    chainId: number,
  ): Promise<ApiResponse<string>> {
    return apiRequest<string>(
      `/api/wallet?balance=true&address=${address}&chainId=${chainId}`,
    );
  },
};

// Export all APIs as a single object
export const api = {
  search: searchApi,
  notifications: notificationsApi,
  user: userApi,
  settings: settingsApi,
  wallet: walletApi,
};

export default api;
