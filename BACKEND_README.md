# CryptoVault Backend Implementation

Complete backend implementation for all CryptoVault header features and more.

## 📁 Project Structure

```
CryptoVault/
├── lib/
│   ├── types/
│   │   └── index.ts              # TypeScript type definitions
│   ├── api/
│   │   ├── search.ts             # Search service logic
│   │   ├── notifications.ts      # Notifications service logic
│   │   ├── user.ts               # User/auth service logic
│   │   ├── settings.ts           # Settings service logic
│   │   └── wallet.ts             # Wallet connection service logic
│   ├── api-client.ts             # Frontend API client
│   └── api-usage-examples.tsx    # Usage examples
├── app/
│   └── api/
│       ├── search/
│       │   └── route.ts          # Search API endpoint
│       ├── notifications/
│       │   └── route.ts          # Notifications API endpoint
│       ├── user/
│       │   └── route.ts          # User API endpoint
│       ├── settings/
│       │   └── route.ts          # Settings API endpoint
│       └── wallet/
│           └── route.ts          # Wallet API endpoint
└── API_DOCUMENTATION.md          # Complete API documentation
```

## 🚀 Features Implemented

### 1. **Search API**

- Search cryptocurrencies by name or symbol
- Integration with CoinGecko API
- Mock data fallback for development
- Type-safe search results

### 2. **Notifications API**

- Create, read, update, delete notifications
- Mark as read (single/all)
- Get unread count
- Paginated results
- Multiple notification types (info, success, warning, error, price_alert)

### 3. **User API**

- User profile management (CRUD)
- Authentication (mock implementation)
- Get user by ID or email
- Demo user support

### 4. **Settings API**

- User preferences management
- Toggle settings (dark mode, notifications, price alerts)
- Update currency and language preferences
- Reset to defaults

### 5. **Wallet API**

- Connect/disconnect wallet
- Support for multiple providers (MetaMask, WalletConnect, Coinbase, Phantom)
- Wallet balance tracking
- Signature verification (mock)
- Multiple wallet management

## 📦 Installation

All dependencies are already included in your `package.json`:

```bash
npm install
# or
yarn install
```

## 🔧 Environment Variables

Create a `.env.local` file:

```env
# CoinGecko API
NEXT_PUBLIC_COINGECKO_API_URL=https://api.coingecko.com/api/v3
NEXT_PUBLIC_COINGECKO_API_KEY=your_api_key_here

# App Settings
NEXT_PUBLIC_APP_NAME=CryptoVault
NEXT_PUBLIC_DEFAULT_CURRENCY=usd
NEXT_PUBLIC_API_URL=
```

## 🎯 Usage

### Import the API Client

```typescript
import { api } from "@/lib/api-client";
```

### Example: Search

```typescript
const result = await api.search.search("bitcoin");
if (result.success && result.data) {
  console.log(result.data); // SearchResult[]
}
```

### Example: Notifications

```typescript
// Get notifications
const notifications = await api.notifications.getAll({ page: 1, limit: 10 });

// Get unread count
const count = await api.notifications.getUnreadCount();

// Mark as read
await api.notifications.markAsRead("notification-id");

// Mark all as read
await api.notifications.markAllAsRead();
```

### Example: User Profile

```typescript
// Get current user
const user = await api.user.getCurrent();

// Update profile
await api.user.update({
  name: "New Name",
  avatar: "https://example.com/avatar.jpg",
});
```

### Example: Settings

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
```

### Example: Wallet

```typescript
// Connect wallet
await api.wallet.connect({
  address: "0x1234...",
  provider: "metamask",
  chainId: 1,
  balance: "1.5",
});

// Get active wallet
const wallet = await api.wallet.getActive();

// Disconnect
await api.wallet.disconnect("wallet-id");
```

## 📝 API Endpoints

### Search

- `GET /api/search?q={query}` - Search cryptocurrencies

### Notifications

- `GET /api/notifications` - Get all notifications
- `GET /api/notifications?count=true` - Get unread count
- `POST /api/notifications` - Create notification
- `PATCH /api/notifications` - Mark as read
- `DELETE /api/notifications?id={id}` - Delete notification

### User

- `GET /api/user?demo=true` - Get demo user
- `GET /api/user?id={id}` - Get user by ID
- `POST /api/user` - Create user or authenticate
- `PATCH /api/user` - Update user
- `DELETE /api/user?id={id}` - Delete user

### Settings

- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings
- `PATCH /api/settings` - Partial update
- `DELETE /api/settings` - Reset to defaults

### Wallet

- `GET /api/wallet` - Get all wallets
- `GET /api/wallet?active=true` - Get active wallet
- `POST /api/wallet` - Connect wallet
- `PATCH /api/wallet` - Update wallet
- `DELETE /api/wallet?id={id}` - Disconnect wallet

## 🔐 Type Safety

All APIs are fully typed with TypeScript:

```typescript
import type {
  User,
  UserSettings,
  Notification,
  WalletConnection,
  SearchResult,
  ApiResponse,
  PaginatedResponse,
} from "@/lib/types";
```

## 🧪 Testing the APIs

### Using the Development Server

```bash
npm run dev
```

### Testing Endpoints

You can test endpoints using:

1. **Browser DevTools Console:**

```javascript
// Open your app in browser and use console
const result = await fetch("/api/search?q=bitcoin");
const data = await result.json();
console.log(data);
```

2. **cURL:**

```bash
# Search
curl "http://localhost:3000/api/search?q=bitcoin"

# Get notifications
curl "http://localhost:3000/api/notifications"

# Get user
curl "http://localhost:3000/api/user?demo=true"
```

3. **Postman or Similar Tools:**
   Import the endpoints and test with different payloads.

## 📚 Documentation

For detailed API documentation, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

For usage examples, see [lib/api-usage-examples.tsx](./lib/api-usage-examples.tsx)

## 🎨 Integration with Components

The backend is designed to work seamlessly with your header component:

```typescript
import { api } from "@/lib/api-client";
import { toast } from "sonner";

// In your component
const handleSearch = async (query: string) => {
  const result = await api.search.search(query);
  if (result.success && result.data) {
    // Show results
  } else {
    toast.error(result.error);
  }
};
```

## 🗄️ Data Storage

Currently uses **in-memory storage** for demonstration. For production:

1. Replace with a database (PostgreSQL, MongoDB, etc.)
2. Implement proper user authentication (NextAuth.js, Auth0, etc.)
3. Add data persistence
4. Implement proper security measures

## 🔒 Security Considerations

For production deployment:

- [ ] Implement proper authentication and authorization
- [ ] Add API rate limiting
- [ ] Validate and sanitize all inputs
- [ ] Implement CSRF protection
- [ ] Add API key management
- [ ] Set up proper CORS policies
- [ ] Implement request signing for wallet operations
- [ ] Add logging and monitoring
- [ ] Use environment variables for sensitive data
- [ ] Implement proper error handling without exposing internals

## 🚧 Next Steps

1. **Replace Mock Data:** Connect to real databases
2. **Add Authentication:** Implement JWT or session-based auth
3. **Real Wallet Integration:** Implement actual Web3 wallet connections
4. **Add Tests:** Write unit and integration tests
5. **Rate Limiting:** Implement API rate limiting
6. **Caching:** Add Redis or similar for caching
7. **WebSockets:** Add real-time notifications
8. **Error Tracking:** Integrate Sentry or similar

## 📊 API Response Format

All APIs follow a consistent response format:

```typescript
{
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // For paginated responses:
  page?: number;
  limit?: number;
  total?: number;
  hasMore?: boolean;
}
```

## 🎯 Key Benefits

✅ **Type-Safe:** Full TypeScript support
✅ **Consistent:** Uniform API structure
✅ **RESTful:** Following REST best practices
✅ **Documented:** Comprehensive documentation
✅ **Extensible:** Easy to add new features
✅ **Testable:** Clean separation of concerns
✅ **Production-Ready Architecture:** Ready to scale with proper database

## 📞 Support

For questions or issues:

1. Check [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)
2. Review [lib/api-usage-examples.tsx](./lib/api-usage-examples.tsx)
3. Check the type definitions in [lib/types/index.ts](./lib/types/index.ts)

---

**Created with ❤️ for CryptoVault**
