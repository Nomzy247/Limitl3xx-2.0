import React from 'react';
import { motion } from 'motion/react';
import { Coins, TrendingUp, Cpu, ArrowRight, Zap, ShieldCheck, BarChart3 } from 'lucide-react';
import { Link } from 'react-router';
import { fluidSpring } from '../../components/SystemManager';

export default function EarnOverview() {
  const features = [
    {
      icon: <Cpu className="text-sky-400" size={32} />,
      title: "Cloud Mining",
      description: "High-performance mining rigs at your fingertips. No hardware required, start earning in minutes."
    },
    {
      icon: <TrendingUp className="text-emerald-400" size={32} />,
      title: "Stock Market",
      description: "Diversify your portfolio with integrated stock trading. Real-time data and seamless execution."
    },
    {
      icon: <Zap className="text-amber-400" size={32} />,
      title: "Instant ROI",
      description: "Watch your earnings grow in real-time. Daily payouts and transparent performance tracking."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#0a0f1d] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <Coins size={16} />
            <span>Maximize Your Profits</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Earn Smarter with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-emerald-400">
              Advanced Mining
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Our platform combines the power of cloud mining with the agility of the stock market to provide you with unparalleled earning opportunities.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-sky-500/30 transition-colors group"
            >
              <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform">
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
          className="relative p-12 rounded-[40px] bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-white/10 overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.1),transparent)]" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Ready to start your earning journey?
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
            Join thousands of users who are already profiting from our high-performance mining pools and market insights.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(14,165,233,0.3)] flex items-center justify-center gap-2 group"
            >
              Create Account <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Stats Section */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: "Active Miners", value: "45k+" },
            { label: "Daily Payouts", value: "$2.4M" },
            { label: "Uptime", value: "99.9%" },
            { label: "Hashrate", value: "12.5 EH/s" }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-slate-500 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
