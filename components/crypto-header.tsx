"use client";

import { useState } from "react";
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
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [priceAlerts, setPriceAlerts] = useState(true);

  const anyConnected = evmConnected || solConnected;

  // Mock notifications data
  const mockNotifications = [
    {
      id: 1,
      title: "Bitcoin Alert",
      message: "BTC reached $50,000!",
      time: "2 min ago",
      read: false,
    },
    {
      id: 2,
      title: "Portfolio Update",
      message: "Your portfolio is up 5.2% today",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      title: "New Feature",
      message: "Check out our new staking feature",
      time: "3 hours ago",
      read: true,
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast.success(`Searching for: ${searchQuery}`);
    }
  };

  const navLinks = [
    { label: "Markets", href: "/markets", icon: TrendingUp },
    { label: "Portfolio", href: "/portfolio", icon: Wallet },
    { label: "Trading", href: "/trading" },
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

  const handleProfile = () => {
    toast.info("Opening profile settings");
  };

  const handleSignOut = () => {
    toast.success("Signed out successfully");
    disconnectWallet();
    disconnectSolana();
  };

  const handleSettingsSave = () => {
    toast.success("Settings saved successfully");
    setSettingsOpen(false);
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
                  <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
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
                  {mockNotifications.map((notification) => (
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
                  onClick={() =>
                    toast.success("All notifications marked as read")
                  }
                >
                  Mark all as read
                </Button>
              </SheetContent>
            </Sheet>

            {/* Settings */}
            <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-foreground hover:text-primary"
                >
                  <Settings className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Manage your account settings and preferences
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="dark-mode">Dark Mode</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle dark theme
                      </p>
                    </div>
                    <Switch
                      id="dark-mode"
                      checked={darkMode}
                      onCheckedChange={setDarkMode}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notifications">Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive push notifications
                      </p>
                    </div>
                    <Switch
                      id="notifications"
                      checked={notifications}
                      onCheckedChange={setNotifications}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="price-alerts">Price Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Get alerted on price changes
                      </p>
                    </div>
                    <Switch
                      id="price-alerts"
                      checked={priceAlerts}
                      onCheckedChange={setPriceAlerts}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSettingsOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSettingsSave}>Save Changes</Button>
                </div>
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
                  onClick={handleProfile}
                >
                  <UserCircle className="h-4 w-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => setSettingsOpen(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => toast.info("Opening security settings")}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-foreground hover:bg-muted cursor-pointer"
                  onClick={() => toast.info("Opening payment methods")}
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
