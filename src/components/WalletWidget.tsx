import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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
    { coin: 'BTC', name: 'Bitcoin', amount: userData?.balances?.BTC || 0, price: prices.BTC, change: changes.BTC },
    { coin: 'ETH', name: 'Ethereum', amount: userData?.balances?.ETH || 0, price: prices.ETH, change: changes.ETH },
    { coin: 'USDT', name: 'Tether', amount: userData?.balances?.USDT || 0, price: prices.USDT, change: changes.USDT },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Wallet size={20} className="text-[#0052ff]"/> Crypto Wallet</h3>
        <button className="text-muted hover:text-primary transition-colors"><RefreshCw size={16} /></button>
      </div>
      <div className="space-y-4">
        {balances.map(b => (
          <div key={b.coin} className="flex justify-between items-center p-3 rounded-xl bg-surface border border-border/50 hover:border-border transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center font-bold text-sm">
                {b.coin}
              </div>
              <div>
                <p className="font-semibold text-primary">{b.name}</p>
                <p className="text-xs text-muted">{b.amount} {b.coin}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary">${(b.amount * b.price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className={`text-xs ${b.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {b.change >= 0 ? '+' : ''}{b.change}%
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-3 mt-6">
        <button className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-2 rounded-full text-sm font-medium transition-colors">Receive</button>
        <button className="flex-1 bg-subtle hover:bg-subtle-hover text-primary py-2 rounded-full text-sm font-medium transition-colors">Send</button>
      </div>
    </motion.div>
  );
}
