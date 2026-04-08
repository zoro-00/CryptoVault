"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import {
  Connection,
  PublicKey,
  LAMPORTS_PER_SOL,
  clusterApiUrl,
} from "@solana/web3.js";

// ── Types ───────────────────────────────────────────────────────────

/** Phantom wallet provider injected at window.solana */
interface PhantomProvider {
  isPhantom?: boolean;
  publicKey: { toString(): string } | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: { toString(): string } }>;
  disconnect(): Promise<void>;
  on(event: string, handler: (...args: any[]) => void): void;
  removeListener(event: string, handler: (...args: any[]) => void): void;
}

export interface SolanaWalletState {
  account: string | null;
  solBalance: string | null;
  isConnected: boolean;
}

// ── Helpers ─────────────────────────────────────────────────────────

function getPhantom(): PhantomProvider | null {
  if (typeof window === "undefined") return null;
  const solana = (window as any).solana;
  if (solana?.isPhantom) return solana as PhantomProvider;
  return null;
}

const connection = new Connection(clusterApiUrl("mainnet-beta"), "confirmed");

async function fetchSolBalanceSafe(
  publicKeyStr: string
): Promise<string | null> {
  try {
    const pubkey = new PublicKey(publicKeyStr);
    const lamports = await connection.getBalance(pubkey);
    return (lamports / LAMPORTS_PER_SOL).toFixed(4);
  } catch (err) {
    console.warn("[fetchSolBalance] Could not fetch SOL balance:", err);
    return null;
  }
}

// ── Hook ────────────────────────────────────────────────────────────

export function useSolanaWallet() {
  const [wallet, setWallet] = useState<SolanaWalletState>({
    account: null,
    solBalance: null,
    isConnected: false,
  });

  // Check if already connected (trusted / eager connect)
  const checkConnection = useCallback(async () => {
    const phantom = getPhantom();
    if (!phantom) return;

    try {
      const resp = await phantom.connect({ onlyIfTrusted: true });
      const pubkey = resp.publicKey.toString();
      const solBalance = await fetchSolBalanceSafe(pubkey);
      setWallet({ account: pubkey, solBalance, isConnected: true });
    } catch {
      // User hasn't previously approved — that's fine, stay disconnected
    }
  }, []);

  useEffect(() => {
    checkConnection();

    const phantom = getPhantom();
    if (!phantom) return;

    const handleAccountChanged = async (publicKey: any) => {
      if (publicKey) {
        const pubkey = publicKey.toString();
        const solBalance = await fetchSolBalanceSafe(pubkey);
        setWallet({ account: pubkey, solBalance, isConnected: true });
        toast.success("Solana account changed");
      } else {
        setWallet({ account: null, solBalance: null, isConnected: false });
        toast.info("Phantom wallet disconnected");
      }
    };

    const handleDisconnect = () => {
      setWallet({ account: null, solBalance: null, isConnected: false });
      toast.info("Phantom wallet disconnected");
    };

    phantom.on("accountChanged", handleAccountChanged);
    phantom.on("disconnect", handleDisconnect);

    return () => {
      phantom.removeListener("accountChanged", handleAccountChanged);
      phantom.removeListener("disconnect", handleDisconnect);
    };
  }, [checkConnection]);

  // ── Connect ───────────────────────────────────────────────────────
  const connectSolana = async () => {
    const phantom = getPhantom();

    if (!phantom) {
      toast.error("Phantom wallet is not installed!");
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      const toastId = toast.loading("Connecting to Phantom...");
      const resp = await phantom.connect();
      const pubkey = resp.publicKey.toString();
      const solBalance = await fetchSolBalanceSafe(pubkey);

      setWallet({ account: pubkey, solBalance, isConnected: true });

      toast.dismiss(toastId);
      toast.success("Phantom wallet connected!");
    } catch (error: any) {
      toast.dismiss();
      console.error("[connectSolana] Error:", error);
      if (error?.code === 4001) {
        toast.error("User rejected the connection request.");
      } else {
        toast.error(
          `Failed to connect Phantom: ${error?.message || "Unknown error"}`
        );
      }
    }
  };

  // ── Disconnect ────────────────────────────────────────────────────
  const disconnectSolana = async () => {
    const phantom = getPhantom();
    if (phantom) {
      try {
        await phantom.disconnect();
      } catch {
        // Ignore disconnect errors
      }
    }
    setWallet({ account: null, solBalance: null, isConnected: false });
    toast.info("Phantom wallet disconnected");
  };

  // ── Refresh balance ───────────────────────────────────────────────
  const refreshBalance = async () => {
    if (!wallet.account) return;
    const solBalance = await fetchSolBalanceSafe(wallet.account);
    setWallet((prev) => ({ ...prev, solBalance }));
  };

  return {
    ...wallet,
    connectSolana,
    disconnectSolana,
    refreshBalance,
    isPhantomInstalled: typeof window !== "undefined" && !!(window as any).solana?.isPhantom,
  };
}
