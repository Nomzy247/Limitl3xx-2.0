import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, RefreshCw, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const generateSparklineData = (isPositive: boolean) => {
  let current = 100;
  return Array.from({ length: 20 }, () => {
    current += (Math.random() - (isPositive ? 0.3 : 0.7)) * 10;
    return { value: current };
  });
};

export default function WalletWidget() {
  const { userData } = useAuth();
  
  // We'll use static prices for demonstration, but in a real app these would be fetched from an API
  const prices = {
    BTC: 65000,
    ETH: 3500,
    USDT: 1
  };

  const changes = {
    BTC: 2.5,
    ETH: -1.2,
    USDT: 0.01
  };

  const balances = [
    { coin: 'BTC', name: 'Bitcoin', amount: userData?.balances?.BTC || 0, price: prices.BTC, change: changes.BTC, data: generateSparklineData(changes.BTC >= 0) },
    { coin: 'ETH', name: 'Ethereum', amount: userData?.balances?.ETH || 0, price: prices.ETH, change: changes.ETH, data: generateSparklineData(changes.ETH >= 0) },
    { coin: 'USDT', name: 'Tether', amount: userData?.balances?.USDT || 0, price: prices.USDT, change: changes.USDT, data: generateSparklineData(changes.USDT >= 0) },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fluidSpring}
      className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Wallet size={20} className="text-[#0052ff]"/> Crypto Wallet</h3>
        <button className="text-muted hover:text-primary transition-colors"><RefreshCw size={16} /></button>
      </div>
      <div className="space-y-4">
        {balances.map(b => {
          const isPositive = b.change >= 0;
          return (
            <div key={b.coin} className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border/50 hover:border-border transition-colors group">
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center font-bold text-sm">
                  {b.coin}
                </div>
                <div>
                  <p className="font-semibold text-primary">{b.name}</p>
                  <p className="text-xs text-muted">{b.amount} {b.coin}</p>
                </div>
              </div>
              
              <div className="w-1/4 h-10 opacity-60 group-hover:opacity-100 transition-opacity hidden sm:block">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={b.data}>
                    <YAxis domain={['dataMin', 'dataMax']} hide />
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={isPositive ? '#10b981' : '#f43f5e'} 
                      strokeWidth={2} 
                      dot={false} 
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-right w-1/3">
                <p className="font-semibold text-primary">${(b.amount * b.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                <div className={`flex items-center justify-end gap-1 text-xs font-medium ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  <span>{isPositive ? '+' : ''}{b.change}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex gap-3 mt-6">
        <button className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-2 rounded-full text-sm font-medium transition-colors">Receive</button>
        <button className="flex-1 bg-subtle hover:bg-subtle-hover text-primary py-2 rounded-full text-sm font-medium transition-colors">Send</button>
      </div>
    </motion.div>
  );
}
