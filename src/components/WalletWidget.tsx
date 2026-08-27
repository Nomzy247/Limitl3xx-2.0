import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { AreaChart, Area, ResponsiveContainer, YAxis } from 'recharts';

const generateSparklineData = (isPositive: boolean, basePrice: number) => {
  let current = basePrice;
  return Array.from({ length: 20 }, (_, i) => {
    current += (Math.random() - (isPositive ? 0.45 : 0.55)) * (basePrice * 0.01);
    return { time: i, value: current };
  });
};

const CRYPTO_ICONS: Record<string, string> = {
  BTC: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/btc.png',
  ETH: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/eth.png',
  USDT: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/usdt.png',
  XRP: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/xrp.png',
  SOL: 'https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/32/color/sol.png',
};

export default function WalletWidget() {
  const { userData } = useAuth();
  const [marketData, setMarketData] = useState<Record<string, { price: number; change: number }>>({
    BTC: { price: 65000, change: 0 },
    ETH: { price: 3500, change: 0 },
    USDT: { price: 1, change: 0 },
    XRP: { price: 0.58, change: 0 },
    SOL: { price: 145, change: 0 }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchPrices = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch(`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent('["BTCUSDT","ETHUSDT","XRPUSDT","SOLUSDT"]')}`);
      if (!response.ok) throw new Error('Binance fetch failed');
      const data = await response.json();
      
      const newMarketData = { ...marketData };
      data.forEach((item: any) => {
        const symbol = item.symbol.replace('USDT', '');
        newMarketData[symbol] = {
          price: parseFloat(item.lastPrice),
          change: parseFloat(item.priceChangePercent)
        };
      });
      setMarketData(newMarketData);
    } catch (error) {
      try {
        console.warn('Binance API failed, falling back to CoinGecko', error);
        const cgResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,solana&vs_currencies=usd&include_24hr_change=true');
        const cgData = await cgResponse.json();
        
        const newMarketData = { ...marketData };
        if (cgData.bitcoin) {
          newMarketData['BTC'] = {
            price: cgData.bitcoin.usd,
            change: cgData.bitcoin.usd_24h_change || 0
          };
        }
        if (cgData.ethereum) {
          newMarketData['ETH'] = {
            price: cgData.ethereum.usd,
            change: cgData.ethereum.usd_24h_change || 0
          };
        }
        if (cgData.ripple) {
          newMarketData['XRP'] = {
            price: cgData.ripple.usd,
            change: cgData.ripple.usd_24h_change || 0
          };
        }
        if (cgData.solana) {
          newMarketData['SOL'] = {
            price: cgData.solana.usd,
            change: cgData.solana.usd_24h_change || 0
          };
        }
        setMarketData(newMarketData);
      } catch (fallbackError) {
        // Suppress console error to avoid cluttering
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 800);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const balances = [
    { 
      coin: 'BTC', 
      name: 'Bitcoin', 
      amount: userData?.balances?.BTC || 0, 
      price: marketData.BTC.price, 
      change: marketData.BTC.change, 
      data: generateSparklineData(marketData.BTC.change >= 0, marketData.BTC.price) 
    },
    { 
      coin: 'ETH', 
      name: 'Ethereum', 
      amount: userData?.balances?.ETH || 0, 
      price: marketData.ETH.price, 
      change: marketData.ETH.change, 
      data: generateSparklineData(marketData.ETH.change >= 0, marketData.ETH.price) 
    },
    { 
      coin: 'XRP', 
      name: 'Ripple', 
      amount: userData?.balances?.XRP || 0, 
      price: marketData.XRP.price, 
      change: marketData.XRP.change, 
      data: generateSparklineData(marketData.XRP.change >= 0, marketData.XRP.price) 
    },
    { 
      coin: 'SOL', 
      name: 'Solana', 
      amount: userData?.balances?.SOL || 0, 
      price: marketData.SOL.price, 
      change: marketData.SOL.change, 
      data: generateSparklineData(marketData.SOL.change >= 0, marketData.SOL.price) 
    },
    { 
      coin: 'USDT', 
      name: 'Tether', 
      amount: userData?.balances?.USDT || 0, 
      price: marketData.USDT.price, 
      change: marketData.USDT.change, 
      data: generateSparklineData(marketData.USDT.change >= 0, marketData.USDT.price) 
    },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fluidSpring}
      className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl overflow-hidden relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="p-1.5 bg-primary/10 rounded-lg">
            <Wallet size={18} className="text-primary"/>
          </div>
          My Assets
        </h3>
        <button 
          onClick={fetchPrices}
          className={`text-muted hover:text-primary transition-all p-1.5 hover:bg-surface rounded-lg ${isSyncing ? 'animate-spin' : ''}`}
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="space-y-3 relative z-10">
        {balances.map(b => {
          const isPositive = b.change >= 0;
          return (
            <div key={b.coin} className="flex justify-between items-center p-3.5 rounded-2xl bg-surface/50 border border-border/30 hover:border-border/60 hover:bg-surface transition-all group cursor-default">
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 rounded-xl bg-background border border-border/30 flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-sm overflow-hidden">
                  <img src={CRYPTO_ICONS[b.coin]} alt={b.coin} className="w-full h-full object-contain" onError={(e) => {
                    (e.target as any).src = `https://ui-avatars.com/api/?name=${b.coin}&background=random`;
                  }} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-primary text-sm truncate">{b.name}</p>
                  <p className="text-[10px] font-medium text-muted uppercase tracking-wider">{b.amount.toLocaleString()} {b.coin}</p>
                </div>
              </div>
              
              <div className="w-1/4 h-10 opacity-40 group-hover:opacity-100 transition-all hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={b.data}>
                    <defs>
                      <linearGradient id={`gradient-${b.coin}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0.3}/>
                        <stop offset="95%" stopColor={isPositive ? '#10b981' : '#f43f5e'} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isPositive ? '#10b981' : '#f43f5e'} 
                      strokeWidth={1.5} 
                      fillOpacity={1} 
                      fill={`url(#gradient-${b.coin})`}
                      isAnimationActive={true}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="text-right w-1/3">
                <p className="font-bold text-primary text-sm">
                  ${(b.amount * b.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center justify-end gap-1 text-[10px] font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  <span>{isPositive ? '+' : ''}{b.change.toFixed(2)}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 mt-8 relative z-10">
        <button className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg shadow-[#0052ff]/20">Receive</button>
        <button className="flex-1 bg-surface-hover hover:bg-surface border border-border/50 text-primary py-3 rounded-xl text-xs font-bold transition-all active:scale-95">Send</button>
      </div>
    </motion.div>
  );
}
