"use client";

import { useState, useEffect, useCallback } from "react";
import { useWallet } from "@/hooks/use-wallet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard,
  Wallet,
  ArrowDownCircle,
  Info,
  Loader2,
  CheckCircle2,
  Shield,
  X,
  ExternalLink,
  Zap,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { CryptoHeader } from "@/components/crypto-header";

// ------------------------------------------------------------------
// Transak Staging Widget URL builder
// Register free at https://dashboard.transak.com to get a staging key
// ------------------------------------------------------------------
function buildTransakUrl(params: {
  coin: string;
  fiatAmount: string;
  walletAddress: string;
}): string {
  const apiKey = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "";
  const base = "https://global-stg.transak.com";

  const networkMap: Record<string, string> = {
    ETH: "ethereum",
    BTC: "bitcoin",
    SOL: "solana",
  };

  const query = new URLSearchParams({
    apiKey,
    fiatCurrency: "USD",
    defaultCryptoCurrency: params.coin,
    fiatAmount: params.fiatAmount,
    themeColor: "2563eb",
    network: networkMap[params.coin] || "ethereum",
    ...(params.walletAddress ? {
      walletAddress: params.walletAddress,
      disableWalletAddressForm: "true",
    } : {}),
  });
  return `${base}?${query.toString()}`;
}

export default function BuyCryptoPage() {
  const { account, isConnected } = useWallet();
  const [fiatAmount, setFiatAmount] = useState<string>("100");
  const [paymentMethods, setPaymentMethods] = useState<
    { id: number; last4: string; brand: string }[]
  >([]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string>("");
  const [isLoadingGateway, setIsLoadingGateway] = useState(false);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [gatewayUrl, setGatewayUrl] = useState<string>("");

  const [selectedCoin, setSelectedCoin] = useState<"ETH" | "BTC" | "SOL">(
    "ETH"
  );
  const [livePrices, setLivePrices] = useState<Record<string, number>>({
    ETH: 3150.5,
    BTC: 65000.0,
    SOL: 145.2,
  });
  const [isFetchingPrice, setIsFetchingPrice] = useState(false);

  const COINS = {
    ETH: { symbol: "ETH", network: "Ethereum", color: "from-blue-500 to-indigo-600" },
    BTC: { symbol: "BTC", network: "Bitcoin", color: "from-orange-500 to-amber-600" },
    SOL: { symbol: "SOL", network: "Solana", color: "from-purple-500 to-violet-600" },
  };

  const estimatedCrypto = fiatAmount
    ? (parseFloat(fiatAmount) / livePrices[selectedCoin]).toFixed(6)
    : "0.00";

  // Fetch live price from our internal CoinGecko proxy
  useEffect(() => {
    setIsFetchingPrice(true);
    fetch(`/api/trading?pair=${selectedCoin}/USDT`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data && res.data.lastPrice > 0) {
          setLivePrices((prev) => ({
            ...prev,
            [selectedCoin]: res.data.lastPrice,
          }));
        }
      })
      .catch((err) => console.error("Failed to fetch live price", err))
      .finally(() => setIsFetchingPrice(false));
  }, [selectedCoin]);

  // Load saved payment methods from localStorage
  useEffect(() => {
    const savedCards = localStorage.getItem("cryptoVaultCards");
    if (savedCards) {
      try {
        const cards = JSON.parse(savedCards);
        setPaymentMethods(cards);
        if (cards.length > 0) setSelectedPaymentId(cards[0].id.toString());
      } catch (e) {
        console.error("Failed to parse cards", e);
      }
    }
  }, []);

  const handleGatewayClose = useCallback(() => {
    setIsGatewayOpen(false);
    setGatewayUrl("");
    toast.success(
      "Returned from payment gateway. Check your wallet for any deposits!",
      { duration: 6000 }
    );
  }, []);

  const handlePurchase = () => {
    if (!fiatAmount || parseFloat(fiatAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    if (!isConnected || !account) {
      toast.error("Please connect your MetaMask wallet first to receive funds");
      return;
    }
    if (!process.env.NEXT_PUBLIC_TRANSAK_API_KEY) {
      toast.error(
        "Transak API key not configured. Add NEXT_PUBLIC_TRANSAK_API_KEY to your .env.local file.",
        { duration: 8000 }
      );
      return;
    }

    setIsLoadingGateway(true);

    setTimeout(() => {
      const url = buildTransakUrl({
        coin: selectedCoin,
        fiatAmount,
        walletAddress: account,
      });
      setGatewayUrl(url);

      // Open Transak in a popup window instead of an iframe
      // (iframes are blocked by Transak's X-Frame-Options policy)
      const popup = window.open(
        url,
        "TransakGateway",
        `width=500,height=700,scrollbars=yes,resizable=yes,left=${Math.round(window.screen.width / 2 - 250)},top=${Math.round(window.screen.height / 2 - 350)}`
      );

      setIsGatewayOpen(true);
      setIsLoadingGateway(false);

      toast.info("Test card: 4111 1111 1111 1111 · Exp: 12/26 · CVV: 123", {
        duration: 10000,
      });

      // Poll for when the user closes the popup
      const interval = setInterval(() => {
        if (popup && popup.closed) {
          clearInterval(interval);
          setIsGatewayOpen(false);
          toast.success("Payment window closed. Check your wallet for any pending deposits!", { duration: 6000 });
        }
      }, 800);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />

      {/* ── Transak Awaiting Modal (shown while popup is open) ─── */}
      {isGatewayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-card border border-white/10 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-300">
            <button
              onClick={() => {
                setIsGatewayOpen(false);
                toast.info("Payment window dismissed.");
              }}
              className="absolute top-4 right-4 rounded-full p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-5">
              <div className="h-16 w-16 mx-auto bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
                <Zap className="h-8 w-8 text-blue-400" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Transak Gateway Open</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Complete your purchase in the <span className="text-blue-400 font-semibold">Transak popup window</span>. Don't close this page.
                </p>
              </div>

              {/* Test card info */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left space-y-2">
                <p className="text-xs font-bold text-amber-400 uppercase tracking-wider">Sandbox Test Card</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-muted-foreground">Card Number</p>
                    <code className="font-mono font-bold text-foreground">4111 1111 1111 1111</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Expiry</p>
                    <code className="font-mono font-bold text-foreground">12/26</code>
                  </div>
                  <div>
                    <p className="text-muted-foreground">CVV</p>
                    <code className="font-mono font-bold text-foreground">123</code>
                  </div>
                </div>
              </div>

              {/* Delivery address */}
              {account && (
                <div className="bg-background/80 border border-white/10 rounded-xl p-3 text-xs font-mono break-all text-left text-muted-foreground">
                  <p className="text-xs font-semibold text-foreground/60 mb-1">Delivery Address</p>
                  <span className="text-foreground/80">{account}</span>
                </div>
              )}

              <div className="flex gap-3">
                <a
                  href={gatewayUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button variant="outline" className="w-full gap-2 text-sm">
                    <ExternalLink className="h-4 w-4" /> Reopen Window
                  </Button>
                </a>
                <Button
                  className="flex-1 text-sm gap-2 bg-green-600 hover:bg-green-500"
                  onClick={() => {
                    setIsGatewayOpen(false);
                    toast.success("Done! Check your wallet for incoming funds.", { duration: 6000 });
                  }}
                >
                  <CheckCircle2 className="h-4 w-4" /> Done
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">Powered by Transak · PCI-DSS Level 1</p>
            </div>
          </div>
        </div>
      )}

      <div className="container max-w-5xl mx-auto py-16 px-4 sm:px-6 relative">
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="mb-12 text-center max-w-3xl mx-auto relative z-10">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground to-muted-foreground">
            Buy Crypto{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-primary">
              Instantly
            </span>
          </h1>
          <p className="text-xl text-muted-foreground/80 font-medium">
            Use your credit or debit card to fund your wallet securely. Funds
            are delivered directly to your connected Web3 address via Transak.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start relative z-10">
          {/* ── Left: Purchase Form ───────────────────────────────── */}
          <div className="lg:col-span-3 bg-card/60 backdrop-blur-xl border border-white/5 shadow-2xl rounded-3xl p-6 sm:p-10 relative overflow-hidden transition-all duration-500 hover:shadow-primary/5 hover:border-white/10">
            <div className="space-y-8">
              {/* You Pay */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  You Pay
                </Label>
                <div className="relative group">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xl font-medium">
                    $
                  </span>
                  <Input
                    type="number"
                    value={fiatAmount}
                    onChange={(e) => setFiatAmount(e.target.value)}
                    className="pl-8 text-3xl h-20 bg-background/50 border-white/10 font-bold transition-all duration-300 focus:ring-primary/20 focus:border-primary/50 group-hover:border-white/20"
                    placeholder="0.00"
                    min="30"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
                    <Badge
                      variant="secondary"
                      className="px-4 py-1.5 text-sm font-semibold bg-white/5"
                    >
                      USD
                    </Badge>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground pl-1">
                  Minimum purchase: $30 USD
                </p>
              </div>

              {/* Arrow */}
              <div className="flex justify-center -my-3 relative z-10">
                <div className="bg-card border border-white/10 rounded-full p-2.5 text-primary shadow-lg ring-4 ring-background">
                  <ArrowDownCircle className="h-6 w-6" />
                </div>
              </div>

              {/* You Receive */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  You Receive (Estimated)
                  {isFetchingPrice && (
                    <Loader2 className="h-3 w-3 animate-spin text-primary" />
                  )}
                </Label>
                <div className="relative group">
                  <Input
                    disabled
                    value={estimatedCrypto}
                    className={`text-3xl h-20 bg-primary/5 border-primary/20 font-bold text-primary opacity-100 transition-all duration-300 group-hover:bg-primary/10`}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Select
                      value={selectedCoin}
                      onValueChange={(val: any) => setSelectedCoin(val)}
                    >
                      <SelectTrigger
                        className={`border-none shadow-md h-8 px-4 text-sm font-semibold bg-gradient-to-r ${COINS[selectedCoin].color} text-white focus:ring-0 focus:ring-offset-0`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ETH">
                          <div className="flex items-center gap-2">
                            <span>⟠</span> ETH — Ethereum
                          </div>
                        </SelectItem>
                        <SelectItem value="BTC">
                          <div className="flex items-center gap-2">
                            <span>₿</span> BTC — Bitcoin
                          </div>
                        </SelectItem>
                        <SelectItem value="SOL">
                          <div className="flex items-center gap-2">
                            <span>◎</span> SOL — Solana
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="pt-6 border-t border-white/10">
                <Label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 block">
                  Linked Payment Card
                </Label>
                {paymentMethods.length > 0 ? (
                  <Select
                    value={selectedPaymentId}
                    onValueChange={setSelectedPaymentId}
                  >
                    <SelectTrigger className="h-16 bg-background/50 border-white/10 hover:border-white/20 transition-colors">
                      <SelectValue placeholder="Select a payment method" />
                    </SelectTrigger>
                    <SelectContent className="bg-card/95 backdrop-blur-xl border-white/10">
                      {paymentMethods.map((method) => (
                        <SelectItem
                          key={method.id}
                          value={method.id.toString()}
                          className="hover:bg-primary/10 focus:bg-primary/10"
                        >
                          <div className="flex items-center gap-3 font-medium">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <span>
                              {method.brand} ending in •••• {method.last4}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="h-16 border-2 border-dashed border-white/10 rounded-xl flex items-center justify-between px-6 bg-background/30 hover:bg-background/50 transition-colors">
                    <div className="flex items-center gap-3 text-muted-foreground font-medium">
                      <CreditCard className="h-5 w-5" />
                      <span>No saved cards — Transak accepts cards directly</span>
                    </div>
                  </div>
                )}
              </div>

              {/* CTA */}
              <div className="space-y-4 pt-4">
                <Button
                  className={`w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r ${COINS[selectedCoin].color} hover:opacity-90 shadow-lg transition-all duration-300 hover:-translate-y-0.5`}
                  size="lg"
                  onClick={handlePurchase}
                  disabled={isLoadingGateway}
                >
                  {isLoadingGateway ? (
                    <>
                      <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                      Launching Gateway...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Buy {selectedCoin} via Transak
                    </>
                  )}
                </Button>

                {!isConnected && (
                  <p className="text-center text-amber-500 text-sm flex items-center justify-center gap-1.5 bg-amber-500/10 py-2 px-4 rounded-xl">
                    <Info className="h-4 w-4 shrink-0" />
                    Connect your MetaMask wallet so Transak can deliver funds directly to your address.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Summary Panel ───────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Purchase Summary */}
            <div className="bg-card/60 backdrop-blur-xl border border-white/5 shadow-xl rounded-3xl p-8">
              <h3 className="font-bold text-xl flex items-center gap-3 mb-6 text-foreground">
                <Shield className="h-6 w-6 text-primary" /> Purchase Summary
              </h3>

              <div className="space-y-5">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">
                    Exchange Rate
                  </span>
                  <span className="font-semibold text-foreground flex items-center gap-1.5">
                    {isFetchingPrice && <Loader2 className="h-3 w-3 animate-spin" />}
                    1 {selectedCoin} ≈ ${livePrices[selectedCoin].toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">
                    Network Fee
                  </span>
                  <span className="font-semibold text-foreground">~$2.50 USD</span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground font-medium">
                    Transak Fee (≈1%)
                  </span>
                  <span className="font-semibold text-foreground">
                    ${(parseFloat(fiatAmount || "0") * 0.01).toFixed(2)} USD
                  </span>
                </div>
                <div className="border-t border-white/10 pt-5 flex justify-between items-center text-lg">
                  <span className="font-bold text-foreground">Total To Pay</span>
                  <span
                    className={`font-extrabold text-transparent bg-clip-text bg-gradient-to-r ${COINS[selectedCoin].color} text-2xl`}
                  >
                    ${(parseFloat(fiatAmount || "0") * 1.01 + 2.5).toFixed(2)} USD
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 shadow-inner rounded-3xl p-8 flex items-start gap-5">
              <div className="h-12 w-12 bg-primary/20 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-primary/30">
                <Wallet className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-foreground mb-2">
                  Non-Custodial Delivery
                </h4>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                  Transak delivers {COINS[selectedCoin].symbol} directly to your{" "}
                  {COINS[selectedCoin].network} wallet address. CryptoVault never
                  holds or intermediates your funds.
                </p>
                {isConnected && account ? (
                  <div className="mt-4 bg-background/80 backdrop-blur-sm border border-white/10 shadow-inner rounded-lg p-3 text-xs font-mono break-all text-muted-foreground">
                    Delivering to:{" "}
                    <span className="text-foreground/90 font-semibold">
                      {account}
                    </span>
                  </div>
                ) : (
                  <div className="mt-4 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 text-xs text-amber-400 font-medium">
                    ⚠ Connect MetaMask to auto-fill your delivery address in Transak.
                  </div>
                )}
              </div>
            </div>

            {/* Powered by badge */}
            <div className="flex items-center justify-center gap-3 py-2 text-xs text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              <span>KYC/AML compliant · PCI-DSS Level 1 · 160+ countries</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
