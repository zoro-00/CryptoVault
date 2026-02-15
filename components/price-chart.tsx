"use client";

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, TooltipProps } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cryptoApi, formatCurrency } from '@/lib/crypto-api';

interface ChartData {
  timestamp: number;
  price: number;
  date: string;
  time: string;
}

export function PriceChart() {
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);

  const periods = [
    { label: '24H', value: '1' },
    { label: '7D', value: '7' },
    { label: '30D', value: '30' },
    { label: '90D', value: '90' },
  ];

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(false);
      try {
        const data = await cryptoApi.getCryptoHistory('bitcoin', parseInt(selectedPeriod));
        
        const formattedData: ChartData[] = data.prices.map(([timestamp, price]) => {
          const date = new Date(timestamp);
          return {
            timestamp,
            price,
            date: date.toLocaleDateString(),
            time: date.toLocaleTimeString()
          };
        });

        setChartData(formattedData);
        
        if (formattedData.length > 0) {
          const latest = formattedData[formattedData.length - 1];
          const earliest = formattedData[0];
          setCurrentPrice(latest.price);
          setPriceChange(((latest.price - earliest.price) / earliest.price) * 100);
        }
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [selectedPeriod]);

  const isPositive = priceChange >= 0;

  const CustomTooltip = ({ active, payload }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as ChartData;
      return (
        <div className="bg-card border border-border p-3 rounded-lg shadow-lg backdrop-blur-sm">
          <p className="text-foreground font-semibold">{formatCurrency(payload[0].value ?? 0)}</p>
          <p className="text-muted-foreground text-sm">{data.date}</p>
          <p className="text-muted-foreground text-sm">{data.time}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-glass-gradient border-border backdrop-blur-sm">
          <CardHeader className="border-b border-border">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold text-foreground mb-2">
                  Bitcoin Price Chart
                </CardTitle>
                <div className="flex items-center space-x-4">
                  <span className="text-3xl font-bold font-mono text-foreground">
                    {formatCurrency(currentPrice)}
                  </span>
                  <Badge 
                    variant="outline"
                    className={`font-mono ${
                      isPositive 
                        ? 'text-success border-success/20 bg-success/10' 
                        : 'text-destructive border-destructive/20 bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                      {isPositive ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
                      </span>
                    </div>
                  </Badge>
                </div>
              </div>
              
              <div className="flex space-x-2">
                {periods.map((period) => (
                  <Button
                    key={period.value}
                    variant={selectedPeriod === period.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod(period.value)}
                    className={selectedPeriod === period.value 
                      ? "bg-primary text-primary-foreground" 
                      : "border-border text-foreground hover:bg-muted"
                    }
                  >
                    {period.label}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="p-6">
            {loading ? (
              <div className="h-96 flex items-center justify-center">
                <div className="animate-pulse text-muted-foreground">Loading chart data...</div>
              </div>
            ) : (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke="rgba(71, 85, 105, 0.2)"
                      vertical={false}
                    />
                    <XAxis 
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94A3B8', fontSize: 12 }}
                      tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
                      domain={['dataMin - 500', 'dataMax + 500']}
                    />
                    <Tooltip 
                      content={<CustomTooltip />}
                      cursor={{ stroke: '#00D4FF', strokeWidth: 1 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#00D4FF"
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ 
                        r: 6, 
                        fill: '#00D4FF',
                        stroke: '#0F172A',
                        strokeWidth: 2
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}