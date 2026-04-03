import React from 'react';
import { motion } from 'motion/react';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownRight, Activity, DollarSign, Shield, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import WalletWidget from '../components/WalletWidget';
import { fluidSpring } from '../components/SystemManager';

export default function Wallet() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Wallet</h1>
          <p className="text-secondary mt-1">Manage your funds and monitor your financial growth.</p>
        </div>
        <div className="flex gap-3">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            onClick={() => navigate('/deposit')}
            className="px-6 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-full font-medium transition-colors flex items-center gap-2"
          >
            <ArrowDownRight size={18} /> Deposit
          </motion.button>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            onClick={() => navigate('/withdraw')}
            className="px-6 py-2 bg-card border border-border rounded-full hover:bg-subtle transition-colors flex items-center gap-2"
          >
            <ArrowUpRight size={18} /> Withdraw
          </motion.button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5, scale: 1.005 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-8 border border-border/50 relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#0052ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <div>
                  <p className="text-secondary font-medium mb-2">Total Estimated Balance</p>
                  <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-primary">
                    ${(userData?.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </h2>
                </div>
                <motion.div 
                  whileHover={{ rotate: 15, scale: 1.1 }}
                  transition={fluidSpring}
                  className="p-4 bg-[#0052ff]/10 rounded-2xl"
                >
                  <WalletIcon className="text-[#0052ff]" size={32} />
                </motion.div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={fluidSpring}
                  className="p-4 bg-surface rounded-2xl border border-border/50"
                >
                  <p className="text-xs text-secondary uppercase tracking-wider mb-1">Available BTC</p>
                  <p className="text-xl font-bold text-primary">{(userData?.balances?.BTC || 0).toFixed(8)} BTC</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={fluidSpring}
                  className="p-4 bg-surface rounded-2xl border border-border/50"
                >
                  <p className="text-xs text-secondary uppercase tracking-wider mb-1">Available ETH</p>
                  <p className="text-xl font-bold text-primary">{(userData?.balances?.ETH || 0).toFixed(8)} ETH</p>
                </motion.div>
                <motion.div 
                  whileHover={{ y: -3, scale: 1.02 }}
                  transition={fluidSpring}
                  className="p-4 bg-surface rounded-2xl border border-border/50"
                >
                  <p className="text-xs text-secondary uppercase tracking-wider mb-1">Available USDT</p>
                  <p className="text-xl font-bold text-primary">{(userData?.balances?.USDT || 0).toFixed(2)} USDT</p>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Wallet Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ ...fluidSpring, delay: 0.1 }}
              className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <TrendingUp className="text-emerald-500" size={20} />
                </div>
                <h3 className="font-bold">Growth Analysis</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Your portfolio has grown by <span className="text-emerald-400 font-bold">12.5%</span> in the last 30 days. Automated mining is performing at peak efficiency.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -5, scale: 1.01 }}
              transition={{ ...fluidSpring, delay: 0.2 }}
              className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Shield className="text-blue-500" size={20} />
                </div>
                <h3 className="font-bold">Security Status</h3>
              </div>
              <p className="text-sm text-secondary leading-relaxed">
                Your wallet is protected by <span className="text-blue-400 font-bold">AES-256</span> encryption and multi-signature verification. Funds are 100% insured.
              </p>
            </motion.div>
          </div>
        </div>

        <div className="space-y-8">
          <WalletWidget />
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ y: -5, scale: 1.01 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
          >
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Activity size={18} className="text-[#00f0ff]" />
              Quick Actions
            </h3>
            <div className="space-y-3">
              <motion.button 
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                transition={fluidSpring}
                onClick={() => navigate('/buy-hashpower')} 
                className="w-full p-3 rounded-xl bg-surface border border-border/50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Buy Hashpower</span>
                <ArrowUpRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </motion.button>
              <motion.button 
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                transition={fluidSpring}
                onClick={() => navigate('/transactions')} 
                className="w-full p-3 rounded-xl bg-surface border border-border/50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-sm font-medium">View History</span>
                <ArrowUpRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </motion.button>
              <motion.button 
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                transition={fluidSpring}
                onClick={() => navigate('/integration/e-payment')} 
                className="w-full p-3 rounded-xl bg-surface border border-border/50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-sm font-medium">E-Payment Gateway</span>
                <ArrowUpRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </motion.button>
              <motion.button 
                whileHover={{ x: 5, backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                transition={fluidSpring}
                onClick={() => navigate('/support')} 
                className="w-full p-3 rounded-xl bg-surface border border-border/50 transition-all text-left flex items-center justify-between group"
              >
                <span className="text-sm font-medium">Get Support</span>
                <ArrowUpRight size={16} className="text-muted group-hover:text-primary transition-colors" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
