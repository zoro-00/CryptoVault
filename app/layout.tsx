import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CryptoVault - Your Crypto Dashboard",
  description:
    "Real-time cryptocurrency prices, advanced charts, portfolio tracking, and trading. Stay ahead in the digital asset revolution with CryptoVault.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
        <Toaster richColors />
      </body>
    </html>
  );
}
