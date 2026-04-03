import React from 'react';
import { motion } from 'motion/react';
import { ArrowDownRight, ArrowUpRight, Activity, DollarSign, History } from 'lucide-react';
import { fluidSpring } from './SystemManager';

interface TransactionHistoryModuleProps {
  transactions: any[];
  miningRevenue: number;
}

export default function TransactionHistoryModule({ transactions, miningRevenue }: TransactionHistoryModuleProps) {
  // Calculate metrics based on transaction history
  // Default to 0.00 for empty states
  const totalBuys = transactions.filter(t => t.type === 'buy' || t.type === 'deposit').reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalSells = transactions.filter(t => t.type === 'sell' || t.type === 'withdrawal').reduce((acc, t) => acc + (t.amount || 0), 0);
  const netCashFlow = totalBuys - totalSells + miningRevenue;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...fluidSpring, delay: 0.3 }}
      className="bg-card/60 backdrop-blur-2xl rounded-3xl p-6 border border-white/5 shadow-2xl flex flex-col relative overflow-hidden"
    >
      {/* Glassmorphism Gradient Overlays */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="mb-8 relative z-10">
        <h2 className="text-2xl font-bold text-primary tracking-tight">Transaction History</h2>
        <p className="text-sm text-secondary mt-1">Track all your trades and mining revenue</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 relative z-10">
        <MetricCard 
          title="Total Buys" 
          amount={totalBuys} 
          icon={<ArrowDownRight size={18} />} 
          color="text-emerald-400" 
          bg="bg-emerald-500/10 border-emerald-500/20" 
        />
        <MetricCard 
          title="Total Sells" 
          amount={totalSells} 
          icon={<ArrowUpRight size={18} />} 
          color="text-rose-400" 
          bg="bg-rose-500/10 border-rose-500/20" 
        />
        <MetricCard 
          title="Mining Revenue" 
          amount={miningRevenue} 
          icon={<Activity size={18} />} 
          color="text-[#00f0ff]" 
          bg="bg-[#00f0ff]/10 border-[#00f0ff]/20" 
        />
        <MetricCard 
          title="Net Cash Flow" 
          amount={netCashFlow} 
          icon={<DollarSign size={18} />} 
          color="text-purple-400" 
          bg="bg-purple-500/10 border-purple-500/20" 
        />
      </div>

      {/* Transaction List */}
      <div className="space-y-3 flex-1 relative z-10">
        {transactions.length > 0 ? (
          transactions.map((tx: any, i: number) => (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              whileTap={{ scale: 0.99 }}
              transition={{ ...fluidSpring, delay: 0.4 + i * 0.1 }}
              key={tx.id} 
              className="group flex items-center justify-between p-4 rounded-2xl bg-surface/50 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                  tx.type === 'deposit' || tx.type === 'buy' ? 'bg-emerald-500/10 text-emerald-400' :
                  tx.type === 'withdrawal' || tx.type === 'sell' ? 'bg-rose-500/10 text-rose-400' :
                  'bg-[#00f0ff]/10 text-[#00f0ff]'
                }`}>
                  {tx.type === 'deposit' || tx.type === 'buy' ? <ArrowDownRight size={18} /> :
                   tx.type === 'withdrawal' || tx.type === 'sell' ? <ArrowUpRight size={18} /> :
                   <Activity size={18} />}
                </div>
                <div>
                  <p className="text-sm font-semibold capitalize text-primary group-hover:text-primary transition-colors">{tx.type}</p>
                  <p className="text-xs text-muted mt-0.5">
                    {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-sm ${
                  tx.type === 'withdrawal' || tx.type === 'sell' ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {tx.type === 'withdrawal' || tx.type === 'sell' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <p className="text-xs text-muted mt-0.5 capitalize">{tx.status}</p>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-muted text-sm py-12 bg-surface/30 rounded-2xl border border-white/5 border-dashed">
            <History className="mb-3 opacity-30" size={32} />
            <p>No recent transactions</p>
            <p className="text-xs opacity-50 mt-1">Your trading and mining history will appear here.</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MetricCard({ title, amount, icon, color, bg }: { title: string, amount: number, icon: React.ReactNode, color: string, bg: string }) {
  return (
    <motion.div 
      whileHover={{ y: -4, scale: 1.02 }}
      transition={fluidSpring}
      className="bg-surface/40 backdrop-blur-md border border-white/5 p-5 rounded-2xl flex flex-col justify-between"
    >
      <div className="flex justify-between items-start mb-4">
        <div className={`w-10 h-10 rounded-xl ${bg} ${color} flex items-center justify-center border`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-xs text-secondary font-medium mb-1">{title}</p>
        <p className={`text-xl font-bold ${color}`}>
          ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </motion.div>
  );
}
