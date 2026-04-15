"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Menu,
  TrendingUp,
  Wallet,
  Settings,
  Bell,
  User,
  X,
  Check,
  Shield,
  CreditCard,
  LogOut,
  UserCircle,
  ChevronDown,
  Globe,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useWallet } from "../hooks/use-wallet";
import { useSolanaWallet } from "../hooks/use-solana-wallet";

export function CryptoHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const {
    account: evmAccount,
    chainId,
    isConnected: evmConnected,
    connectWallet,
    disconnectWallet,
    switchChain,
    networkName,
    currencySymbol,
  } = useWallet();
  const {
    account: solAccount,
    isConnected: solConnected,
    connectSolana,
    disconnectSolana,
  } = useSolanaWallet();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileTab, setProfileTab] = useState("profile");
  const [profileData, setProfileData] = useState({ name: "Loading...", email: "", id: "demo-user" });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<{id: number, last4: string, brand: string}[]>([]);
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);
  const [notificationItems, setNotificationItems] = useState<{id: number, title: string, message: string, time: string, read: boolean}[]>([]);

  const unreadCount = notificationItems.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotificationItems((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  useEffect(() => {
    // Load local settings
    const savedSettings = localStorage.getItem("cryptoVaultSettings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        if (typeof parsed.notifications === "boolean") setNotifications(parsed.notifications);
        if (typeof parsed.priceAlerts === "boolean") setPriceAlerts(parsed.priceAlerts);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    
    // Load local payment methods
    const savedCards = localStorage.getItem("cryptoVaultCards");
    if (savedCards) {
      try {
        setPaymentMethods(JSON.parse(savedCards));
      } catch (e) {
        console.error("Failed to parse cards", e);
      }
    }
    
    // Fetch profile data from backend or LocalStorage
    const savedProfile = localStorage.getItem("cryptoVaultProfile");
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    } else {
      fetch("/api/user?demo=true")
        .then(res => res.json())
        .then(res => {
          if (res.success && res.data) {
            setProfileData({
              name: res.data.name || "CryptoVault User",
              email: res.data.email || "user@example.com",
              id: res.data.id || "demo-user"
            });
          }
        })
        .catch(err => console.error("Failed to fetch profile", err));
    }
  }, []);

  useEffect(() => {
    // Fetch a real market notification a few seconds after connecting
    const demoTimer = setTimeout(() => {
      fetch("/api/trading?pair=BTC/USDT")
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data) {
                const btcStats = data.data;
                const price = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(btcStats.lastPrice);
                const high = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(btcStats.high24h);
                
                setNotificationItems(prev => [
                    {
                        id: Date.now(),
                        title: "Live BTC Market Pulse",
                        message: `Bitcoin is trading at ${price}. The 24h high was ${high}.`,
                        time: "Just now",
                        read: false
                    },
                    ...prev
                ]);
                toast("🔔 Live Market Update", {
                    description: `Bitcoin is currently trading at ${price}`,
                });
            }
        })
        .catch(err => console.error("Failed to fetch live notification", err));
    }, 6000);

    return () => clearTimeout(demoTimer);
  }, []);

  const anyConnected = evmConnected || solConnected;



  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const navLinks = [
    { label: "Markets", href: "/markets", icon: TrendingUp },
    { label: "Portfolio", href: "/portfolio", icon: Wallet },
    { label: "Swap", href: "/swap" },
    { label: "Buy", href: "/buy" },
    { label: "News", href: "/news" },
  ];

  const chainOptions = [
    { id: "0x1", label: "Ethereum", icon: "Ξ" },
    { id: "0x89", label: "Polygon", icon: "⬡" },
    { id: "0xa4b1", label: "Arbitrum", icon: "🔵" },
    { id: "0xa", label: "Optimism", icon: "🔴" },
    { id: "0x38", label: "BSC", icon: "💛" },
    { id: "0xaa36a7", label: "Sepolia", icon: "🧪" },
  ];

  const openProfileDialog = (tab: string) => {
    setProfileTab(tab);
    setProfileOpen(true);
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully");
    disconnectWallet();
    disconnectSolana();
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      // Sync locally to survive dev server hot-reloads mapping to the ephemeral mock API
      localStorage.setItem("cryptoVaultProfile", JSON.stringify({
        name: profileData.name,
        email: profileData.email,
        id: profileData.id
      }));

      const res = await fetch("/api/user", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: profileData.id,
          name: profileData.name,
          email: profileData.email
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Profile saved securely");
        setProfileOpen(false);
      } else {
        toast.error("Failed to update profile");
      }
    } catch (e) {
      toast.error("Network error saving profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleSettingsSave = () => {
    const settings = { notifications, priceAlerts };
    localStorage.setItem("cryptoVaultSettings", JSON.stringify(settings));
    toast.success("Settings saved successfully");
    setProfileOpen(false);
  };

  // Wallet connection label for the header button
  const getWalletLabel = () => {
    if (evmConnected && evmAccount) {
      return `${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}`;
    }
    if (solConnected && solAccount) {
      return `${solAccount.slice(0, 4)}...${solAccount.slice(-4)}`;
    }
    return null;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-crypto-gradient animate-pulse-glow" />
              <span className="text-xl font-bold text-foreground">
                {process.env.NEXT_PUBLIC_APP_NAME || "CryptoVault"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 ml-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`inline-flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    pathname === link.href
                      ? "text-primary"
                      : "text-foreground"
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Search Bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search cryptocurrencies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border text-foreground placeholder:text-muted-foreground focus:ring-primary focus:border-primary"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </form>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <Sheet
              open={notificationsOpen}
              onOpenChange={setNotificationsOpen}
            >
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary relative"
                >
                  <Bell className="h-5 w-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Notifications</SheetTitle>
                  <SheetDescription>
                    Stay updated with your crypto activities
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {notificationItems.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.read
                          ? "bg-card"
                          : "bg-primary/5 border-primary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="font-medium text-sm">
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.time}
                          </p>
                        </div>
                        {!notification.read && (
                          <Badge variant="default" className="ml-2">
                            New
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4"
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                >
                  Mark all as read
                </Button>
              </SheetContent>
            </Sheet>

            {/* Profile Dialog */}
            <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
              <DialogContent className="sm:max-w-[525px]">
                <DialogHeader>
                  <DialogTitle>Account Management</DialogTitle>
                  <DialogDescription>
                    Manage your profile, settings, and security preferences
                  </DialogDescription>
                </DialogHeader>
                
                <Tabs value={profileTab} onValueChange={setProfileTab} className="w-full mt-4">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="payment">Payment</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4 py-4 border-none">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
                          <UserCircle className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-lg text-foreground">{profileData.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <p className="text-sm text-muted-foreground">Joined April 2026</p>
                            {evmConnected && evmAccount && (
                              <Badge variant="outline" className="text-xs border-green-500/30 text-green-500 bg-green-500/10">
                                {evmAccount.slice(0, 6)}...{evmAccount.slice(-4)}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Display Name</Label>
                        <Input value={profileData.name} onChange={(e) => setProfileData({...profileData, name: e.target.value})} />
                      </div>
                      <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={profileData.email} onChange={(e) => setProfileData({...profileData, email: e.target.value})} type="email" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
                      <Button onClick={handleSaveProfile} disabled={isSavingProfile}>
                        {isSavingProfile ? "Saving..." : "Save Profile"}
                      </Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="settings" className="space-y-6 py-4 border-none">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="notifications-tab">Notifications</Label>
                        <p className="text-sm text-muted-foreground">
                          Receive push notifications
                        </p>
                      </div>
                      <Switch
                        id="notifications-tab"
                        checked={notifications}
                        onCheckedChange={setNotifications}
                      />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="price-alerts-tab">Price Alerts</Label>
                        <p className="text-sm text-muted-foreground">
                          Get alerted on price changes
                        </p>
                      </div>
                      <Switch
                        id="price-alerts-tab"
                        checked={priceAlerts}
                        onCheckedChange={setPriceAlerts}
                      />
                    </div>
                    <div className="flex justify-end gap-2 mt-6">
                      <Button variant="outline" onClick={() => setProfileOpen(false)}>Cancel</Button>
                      <Button onClick={handleSettingsSave}>Save Settings</Button>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="payment" className="space-y-4 py-4 border-none">
                    {isAddingPayment ? (
                      <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <h3 className="font-medium text-foreground">Add New Payment Method</h3>
                        <div className="space-y-2">
                          <Label>Name on Card</Label>
                          <Input placeholder="John Doe" />
                        </div>
                        <div className="space-y-2">
                          <Label>Card Number</Label>
                          <Input placeholder="**** **** **** ****" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Expiry Date</Label>
                            <Input placeholder="MM/YY" />
                          </div>
                          <div className="space-y-2">
                            <Label>CVC</Label>
                            <Input placeholder="123" type="password" maxLength={3} />
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                          <Button variant="outline" onClick={() => setIsAddingPayment(false)}>Cancel</Button>
                          <Button onClick={() => {
                            const newMethods = [...paymentMethods, { id: Date.now(), last4: Math.floor(1000 + Math.random() * 9000).toString(), brand: "Visa" }];
                            setPaymentMethods(newMethods);
                            localStorage.setItem("cryptoVaultCards", JSON.stringify(newMethods));
                            setIsAddingPayment(false);
                            toast.success("Card added successfully");
                          }}>Save Card</Button>
                        </div>
                      </div>
                    ) : paymentMethods.length > 0 ? (
                      <div className="space-y-4 animate-in fade-in duration-300">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium text-foreground">Saved Cards</h3>
                          <Button size="sm" variant="outline" onClick={() => setIsAddingPayment(true)}>Add New</Button>
                        </div>
                        {paymentMethods.map((method) => (
                          <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg bg-card/50">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-14 bg-primary/10 rounded flex items-center justify-center">
                                <CreditCard className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{method.brand} ending in {method.last4}</p>
                                <p className="text-xs text-muted-foreground">Expires 12/28</p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-500/10" onClick={() => {
                              const newMethods = paymentMethods.filter(m => m.id !== method.id);
                              setPaymentMethods(newMethods);
                              localStorage.setItem("cryptoVaultCards", JSON.stringify(newMethods));
                              toast.info("Card removed");
                            }}>Remove</Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 animate-in fade-in duration-300">
                        <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground">No Payment Methods</h3>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Add a credit card or bank account to buy crypto directly.
                        </p>
                        <Button onClick={() => setIsAddingPayment(true)}>
                          Add Payment Method
                        </Button>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </DialogContent>
            </Dialog>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-card border-border w-56"
              >
                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => openProfileDialog("profile")}
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => openProfileDialog("settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => openProfileDialog("payment")}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-500 hover:bg-muted cursor-pointer"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Network badge (EVM) */}
            {evmConnected && chainId && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge
                    variant="outline"
                    className="hidden lg:flex border-primary text-primary bg-primary/10 cursor-pointer gap-1"
                  >
                    {networkName}
                    <ChevronDown className="h-3 w-3" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {chainOptions.map((chain) => (
                    <DropdownMenuItem
                      key={chain.id}
                      onClick={() => switchChain(chain.id)}
                      className={
                        chainId === chain.id
                          ? "bg-primary/10 text-primary"
                          : ""
                      }
                    >
                      <span className="mr-2">{chain.icon}</span>
                      {chain.label}
                      {chainId === chain.id && (
                        <Badge className="ml-auto text-xs" variant="default">
                          ✓
                        </Badge>
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Solana badge */}
            {solConnected && (
              <Badge
                variant="outline"
                className="hidden lg:flex border-purple-500 text-purple-400 bg-purple-500/10"
              >
                Solana
              </Badge>
            )}

            {/* Connect Wallet Dropdown */}
            {anyConnected ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hidden sm:flex bg-green-600 hover:bg-green-700 text-primary-foreground gap-2">
                    <Check className="h-4 w-4" />
                    {getWalletLabel()}
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {evmConnected && evmAccount && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <span>🦊</span> MetaMask
                        <Badge variant="outline" className="ml-auto text-xs border-green-500 text-green-500">
                          Connected
                        </Badge>
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="text-xs text-muted-foreground">
                        {evmAccount}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400"
                        onClick={disconnectWallet}
                      >
                        Disconnect MetaMask
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {solConnected && solAccount && (
                    <>
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <span>👻</span> Phantom
                        <Badge variant="outline" className="ml-auto text-xs border-purple-500 text-purple-500">
                          Connected
                        </Badge>
                      </DropdownMenuLabel>
                      <DropdownMenuItem className="text-xs text-muted-foreground">
                        {solAccount.slice(0, 20)}...
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-400"
                        onClick={disconnectSolana}
                      >
                        Disconnect Phantom
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {!evmConnected && (
                    <DropdownMenuItem onClick={connectWallet}>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </DropdownMenuItem>
                  )}
                  {!solConnected && (
                    <DropdownMenuItem onClick={connectSolana}>
                      <Globe className="h-4 w-4 mr-2" />
                      Connect Phantom (Solana)
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <Wallet className="h-4 w-4" />
                    Connect Wallet
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Choose Wallet</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={connectWallet}>
                    <span className="mr-2">🦊</span>
                    MetaMask
                    <span className="ml-auto text-xs text-muted-foreground">
                      EVM
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={connectSolana}>
                    <span className="mr-2">👻</span>
                    Phantom
                    <span className="ml-auto text-xs text-muted-foreground">
                      Solana
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Mobile Menu */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border py-4">
            {/* Mobile Search */}
            <form onSubmit={handleSearch} className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cryptocurrencies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border"
                />
                {searchQuery && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                    onClick={() => setSearchQuery("")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </form>

            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors hover:text-primary hover:bg-muted ${
                    pathname === link.href
                      ? "text-primary bg-muted"
                      : "text-foreground"
                  }`}
                >
                  {link.icon && <link.icon className="h-4 w-4 mr-2" />}
                  {link.label}
                </Link>
              ))}

              {/* Mobile wallet buttons */}
              <div className="pt-2 space-y-2">
                <Button
                  className={`w-full ${
                    evmConnected
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-primary hover:bg-primary/90"
                  } text-primary-foreground`}
                  onClick={evmConnected ? disconnectWallet : connectWallet}
                >
                  {evmConnected && evmAccount ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        {`${evmAccount.slice(0, 6)}...${evmAccount.slice(-4)}`}
                      </div>
                      {chainId && (
                        <Badge
                          variant="outline"
                          className="border-green-400 text-white bg-green-500/20 text-xs"
                        >
                          {networkName}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Connect MetaMask
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  className={`w-full ${
                    solConnected
                      ? "border-purple-500 bg-purple-500/10 text-purple-400"
                      : "border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  }`}
                  onClick={solConnected ? disconnectSolana : connectSolana}
                >
                  {solConnected && solAccount ? (
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center">
                        <Check className="h-4 w-4 mr-2" />
                        {`${solAccount.slice(0, 4)}...${solAccount.slice(-4)}`}
                      </div>
                      <Badge
                        variant="outline"
                        className="border-purple-400 text-purple-400 bg-purple-500/20 text-xs"
                      >
                        Solana
                      </Badge>
                    </div>
                  ) : (
                    <>
                      <Globe className="h-4 w-4 mr-2" />
                      Connect Phantom
                    </>
                  )}
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
