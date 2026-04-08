"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { ethers } from "ethers";
import type { Token } from "@/lib/tokens";
import { isNativeToken, NATIVE_TOKEN_ADDRESS } from "@/lib/tokens";

// ── ERC-20 ABI (only the methods we need) ─────────────────────────
const ERC20_ABI = [
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function balanceOf(address account) view returns (uint256)",
];

// ── Types ───────────────────────────────────────────────────────────

export interface SwapQuote {
  // EVM fields
  destAmount?: string;
  gasCostUSD?: string;
  contractAddress?: string;
  tokenTransferProxy?: string;
  priceRoute?: any;
  // Solana fields
  outAmount?: string;
  priceImpactPct?: string;
  swapUsdValue?: string;
  otherAmountThreshold?: string;
  jupiterQuote?: any; // full Jupiter response for building tx
}

export interface SwapTxResult {
  txHash: string;
  explorerUrl: string;
}

type SwapStatus = "idle" | "quoting" | "approving" | "swapping" | "confirming" | "success" | "error";

// ── Hook ────────────────────────────────────────────────────────────

export function useSwap() {
  const [quote, setQuote] = useState<SwapQuote | null>(null);
  const [status, setStatus] = useState<SwapStatus>("idle");
  const [txResult, setTxResult] = useState<SwapTxResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Reset state ─────────────────────────────────────────────────
  const reset = useCallback(() => {
    setQuote(null);
    setStatus("idle");
    setTxResult(null);
    setError(null);
  }, []);

  // ── Get Quote ───────────────────────────────────────────────────
  const getQuote = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: string,
      slippageBps: number = 50
    ) => {
      reset();
      setStatus("quoting");

      try {
        // Convert human amount to smallest unit
        const amountWei = ethers.parseUnits(amount, fromToken.decimals).toString();

        let url: string;

        if (fromToken.chainId === 0) {
          // Solana → Jupiter
          url = `/api/trading/quote?network=solana&inputMint=${fromToken.address}&outputMint=${toToken.address}&amount=${amountWei}&slippageBps=${slippageBps}`;
        } else {
          // EVM → ParaSwap
          url = `/api/trading/quote?network=${fromToken.chainId}&srcToken=${fromToken.address}&destToken=${toToken.address}&amount=${amountWei}&srcDecimals=${fromToken.decimals}&destDecimals=${toToken.decimals}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || "Failed to get quote");
        }

        const q: SwapQuote = fromToken.chainId === 0
          ? {
              outAmount: data.data.outAmount,
              priceImpactPct: data.data.priceImpactPct,
              swapUsdValue: data.data.swapUsdValue,
              otherAmountThreshold: data.data.otherAmountThreshold,
              jupiterQuote: data.data,
            }
          : {
              destAmount: data.data.destAmount,
              gasCostUSD: data.data.gasCostUSD,
              contractAddress: data.data.contractAddress,
              tokenTransferProxy: data.data.tokenTransferProxy,
              priceRoute: data.data.priceRoute,
            };

        setQuote(q);
        setStatus("idle");
        return q;
      } catch (err: any) {
        const msg = err.message || "Quote failed";
        setError(msg);
        setStatus("error");
        toast.error(msg);
        return null;
      }
    },
    [reset]
  );

  // ── EVM: Check & Approve Token ──────────────────────────────────
  const approveTokenIfNeeded = useCallback(
    async (
      fromToken: Token,
      amount: string,
      spender: string,
      signer: ethers.Signer
    ): Promise<boolean> => {
      // Native tokens don't need approval
      if (isNativeToken(fromToken)) return true;

      try {
        setStatus("approving");
        toast.info("Checking token allowance...");

        const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, signer);
        const userAddress = await signer.getAddress();
        const amountWei = ethers.parseUnits(amount, fromToken.decimals);
        const currentAllowance: bigint = await tokenContract.allowance(userAddress, spender);

        if (currentAllowance >= amountWei) {
          return true; // Already approved enough
        }

        toast.info(`Approving ${fromToken.symbol}... Please confirm in MetaMask.`);
        const tx = await tokenContract.approve(spender, ethers.MaxUint256);
        toast.info("Waiting for approval confirmation...");
        await tx.wait();
        toast.success(`${fromToken.symbol} approved!`);
        return true;
      } catch (err: any) {
        const msg = err.code === "ACTION_REJECTED"
          ? "Approval rejected by user"
          : err.message || "Approval failed";
        setError(msg);
        setStatus("error");
        toast.error(msg);
        return false;
      }
    },
    []
  );

  // ── EVM Swap (ParaSwap + MetaMask) ──────────────────────────────
  const executeEvmSwap = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: string,
      currentQuote: SwapQuote,
      slippageBps: number = 50
    ) => {
      if (!currentQuote?.priceRoute) {
        toast.error("No quote available");
        return null;
      }

      const ethereum = (window as any).ethereum;
      if (!ethereum) {
        toast.error("MetaMask not found");
        return null;
      }

      try {
        const provider = new ethers.BrowserProvider(ethereum);
        const signer = await provider.getSigner();
        const userAddress = await signer.getAddress();

        // ── Check balance ───────────────────────────────────────
        const amountWei = ethers.parseUnits(amount, fromToken.decimals);

        if (isNativeToken(fromToken)) {
          const balance = await provider.getBalance(userAddress);
          if (balance < amountWei) {
            toast.error(`Insufficient ${fromToken.symbol} balance`);
            setStatus("error");
            setError("Insufficient balance");
            return null;
          }
        } else {
          const tokenContract = new ethers.Contract(fromToken.address, ERC20_ABI, provider);
          const balance: bigint = await tokenContract.balanceOf(userAddress);
          if (balance < amountWei) {
            toast.error(`Insufficient ${fromToken.symbol} balance`);
            setStatus("error");
            setError("Insufficient balance");
            return null;
          }
        }

        // ── Approve if ERC-20 ───────────────────────────────────
        const spender = currentQuote.tokenTransferProxy || currentQuote.contractAddress || "";
        if (spender) {
          const approved = await approveTokenIfNeeded(fromToken, amount, spender, signer);
          if (!approved) return null;
        }

        // ── Build transaction via API ───────────────────────────
        setStatus("swapping");
        toast.info("Building transaction... Please confirm in MetaMask.");

        const buildRes = await fetch("/api/trading/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: String(fromToken.chainId),
            srcToken: fromToken.address,
            destToken: toToken.address,
            srcAmount: amountWei.toString(),
            destAmount: currentQuote.priceRoute.destAmount,
            priceRoute: currentQuote.priceRoute,
            userAddress,
            slippage: slippageBps,
          }),
        });

        const buildData = await buildRes.json();
        if (!buildData.success) {
          throw new Error(buildData.error || "Failed to build transaction");
        }

        const txData = buildData.data;

        // ── Send transaction via MetaMask ────────────────────────
        const tx = await signer.sendTransaction({
          to: txData.to,
          data: txData.data,
          value: txData.value === "0" ? undefined : BigInt(txData.value),
          gasPrice: txData.gasPrice ? BigInt(txData.gasPrice) : undefined,
        });

        setStatus("confirming");
        toast.info(`Transaction sent! Hash: ${tx.hash.slice(0, 10)}...`);

        // Get block explorer URL
        const chainConfigs: Record<number, string> = {
          1: "https://etherscan.io/tx/",
          137: "https://polygonscan.com/tx/",
          56: "https://bscscan.com/tx/",
          42161: "https://arbiscan.io/tx/",
          10: "https://optimistic.etherscan.io/tx/",
        };
        const explorerUrl = `${chainConfigs[fromToken.chainId] || "https://etherscan.io/tx/"}${tx.hash}`;

        // Wait for confirmation
        const receipt = await tx.wait();

        if (receipt && receipt.status === 1) {
          const result: SwapTxResult = { txHash: tx.hash, explorerUrl };
          setTxResult(result);
          setStatus("success");
          toast.success("Swap confirmed!");
          return result;
        } else {
          throw new Error("Transaction reverted");
        }
      } catch (err: any) {
        const msg = err.code === "ACTION_REJECTED"
          ? "Transaction rejected by user"
          : err.reason || err.message || "Swap failed";
        setError(msg);
        setStatus("error");
        toast.error(msg);
        return null;
      }
    },
    [approveTokenIfNeeded]
  );

  // ── Solana Swap (Jupiter + Phantom) ─────────────────────────────
  const executeSolanaSwap = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: string,
      currentQuote: SwapQuote
    ) => {
      if (!currentQuote?.jupiterQuote) {
        toast.error("No quote available");
        return null;
      }

      const phantom = (window as any).solana;
      if (!phantom || !phantom.isPhantom) {
        toast.error("Phantom wallet not found");
        return null;
      }

      try {
        setStatus("swapping");

        // Ensure connected
        if (!phantom.isConnected) {
          await phantom.connect();
        }
        const userPublicKey = phantom.publicKey.toString();

        // ── Build swap transaction via API ───────────────────────
        toast.info("Building Solana transaction...");

        const buildRes = await fetch("/api/trading/swap", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            network: "solana",
            quoteResponse: currentQuote.jupiterQuote,
            userPublicKey,
          }),
        });

        const buildData = await buildRes.json();
        if (!buildData.success) {
          throw new Error(buildData.error || "Failed to build Solana transaction");
        }

        // ── Deserialize and sign with Phantom ───────────────────
        toast.info("Please approve the transaction in Phantom.");

        const { VersionedTransaction } = await import("@solana/web3.js");
        const swapTxBuf = Buffer.from(buildData.data.swapTransaction, "base64");
        const transaction = VersionedTransaction.deserialize(swapTxBuf);

        const { signature } = await phantom.signAndSendTransaction(transaction);

        setStatus("confirming");
        const explorerUrl = `https://solscan.io/tx/${signature}`;
        toast.info(`Transaction sent! Signature: ${signature.slice(0, 10)}...`);

        // Wait for confirmation
        const { Connection, clusterApiUrl } = await import("@solana/web3.js");
        const connection = new Connection(clusterApiUrl("mainnet-beta"));

        const latestBlockhash = await connection.getLatestBlockhash();
        await connection.confirmTransaction(
          { signature, ...latestBlockhash },
          "confirmed"
        );

        const result: SwapTxResult = { txHash: signature, explorerUrl };
        setTxResult(result);
        setStatus("success");
        toast.success("Solana swap confirmed!");
        return result;
      } catch (err: any) {
        const msg = err.message?.includes("User rejected")
          ? "Transaction rejected by user"
          : err.message || "Solana swap failed";
        setError(msg);
        setStatus("error");
        toast.error(msg);
        return null;
      }
    },
    []
  );

  // ── Main swap dispatcher ────────────────────────────────────────
  const executeSwap = useCallback(
    async (
      fromToken: Token,
      toToken: Token,
      amount: string,
      currentQuote: SwapQuote,
      slippageBps: number = 50
    ) => {
      if (fromToken.chainId === 0) {
        return executeSolanaSwap(fromToken, toToken, amount, currentQuote);
      }
      return executeEvmSwap(fromToken, toToken, amount, currentQuote, slippageBps);
    },
    [executeEvmSwap, executeSolanaSwap]
  );

  // ── Get token balance ───────────────────────────────────────────
  const getTokenBalance = useCallback(
    async (token: Token, userAddress: string): Promise<string> => {
      try {
        if (token.chainId === 0) {
          // Solana
          const { Connection, clusterApiUrl, PublicKey } = await import("@solana/web3.js");
          const connection = new Connection(clusterApiUrl("mainnet-beta"));

          if (token.address === "So11111111111111111111111111111111111111112") {
            const balance = await connection.getBalance(new PublicKey(userAddress));
            return ethers.formatUnits(BigInt(balance), token.decimals);
          }
          // SPL token balance would need @solana/spl-token — return 0 for now
          return "0";
        }

        // EVM
        const ethereum = (window as any).ethereum;
        if (!ethereum) return "0";

        const provider = new ethers.BrowserProvider(ethereum);

        if (isNativeToken(token)) {
          const balance = await provider.getBalance(userAddress);
          return ethers.formatUnits(balance, token.decimals);
        }

        const contract = new ethers.Contract(token.address, ERC20_ABI, provider);
        const balance: bigint = await contract.balanceOf(userAddress);
        return ethers.formatUnits(balance, token.decimals);
      } catch {
        return "0";
      }
    },
    []
  );

  return {
    // State
    quote,
    status,
    txResult,
    error,
    // Actions
    getQuote,
    executeSwap,
    getTokenBalance,
    reset,
  };
}
