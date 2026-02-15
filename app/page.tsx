import { CryptoHeader } from '@/components/crypto-header';
import { CryptoHero } from '@/components/crypto-hero';
import { MarketOverview } from '@/components/market-overview';
import { PriceChart } from '@/components/price-chart';

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <CryptoHeader />
      <main>
        <CryptoHero />
        <MarketOverview />
        <PriceChart />
      </main>
    </div>
  );
}
