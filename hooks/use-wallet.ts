"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";

interface WalletState {
  account: string | null;
  chainId: string | null;
  ethBalance: string | null;
  isConnected: boolean;
}

/**
 * Attempt to fetch ETH balance from MetaMask's RPC.
 * Returns null if the RPC is unavailable (e.g. Infura 401)
 * so the wallet connection itself is never blocked.
 */
async function fetchEthBalanceSafe(
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
    console.warn(
      "[fetchEthBalance] Could not fetch balance (RPC may be unavailable):",
      err
    );
    return null;
  }
}

export function useWallet() {
  const [wallet, setWallet] = useState<WalletState>({
    account: null,
    chainId: null,
    ethBalance: null,
    isConnected: false,
  });

  const checkConnection = useCallback(async () => {
    if (typeof window === "undefined" || !(window as any).ethereum) return;

    try {
      const ethereum = (window as any).ethereum;
      const accounts = await ethereum.request({ method: "eth_accounts" });
      const chainId = await ethereum.request({ method: "eth_chainId" });

      if (accounts && accounts.length > 0) {
        // Balance fetch is best-effort — won't break connection if RPC fails
        const ethBalance = await fetchEthBalanceSafe(ethereum, accounts[0]);

        setWallet({
          account: accounts[0],
          chainId,
          ethBalance,
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
          setWallet((prev) => ({
            ...prev,
            account: null,
            ethBalance: null,
            isConnected: false,
          }));
          toast.info("Wallet disconnected");
        } else {
          // Balance fetch is best-effort
          const ethBalance = await fetchEthBalanceSafe(ethereum, accounts[0]);

          setWallet((prev) => ({
            ...prev,
            account: accounts[0],
            ethBalance,
            isConnected: true,
          }));
          toast.success("Wallet account changed");
        }
      };

      const handleChainChanged = (chainId: string) => {
        setWallet((prev) => ({ ...prev, chainId }));
        toast.info("Network changed");
        checkConnection(); // Refetch balance on chain change
      };

      const handleDisconnect = () => {
        setWallet({
          account: null,
          chainId: null,
          ethBalance: null,
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

      // 1. Request accounts (triggers MetaMask popup)
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found from MetaMask");
      }
      const account = accounts[0];

      // 2. Get chain ID directly from MetaMask (local call, never fails)
      const chainId = await ethereum.request({ method: "eth_chainId" });

      // 3. Attempt balance fetch — this is best-effort.
      //    MetaMask routes eth_getBalance through its internal RPC (Infura).
      //    If Infura returns 401, we still connect — just without balance.
      const ethBalance = await fetchEthBalanceSafe(ethereum, account);

      // 4. Update state — connection succeeds regardless of balance result
      setWallet({
        account,
        chainId: chainId || null,
        ethBalance,
        isConnected: true,
      });

      toast.dismiss(toastId);
      if (ethBalance) {
        toast.success("Wallet connected successfully!");
      } else {
        toast.success("Wallet connected! Balance unavailable — try switching MetaMask network.");
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

  const disconnectWallet = () => {
    setWallet({
      account: null,
      chainId: null,
      ethBalance: null,
      isConnected: false,
    });
    toast.info("Wallet disconnected from app");
  };

  return {
    ...wallet,
    connectWallet,
    disconnectWallet,
  };
}
