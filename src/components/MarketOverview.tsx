import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Activity, BarChart2, Share2, X, Twitter, Facebook, Mail, Link as LinkIcon, ArrowUpDown } from 'lucide-react';
import { fluidSpring } from './SystemManager';

const initialStocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 178.45, change: 1.20, changePercent: 0.68, volume: 52.35, isCrypto: false },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 405.82, change: -2.15, changePercent: -0.53, volume: 22.10, isCrypto: false },
  { ticker: 'BTC', name: 'Bitcoin', price: 64230.00, change: 1250.50, changePercent: 1.98, volume: 451.20, isCrypto: true },
  { ticker: 'ETH', name: 'Ethereum', price: 3450.75, change: -15.20, changePercent: -0.44, volume: 185.60, isCrypto: true },
];

type SortOption = 'default' | 'priceChangeDesc' | 'priceChangeAsc' | 'percentChangeDesc' | 'percentChangeAsc';

function LivePrice({ price }: { price: number }) {
  const [flashColor, setFlashColor] = useState<string | null>(null);
  const prevPrice = useRef(price);

  useEffect(() => {
    if (price !== prevPrice.current) {
      const isUp = price > prevPrice.current;
      setFlashColor(isUp ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)'); // emerald-400 or rose-400 with opacity
      
      const timeout = setTimeout(() => {
        setFlashColor(null);
      }, 600);
      
      prevPrice.current = price;
      return () => clearTimeout(timeout);
    }
  }, [price]);

  return (
    <motion.div 
      animate={{ 
        backgroundColor: flashColor || 'rgba(0,0,0,0)',
        scale: flashColor ? 1.03 : 1
      }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-2xl font-bold tracking-tight rounded-lg px-2 -mx-2 inline-block"
    >
      ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.div>
  );
}

function AnimatedChange({ value, isPercent, isPositive }: { value: number, isPercent: boolean, isPositive: boolean }) {
  const [flash, setFlash] = useState(false);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      setFlash(true);
      const timeout = setTimeout(() => setFlash(false), 600);
      prevValue.current = value;
      return () => clearTimeout(timeout);
    }
  }, [value]);

  return (
    <motion.div 
      animate={{ 
        scale: flash ? 1.05 : 1,
        backgroundColor: flash ? (isPositive ? 'rgba(52, 211, 153, 0.2)' : 'rgba(251, 113, 133, 0.2)') : 'rgba(255, 255, 255, 0.05)'
      }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-1 text-sm font-medium px-2 py-1 rounded-md ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}
    >
      {isPositive ? '+' : ''}{isPercent ? value.toFixed(2) + '%' : value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </motion.div>
  );
}

export default function MarketOverview() {
  const [stocks, setStocks] = useState(initialStocks);
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [shareStock, setShareStock] = useState<any | null>(null);

  // Simulate live market updates
  useEffect(() => {
    const interval = setInterval(() => {
      setStocks(current => current.map(stock => {
        // Randomly decide if this stock updates this tick (70% chance)
        if (Math.random() > 0.7) return stock;

        const volatility = stock.isCrypto ? 0.0015 : 0.0005; 
        const changePercentTick = (Math.random() * 2 - 1) * volatility;
        const newPrice = stock.price * (1 + changePercentTick);
        const priceDiff = newPrice - stock.price;
        
        return {
          ...stock,
          price: newPrice,
          change: stock.change + priceDiff,
          changePercent: stock.changePercent + (changePercentTick * 100),
          volume: stock.volume + (Math.random() * 0.5)
        };
      }));
    }, 2500); // Update every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  const sortedStocks = [...stocks].sort((a, b) => {
    if (sortBy === 'priceChangeDesc') return b.change - a.change;
    if (sortBy === 'priceChangeAsc') return a.change - b.change;
    if (sortBy === 'percentChangeDesc') return b.changePercent - a.changePercent;
    if (sortBy === 'percentChangeAsc') return a.changePercent - b.changePercent;
    return 0; // default
  });

  return (
    <div className="bg-card/60 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl mb-6 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#0052ff]/10 rounded-xl">
            <BarChart2 className="text-[#0052ff]" size={20} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Live Markets</h3>
            <p className="text-xs text-secondary">Real-time stock & crypto overview</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Sort Dropdown */}
          <div className="relative flex items-center bg-surface/50 border border-white/10 rounded-xl px-3 py-1.5">
            <ArrowUpDown size={14} className="text-secondary mr-2" />
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-sm text-primary focus:outline-none appearance-none pr-4 cursor-pointer"
            >
              <option value="default" className="bg-card">Default Order</option>
              <option value="priceChangeDesc" className="bg-card">Price Change (High to Low)</option>
              <option value="priceChangeAsc" className="bg-card">Price Change (Low to High)</option>
              <option value="percentChangeDesc" className="bg-card">% Change (High to Low)</option>
              <option value="percentChangeAsc" className="bg-card">% Change (Low to High)</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            MARKET OPEN
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnimatePresence mode="popLayout">
          {sortedStocks.map((stock, i) => {
            const isPositive = stock.change >= 0;
            return (
              <motion.div
                layout
                key={stock.ticker}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ ...fluidSpring, delay: i * 0.05 }}
                className="bg-surface/50 backdrop-blur-md border border-white/5 rounded-2xl p-5 hover:border-white/20 transition-all relative overflow-hidden group shadow-lg flex flex-col justify-between"
              >
                {/* Background gradient hint */}
                <div className={`absolute -right-12 -top-12 w-32 h-32 rounded-full blur-[50px] opacity-10 transition-colors duration-700 ${isPositive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div>
                    <h4 className="font-bold text-primary text-lg flex items-center gap-2">
                      {stock.ticker}
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-secondary font-medium">
                        {stock.isCrypto ? 'CRYPTO' : 'EQUITY'}
                      </span>
                    </h4>
                    <p className="text-xs text-muted mt-0.5">{stock.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setShareStock(stock)}
                      className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-secondary hover:text-primary transition-colors"
                      title="Share"
                    >
                      <Share2 size={16} />
                    </button>
                    <div className={`p-1.5 rounded-lg transition-colors duration-500 ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 flex flex-col gap-2">
                  <div className="flex justify-between items-end">
                    <LivePrice price={stock.price} />
                    <div className="text-xs text-muted font-medium flex items-center gap-1 bg-white/5 px-2 py-1 rounded-md mb-1">
                      <Activity size={12} className="text-secondary" />
                      Vol: {stock.volume.toFixed(2)}M
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <AnimatedChange value={stock.change} isPercent={false} isPositive={isPositive} />
                    <AnimatedChange value={stock.changePercent} isPercent={true} isPositive={isPositive} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {shareStock && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={fluidSpring}
              className="bg-card border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative"
            >
              <button 
                onClick={() => setShareStock(null)} 
                className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors p-1 bg-white/5 hover:bg-white/10 rounded-full"
              >
                <X size={18} />
              </button>
              
              <h3 className="text-xl font-bold mb-1">Share {shareStock.ticker}</h3>
              <p className="text-sm text-secondary mb-6">Share current performance with your network</p>
              
              <div className="bg-surface/50 rounded-xl p-4 mb-6 border border-white/5">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{shareStock.name}</span>
                  <span className="font-bold">${shareStock.price.toFixed(2)}</span>
                </div>
                <div className={`text-sm font-medium ${shareStock.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {shareStock.change >= 0 ? '+' : ''}{shareStock.changePercent.toFixed(2)}% Today
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <button className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#1DA1F2]/10 text-[#1DA1F2] flex items-center justify-center group-hover:bg-[#1DA1F2] group-hover:text-white transition-all duration-300">
                    <Twitter size={20} />
                  </div>
                  <span className="text-xs font-medium">Twitter</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-[#1877F2]/10 text-[#1877F2] flex items-center justify-center group-hover:bg-[#1877F2] group-hover:text-white transition-all duration-300">
                    <Facebook size={20} />
                  </div>
                  <span className="text-xs font-medium">Facebook</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300">
                    <Mail size={20} />
                  </div>
                  <span className="text-xs font-medium">Email</span>
                </button>
                <button className="flex flex-col items-center gap-2 text-secondary hover:text-primary transition-colors group">
                  <div className="w-12 h-12 rounded-full bg-white/5 text-primary flex items-center justify-center group-hover:bg-white/20 transition-all duration-300">
                    <LinkIcon size={20} />
                  </div>
                  <span className="text-xs font-medium">Copy Link</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
