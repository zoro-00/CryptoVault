# CryptoVault Backend API Documentation

This document provides comprehensive documentation for all backend APIs in the CryptoVault application.

## Table of Contents

- [Overview](#overview)
- [API Client Usage](#api-client-usage)
- [Search API](#search-api)
- [Notifications API](#notifications-api)
- [User API](#user-api)
- [Settings API](#settings-api)
- [Wallet API](#wallet-api)
- [Type Definitions](#type-definitions)

## Overview

The CryptoVault backend consists of RESTful API endpoints built with Next.js App Router. All APIs return JSON responses with a consistent structure:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

## API Client Usage

Import the API client in your components:

```typescript
import { api } from "@/lib/api-client";

// Or import specific APIs
import {
  searchApi,
  notificationsApi,
  userApi,
  settingsApi,
  walletApi,
} from "@/lib/api-client";
```

## Search API

### Endpoints

#### `GET /api/search?q={query}`

Search for cryptocurrencies by name or symbol.

**Parameters:**

- `q` (required): Search query (minimum 2 characters)

**Response:**

```typescript
{
  success: true,
  data: SearchResult[]
}
```

**Client Usage:**

```typescript
const result = await api.search.search("bitcoin");
if (result.success && result.data) {
  console.log(result.data); // Array of SearchResult
}
```

## Notifications API

### Endpoints

#### `GET /api/notifications`

Get all notifications for the current user.

**Parameters:**

- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `unreadOnly` (optional): Filter unread only (boolean)
- `count` (optional): Get unread count instead (boolean)

**Response:**

```typescript
{
  success: true,
  data: Notification[],
  page: number,
  limit: number,
  total: number,
  hasMore: boolean
}
```

#### `POST /api/notifications`

Create a new notification.

**Body:**

```json
{
  "title": "Notification Title",
  "message": "Notification message",
  "type": "info",
  "link": "/optional/link",
  "metadata": {}
}
```

#### `PATCH /api/notifications`

Mark notification(s) as read.

**Body (single):**

```json
{
  "notificationId": "notification-id"
}
```

**Body (all):**

```json
{
  "markAll": true
}
```

#### `DELETE /api/notifications?id={notificationId}`

Delete a specific notification.

**Client Usage:**

```typescript
// Get all notifications
const notifications = await api.notifications.getAll({ page: 1, limit: 10 });

// Get unread count
const countResult = await api.notifications.getUnreadCount();

// Mark as read
await api.notifications.markAsRead("notification-id");

// Mark all as read
await api.notifications.markAllAsRead();

// Create notification
await api.notifications.create({
  title: "New Alert",
  message: "BTC reached $50,000",
  type: "price_alert",
});

// Delete notification
await api.notifications.delete("notification-id");
```

## User API

### Endpoints

#### `GET /api/user`

Get user information.

**Parameters:**

- `id` (optional): User ID
- `email` (optional): User email
- `demo` (optional): Get demo user (boolean)

**Response:**

```typescript
{
  success: true,
  data: User
}
```

#### `POST /api/user`

Create a new user or authenticate.

**Body (create):**

```json
{
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://example.com/avatar.jpg"
}
```

**Body (authenticate):**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "action": "auth"
}
```

#### `PATCH /api/user`

Update user profile.

**Body:**

```json
{
  "name": "New Name",
  "email": "newemail@example.com",
  "avatar": "https://example.com/new-avatar.jpg"
}
```

#### `DELETE /api/user?id={userId}`

Delete a user.

**Client Usage:**

```typescript
// Get current user
const user = await api.user.getCurrent();

// Get by ID
const userById = await api.user.getById("user-id");

// Get by email
const userByEmail = await api.user.getByEmail("user@example.com");

// Create user
await api.user.create({
  email: "new@example.com",
  name: "New User",
});

// Update user
await api.user.update({
  name: "Updated Name",
});

// Authenticate
const authResult = await api.user.authenticate("email@example.com", "password");

// Delete user
await api.user.delete("user-id");
```

## Settings API

### Endpoints

#### `GET /api/settings`

Get user settings.

**Response:**

```typescript
{
  success: true,
  data: UserSettings
}
```

#### `POST /api/settings`

Update settings or toggle a specific setting.

**Body (update):**

```json
{
  "darkMode": true,
  "notifications": true,
  "priceAlerts": true,
  "currency": "USD",
  "language": "en"
}
```

**Body (toggle):**

```json
{
  "action": "toggle",
  "setting": "darkMode"
}
```

**Body (reset):**

```json
{
  "action": "reset"
}
```

#### `PATCH /api/settings`

Partial update of settings.

#### `DELETE /api/settings`

Reset settings to defaults.

**Client Usage:**

```typescript
// Get settings
const settings = await api.settings.get();

// Update settings
await api.settings.update({
  darkMode: true,
  notifications: false,
});

// Toggle a setting
await api.settings.toggle("darkMode");

// Reset to defaults
await api.settings.reset();
```

## Wallet API

### Endpoints

#### `GET /api/wallet`

Get wallet connections.

**Parameters:**

- `active` (optional): Get only active wallet (boolean)
- `balance` (optional): Get wallet balance (boolean)
- `address` (optional): Wallet address (required with balance)
- `chainId` (optional): Chain ID (required with balance)

**Response:**

```typescript
{
  success: true,
  data: WalletConnection[] | WalletConnection | null
}
```

#### `POST /api/wallet`

Connect a wallet or verify signature.

**Body (connect):**

```json
{
  "address": "0x...",
  "provider": "metamask",
  "chainId": 1,
  "balance": "1.234"
}
```

**Body (verify):**

```json
{
  "action": "verify",
  "address": "0x...",
  "signature": "0x...",
  "message": "Sign this message"
}
```

#### `PATCH /api/wallet`

Update wallet data.

**Body:**

```json
{
  "walletId": "wallet-id",
  "balance": "2.345"
}
```

#### `DELETE /api/wallet`

Disconnect wallet(s).

**Parameters:**

- `id` (optional): Wallet ID to disconnect
- `all` (optional): Disconnect all wallets (boolean)

**Client Usage:**

```typescript
// Get all wallets
const wallets = await api.wallet.getAll();

// Get active wallet
const activeWallet = await api.wallet.getActive();

// Connect wallet
await api.wallet.connect({
  address: "0x1234...",
  provider: "metamask",
  chainId: 1,
  balance: "1.5",
});

// Disconnect wallet
await api.wallet.disconnect("wallet-id");

// Disconnect all
await api.wallet.disconnectAll();

// Update balance
await api.wallet.updateBalance("wallet-id", "2.5");

// Verify signature
const verified = await api.wallet.verifySignature(
  "0x1234...",
  "0xsignature...",
  "Sign this message",
);

// Get balance from blockchain
const balance = await api.wallet.getBalance("0x1234...", 1);
```

## Type Definitions

All types are defined in `/lib/types/index.ts`:

```typescript
// Core types
User;
UserSettings;
Notification;
WalletConnection;
SearchResult;
PriceAlert;
Portfolio;
PortfolioAsset;

// Response types
ApiResponse<T>;
PaginatedResponse<T>;
```

## Error Handling

All API responses include error information:

```typescript
const result = await api.user.getCurrent();

if (!result.success) {
  console.error("Error:", result.error);
  // Handle error
} else {
  console.log("Data:", result.data);
  // Use data
}
```

## Environment Variables

Configure these in your `.env.local`:

```env
# CoinGecko API
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key

# App Settings
NEXT_PUBLIC_APP_NAME=CryptoVault
NEXT_PUBLIC_DEFAULT_CURRENCY=usd
NEXT_PUBLIC_API_URL=
```

## Notes

- All endpoints currently use `demo-user` as the default user ID for development
- In production, implement proper authentication and get user ID from session
- Wallet signatures are mocked - implement real verification in production
- All data is stored in-memory - replace with a database in production
- Add rate limiting and proper validation before production deployment
