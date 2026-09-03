import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Zap } from 'lucide-react';
import { fluidSpring } from './SystemManager';

const initialCryptos = [
  { symbol: 'BTC', name: 'Bitcoin', price: 97840.00, change: 3.45 },
  { symbol: 'ETH', name: 'Ethereum', price: 3820.50, change: 2.15 },
  { symbol: 'SOL', name: 'Solana', price: 235.80, change: 6.42 },
  { symbol: 'KAS', name: 'Kaspa', price: 0.224, change: 8.75 },
  { symbol: 'TON', name: 'Toncoin', price: 7.65, change: 4.30 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.245, change: 5.12 },
  { symbol: 'LTC', name: 'Litecoin', price: 118.40, change: 2.90 },
  { symbol: 'BNB', name: 'BNB', price: 685.20, change: 1.85 },
  { symbol: 'XRP', name: 'XRP', price: 1.42, change: 3.20 },
  { symbol: 'ETC', name: 'Ethereum Classic', price: 34.80, change: 4.10 },
  { symbol: 'AVAX', name: 'Avalanche', price: 42.60, change: 3.75 },
  { symbol: 'NEAR', name: 'NEAR Protocol', price: 8.90, change: 5.80 },
];

export default function CryptoTicker() {
  const [cryptos, setCryptos] = useState(initialCryptos);

  // Simulate real-time price fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setCryptos(prev =>
        prev.map(coin => {
          if (Math.random() > 0.6) return coin;
          const deltaPercent = (Math.random() * 2 - 1) * 0.002;
          const newPrice = Math.max(0.001, coin.price * (1 + deltaPercent));
          const newChange = coin.change + deltaPercent * 10;
          return {
            ...coin,
            price: newPrice,
            change: Number(newChange.toFixed(2))
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Duplicate items for infinite seamless marquee loop
  const tickerItems = [...cryptos, ...cryptos, ...cryptos];

  return (
    <div className="w-full bg-card/80 backdrop-blur-md border-y border-border/60 py-3 overflow-hidden relative shadow-inner">
      {/* Subtle fade edges */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-card to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent z-10 pointer-events-none" />

      <div className="flex items-center gap-2 px-4 mb-2 max-w-7xl mx-auto text-xs font-semibold text-secondary uppercase tracking-wider">
        <span className="flex items-center gap-1 text-[#00f0ff]">
          <Zap size={14} className="animate-pulse" /> Live Market Ticker
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        <span className="text-[10px] text-secondary/70">Real-time Global Pool & Exchange Feed</span>
      </div>

      <div className="flex overflow-hidden relative w-full">
        <motion.div
          animate={{ x: ['0%', '-33.33%'] }}
          transition={{
            duration: 35,
            ease: 'linear',
            repeat: Infinity,
          }}
          className="flex items-center gap-6 whitespace-nowrap min-w-max px-4"
        >
          {tickerItems.map((coin, index) => {
            const isPositive = coin.change >= 0;
            return (
              <motion.div
                key={`${coin.symbol}-${index}`}
                whileHover={{ scale: 1.05, y: -2 }}
                transition={fluidSpring}
                className="flex items-center gap-3 px-4 py-2 bg-subtle/60 hover:bg-subtle border border-border/40 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-primary tracking-tight text-sm">{coin.symbol}</span>
                  <span className="text-xs text-secondary">{coin.name}</span>
                </div>

                <div className="flex items-center gap-2 font-mono text-sm font-semibold">
                  <span>
                    ${coin.price < 1 
                      ? coin.price.toFixed(4) 
                      : coin.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span className={`flex items-center text-xs font-medium px-1.5 py-0.5 rounded ${
                    isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {isPositive ? <TrendingUp size={12} className="mr-0.5 inline" /> : <TrendingDown size={12} className="mr-0.5 inline" />}
                    {isPositive ? '+' : ''}{coin.change.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
