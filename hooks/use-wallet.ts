"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";

// ── Chain configuration ─────────────────────────────────────────────
export interface ChainConfig {
  chainId: string; // hex, e.g. "0x1"
  chainName: string;
  nativeCurrency: { name: string; symbol: string; decimals: number };
  rpcUrls: string[];
  blockExplorerUrls: string[];
}

export const EVM_CHAINS: Record<string, ChainConfig> = {
  "0x1": {
    chainId: "0x1",
    chainName: "Ethereum Mainnet",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://eth.llamarpc.com"],
    blockExplorerUrls: ["https://etherscan.io"],
  },
  "0x89": {
    chainId: "0x89",
    chainName: "Polygon",
    nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
    rpcUrls: ["https://polygon-rpc.com"],
    blockExplorerUrls: ["https://polygonscan.com"],
  },
  "0xaa36a7": {
    chainId: "0xaa36a7",
    chainName: "Sepolia Testnet",
    nativeCurrency: { name: "SepoliaETH", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://rpc.sepolia.org"],
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
  "0xa4b1": {
    chainId: "0xa4b1",
    chainName: "Arbitrum One",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://arb1.arbitrum.io/rpc"],
    blockExplorerUrls: ["https://arbiscan.io"],
  },
  "0xa": {
    chainId: "0xa",
    chainName: "Optimism",
    nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
    rpcUrls: ["https://mainnet.optimism.io"],
    blockExplorerUrls: ["https://optimistic.etherscan.io"],
  },
  "0x38": {
    chainId: "0x38",
    chainName: "BNB Smart Chain",
    nativeCurrency: { name: "BNB", symbol: "BNB", decimals: 18 },
    rpcUrls: ["https://bsc-dataseed.binance.org"],
    blockExplorerUrls: ["https://bscscan.com"],
  },
};

export function getChainConfig(chainId: string | null): ChainConfig | null {
  if (!chainId) return null;
  return EVM_CHAINS[chainId.toLowerCase()] || EVM_CHAINS[chainId] || null;
}

export function getNetworkName(chainId: string | null): string {
  const config = getChainConfig(chainId);
  return config?.chainName || "Unknown Network";
}

export function getNativeCurrencySymbol(chainId: string | null): string {
  const config = getChainConfig(chainId);
  return config?.nativeCurrency.symbol || "ETH";
}

// ── Wallet state ────────────────────────────────────────────────────
export interface WalletState {
  account: string | null;
  chainId: string | null;
  nativeBalance: string | null;
  isConnected: boolean;
}

/**
 * Attempt to fetch native balance from MetaMask's RPC.
 * Returns null if the RPC is unavailable (e.g. Infura 401).
 */
async function fetchNativeBalanceSafe(
  ethereum: any,
  account: string
): Promise<string | null> {
  try {
    const balanceHex: string = await ethereum.request({
      method: "eth_getBalance",
      params: [account, "latest"],
    });
    const balanceWei = BigInt(balanceHex);
    return Number(ethers.formatEther(balanceWei)).toFixed(4);
  } catch (err) {
    console.warn("[fetchNativeBalance] RPC unavailable:", err);
    return null;
  }
}

// ── Hook ────────────────────────────────────────────────────────────
export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    chainId: null,
    nativeBalance: null,
    isConnected: false,
  });

  // Derived
  const networkName = getNetworkName(wallet.chainId);
  const currencySymbol = getNativeCurrencySymbol(wallet.chainId);

  const checkConnection = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const chainId = await ethereum.request({ method: "eth_chainId" });

      if (accounts && accounts.length > 0) {
        const nativeBalance = await fetchNativeBalanceSafe(
          ethereum,
          accounts[0]
        );
        setWallet({
          account: accounts[0],
          chainId,
          nativeBalance,
          isConnected: true,
        });
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  }, []);

  useEffect(() => {
    checkConnection();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;

      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          setWallet({
            account: null,
            chainId: null,
            nativeBalance: null,
            isConnected: false,
          });
          toast.info("Wallet disconnected");
        } else {
          const nativeBalance = await fetchNativeBalanceSafe(
            ethereum,
            accounts[0]
          );
          setWallet((prev) => ({
            ...prev,
            account: accounts[0],
            nativeBalance,
            isConnected: true,
          }));
          toast.success("Wallet account changed");
        }
      };

      const handleChainChanged = (_chainId: string) => {
        setWallet((prev) => ({ ...prev, chainId: _chainId }));
        toast.info("Network changed");
        checkConnection();
      };

      const handleDisconnect = () => {
        setWallet({
          account: null,
          chainId: null,
          nativeBalance: null,
          isConnected: false,
        });
        toast.info("Wallet disconnected");
      };

      ethereum.on("accountsChanged", handleAccountsChanged);
      ethereum.on("chainChanged", handleChainChanged);
      ethereum.on("disconnect", handleDisconnect);

      return () => {
        if (ethereum.removeListener) {
          ethereum.removeListener("accountsChanged", handleAccountsChanged);
          ethereum.removeListener("chainChanged", handleChainChanged);
          ethereum.removeListener("disconnect", handleDisconnect);
        }
      };
    }
  }, [checkConnection]);

  // ── Connect ───────────────────────────────────────────────────────
  const connectWallet = async () => {
    if (typeof window === "undefined") return;

    if (!(window as any).ethereum) {
      toast.error("MetaMask is not installed! Please install it to connect.");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    try {
      const toastId = toast.loading("Connecting to MetaMask...");
      const ethereum = (window as any).ethereum;

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found from MetaMask");
      }
      const account = accounts[0];
      const chainId = await ethereum.request({ method: "eth_chainId" });
      const nativeBalance = await fetchNativeBalanceSafe(ethereum, account);

      setWallet({
        account,
        chainId: chainId || null,
        nativeBalance,
        isConnected: true,
      });

      toast.dismiss(toastId);
      if (nativeBalance) {
        toast.success("Wallet connected successfully!");
      } else {
        toast.success(
          "Wallet connected! Balance unavailable — try switching network."
        );
      }
    } catch (error: any) {
      toast.dismiss();
      console.error("[connectWallet] Error:", error);
      if (error?.code === 4001) {
        toast.error("User rejected the connection request.");
      } else {
        toast.error(
          `Failed to connect wallet: ${error?.message || "Unknown error"}`
        );
      }
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────
  const disconnectWallet = () => {
    setWallet({
      account: null,
      chainId: null,
      nativeBalance: null,
      isConnected: false,
    });
    toast.info("Wallet disconnected from app");
  };

  // ── Switch chain ──────────────────────────────────────────────────
  const switchChain = async (targetChainId: string) => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    const ethereum = (window as any).ethereum;

    try {
      await ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: targetChainId }],
      });
      // chainChanged event will fire automatically and trigger checkConnection
    } catch (switchError: any) {
      // 4902 = chain not added to MetaMask yet
      if (switchError?.code === 4902) {
        const config = getChainConfig(targetChainId);
        if (!config) {
          toast.error("Unknown chain");
          return;
        }
        try {
          await ethereum.request({
            method: "wallet_addEthereumChain",
            params: [
              {
                chainId: config.chainId,
                chainName: config.chainName,
                nativeCurrency: config.nativeCurrency,
                rpcUrls: config.rpcUrls,
                blockExplorerUrls: config.blockExplorerUrls,
              },
            ],
          });
        } catch (addError: any) {
          console.error("[switchChain] Failed to add chain:", addError);
          toast.error("Failed to add network to MetaMask");
        }
      } else {
        console.error("[switchChain] Failed to switch:", switchError);
        toast.error("Failed to switch network");
      }
    }
  };

  return {
    ...wallet,
    networkName,
    currencySymbol,
    connectWallet,
    disconnectWallet,
    switchChain,
  };
}
