import React from 'react';
import { motion } from 'motion/react';
import { Wallet, ShieldCheck, ArrowDownLeft, ArrowUpRight, CreditCard, Lock, Zap, RefreshCw, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { fluidSpring } from '../../components/SystemManager';

export default function WalletOverview() {
  const walletFeatures = [
    {
      icon: <ShieldCheck className="text-emerald-400" size={32} />,
      title: "Bank-Grade Security",
      description: "Your assets are protected with state-of-the-art encryption and multi-sig wallets."
    },
    {
      icon: <Zap className="text-amber-400" size={32} />,
      title: "Instant Transactions",
      description: "Fast deposits and withdrawals across multiple blockchain networks."
    },
    {
      icon: <CreditCard className="text-sky-400" size={32} />,
      title: "Multi-Crypto Support",
      description: "Manage Bitcoin, Ethereum, USDT, and more from a single, intuitive interface."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#0a0f1d] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/3 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-6">
            <Wallet size={16} />
            <span>Secure Asset Management</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Your Digital Assets, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
              Perfectly Secured
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Manage your crypto earnings with confidence. Our wallet provides the security of a cold storage vault with the convenience of a hot wallet.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {walletFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-emerald-500/30 transition-colors group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.4 }}
          className="relative p-12 rounded-[40px] bg-gradient-to-br from-emerald-500/20 to-sky-500/20 border border-white/10 overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent)]" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Secure your future earnings now
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
            Join thousands of users who trust our platform for their digital asset management and secure cloud mining rewards.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Transaction Flow Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-4 gap-8">
          {[
            { icon: <ArrowDownLeft size={24} />, title: "Deposit", text: "Easily fund your account with multiple crypto options." },
            { icon: <RefreshCw size={24} />, title: "Convert", text: "Swap between different cryptocurrencies instantly." },
            { icon: <ArrowUpRight size={24} />, title: "Withdraw", text: "Send your earnings to any external wallet securely." },
            { icon: <Lock size={24} />, title: "Secure", text: "All transactions are protected by advanced encryption." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-white/5 border border-white/10">
              <div className="mb-4 text-emerald-400">{item.icon}</div>
              <h4 className="text-lg font-bold text-white mb-2">{item.title}</h4>
              <p className="text-slate-500 text-xs leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
