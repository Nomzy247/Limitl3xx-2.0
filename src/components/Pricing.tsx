import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Check, ArrowRight, X, Cpu, Zap, Shield, Activity } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

const plans = [
  {
    id: 'starter',
    name: 'Starter Hashnode',
    price: '$500',
    return: '1.4%',
    duration: '30 Days',
    features: ['Real-time Telemetry', 'Standard 24/7 Support', 'Daily Payouts', 'Zero Electricity Fee'],
    recommended: false,
    breakdown: {
      hardware: { title: 'Shared WhatsMiner M60S Array', detail: '35 TH/s allocated power', sub: '99.98% Uptime Guarantee' },
      electricity: { title: '100% Green Hydro Power', detail: 'Zero carbon footprint', sub: 'Subsidized grid rate' },
      risk: { title: 'Low Volatility', detail: 'Consistent daily distributions', sub: 'Principal protected' },
      maintenance: { title: '1.5% Daily Fee', detail: 'Automated ASIC load balancing', sub: 'Instant hot-swap warranty' },
      expectedYield: '$210 (30 Days)'
    }
  },
  {
    id: 'pro',
    name: 'Pro ASIC Miner',
    price: '$5,000',
    return: '1.95%',
    duration: '60 Days',
    features: ['Advanced Hashrate Analytics', 'Priority VIP Support', 'Hourly Payouts', 'Auto-Compound Engine'],
    recommended: true,
    breakdown: {
      hardware: { title: 'Dedicated Antminer S21 Pro', detail: '234 TH/s dedicated power (15 J/TH)', sub: 'Direct stratum pool connection' },
      electricity: { title: 'Geothermal Optimized ($0.03/kWh)', detail: '100% Iceland/Norway Renewable', sub: 'Carbon-negative mining' },
      risk: { title: 'Balanced Growth', detail: 'Algorithmic multi-coin switching', sub: 'Downside hedged' },
      maintenance: { title: '1% Daily Fee', detail: '24/7 real-time telemetry monitoring', sub: 'Active cooling management' },
      expectedYield: '$5,850 (60 Days)'
    }
  },
  {
    id: 'kaspa',
    name: 'Kaspa KS5 & Doge Rig',
    price: '$12,500',
    return: '2.35%',
    duration: '90 Days',
    features: ['kHeavyHash & Scrypt Dual Mining', 'Dedicated Account Manager', 'Custom Payout Schedules', 'Zero Deposit Fees'],
    recommended: false,
    breakdown: {
      hardware: { title: 'Kaspa KS5 Pro (21 TH/s) + L7 Rig', detail: 'High-speed DAG & Scrypt compute', sub: 'Sub-second block solving' },
      electricity: { title: 'Nordic Hydro Wholesale ($0.025/kWh)', detail: 'Direct high-voltage feed', sub: 'Ultra-low PUE 1.04' },
      risk: { title: 'High Yield', detail: 'Kaspa/DOGE/LTC combined rewards', sub: 'Automated profit auto-swap' },
      maintenance: { title: '0.8% Daily Fee', detail: 'Immersion cooling tank hosted', sub: 'Overclocked firmware tuning' },
      expectedYield: '$26,437 (90 Days)'
    }
  },
  {
    id: 'elite',
    name: 'Elite S21 Hydro & H100 AI',
    price: '$35,000',
    return: '2.85%',
    duration: '120 Days',
    features: ['Institutional Grade SLA', '24/7 Dedicated Account Manager', 'Instant API Payouts', 'Zero Maintenance Fees'],
    recommended: false,
    breakdown: {
      hardware: { title: '5x Antminer S21 Hydro + NVIDIA H100', detail: '1,675 TH/s BTC + AI Tensor Compute', sub: 'Liquid immersion pods' },
      electricity: { title: 'Industrial Wholesale ($0.018/kWh)', detail: 'Direct hydro-dam connection', sub: 'Lowest global industrial rate' },
      risk: { title: 'Institutional Yield', detail: 'AI inference + BTC hybrid yield', sub: 'Capital insurance guarantee' },
      maintenance: { title: '0% Fee', detail: 'White-glove institutional service', sub: 'Zero downtime guarantee' },
      expectedYield: '$119,700 (120 Days)'
    }
  }
];

const TrendingChart = () => (
  <div className="mt-6 bg-surface p-6 rounded-2xl border border-border/50">
    <div className="flex justify-between items-end mb-2">
      <span className="text-sm font-semibold text-secondary uppercase tracking-wider">Projected Growth</span>
      <span className="text-xs text-[#00f0ff] font-bold animate-pulse">Live Simulation</span>
    </div>
    <div className="h-24 w-full relative">
      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
        <motion.path
          d="M 0 40 Q 15 38 25 30 T 50 20 T 75 10 T 100 0"
          fill="none"
          stroke="url(#chart-gradient)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        <motion.path
          d="M 0 40 Q 15 38 25 30 T 50 20 T 75 10 T 100 0 L 100 40 L 0 40 Z"
          fill="url(#chart-fill)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        <defs>
          <linearGradient id="chart-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0052ff" />
            <stop offset="100%" stopColor="#00f0ff" />
          </linearGradient>
          <linearGradient id="chart-fill" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0052ff" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  </div>
);

export default function Pricing() {
  const isDark = useIsDark();
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  return (
    <section id="plans" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-[#0052ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight cursor-default"
          >
            Investment <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Plans</span>
          </motion.h2>
          <p className="text-secondary text-lg">Choose the right mining tier for your investment goals.</p>
        </div>
        
        <div className="flex md:grid md:grid-cols-3 gap-6 items-start overflow-x-auto pb-8 md:pb-0 snap-x snap-mandatory px-4 md:px-0">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 1 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.15)' : '0 0 30px rgba(0, 82, 255, 0.1)',
                borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 82, 255, 0.3)'
              }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setSelectedPlan(plan)}
              className={`relative p-8 rounded-[2rem] border flex-shrink-0 w-[85vw] md:w-full snap-center cursor-pointer ${
                plan.recommended 
                  ? 'bg-gradient-to-b from-[#111827] to-[#0a0e17] border-[#0052ff]/50 shadow-[0_0_40px_rgba(0,82,255,0.15)] transform md:-translate-y-4' 
                  : 'bg-surface border-border/50 transition-all group'
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-[#0052ff] to-[#00f0ff] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                  Most Popular
                </div>
              )}
              
              <motion.h3 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-semibold mb-2 tracking-tight cursor-default"
              >
                {plan.name}
              </motion.h3>
              <div className="flex items-baseline gap-2 mb-8">
                <span className="text-5xl font-bold tracking-tighter">{plan.price}</span>
                <span className="text-muted text-sm font-medium">min.</span>
              </div>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-secondary font-medium">Daily Return</span>
                  <span className="font-bold text-[#00f0ff] text-lg">{plan.return}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-secondary font-medium">Duration</span>
                  <span className="font-semibold text-primary">{plan.duration}</span>
                </div>
              </div>
              
              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted">
                    <div className="w-5 h-5 rounded-full bg-[#00f0ff]/10 flex items-center justify-center shrink-0">
                      <Check size={12} className="text-[#00f0ff]" />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              
              <button
                className={`w-full py-4 rounded-full text-center font-bold transition-all flex items-center justify-center gap-2 pointer-events-none ${
                  plan.recommended
                    ? 'bg-primary text-background group-hover:scale-105'
                    : 'bg-subtle group-hover:bg-subtle-hover text-primary border border-border'
                }`}
              >
                View Breakdown <ArrowRight size={18} className={plan.recommended ? 'group-hover:translate-x-1 transition-transform' : ''} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Plan Breakdown Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPlan(null)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={fluidSpring}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 md:p-8 border-b border-border/50 flex justify-between items-center bg-surface sticky top-0 z-10">
                <div>
                  <h3 className="text-2xl font-bold text-primary">{selectedPlan.name} Breakdown</h3>
                  <p className="text-secondary text-sm mt-1">Detailed insight into your investment</p>
                </div>
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 rounded-full hover:bg-subtle transition-colors text-muted hover:text-primary"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="p-6 md:p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-surface p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Cpu size={18} className="text-[#0052ff]" />
                      <span className="font-semibold text-sm text-secondary uppercase tracking-wider">Hardware</span>
                    </div>
                    <p className="font-bold text-primary mb-1">{selectedPlan.breakdown.hardware.title}</p>
                    <ul className="text-xs text-muted space-y-1">
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.hardware.detail}</li>
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.hardware.sub}</li>
                    </ul>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap size={18} className="text-amber-400" />
                      <span className="font-semibold text-sm text-secondary uppercase tracking-wider">Electricity</span>
                    </div>
                    <p className="font-bold text-primary mb-1">{selectedPlan.breakdown.electricity.title}</p>
                    <ul className="text-xs text-muted space-y-1">
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.electricity.detail}</li>
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.electricity.sub}</li>
                    </ul>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield size={18} className="text-emerald-400" />
                      <span className="font-semibold text-sm text-secondary uppercase tracking-wider">Risk Profile</span>
                    </div>
                    <p className="font-bold text-primary mb-1">{selectedPlan.breakdown.risk.title}</p>
                    <ul className="text-xs text-muted space-y-1">
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.risk.detail}</li>
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.risk.sub}</li>
                    </ul>
                  </div>
                  
                  <div className="bg-surface p-4 rounded-2xl border border-border/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity size={18} className="text-[#00f0ff]" />
                      <span className="font-semibold text-sm text-secondary uppercase tracking-wider">Maintenance</span>
                    </div>
                    <p className="font-bold text-primary mb-1">{selectedPlan.breakdown.maintenance.title}</p>
                    <ul className="text-xs text-muted space-y-1">
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.maintenance.detail}</li>
                      <li className="flex items-center gap-1"><Check size={10} className="text-[#00f0ff]"/> {selectedPlan.breakdown.maintenance.sub}</li>
                    </ul>
                  </div>
                </div>

                <TrendingChart />

                <div className="bg-gradient-to-r from-[#0052ff]/10 to-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-2xl p-6 text-center">
                  <p className="text-sm text-secondary font-medium mb-2 uppercase tracking-wider">Expected Total Yield</p>
                  <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">
                    {selectedPlan.breakdown.expectedYield}
                  </p>
                </div>
              </div>
              
              <div className="p-6 md:p-8 border-t border-border/50 bg-surface flex flex-col sm:flex-row gap-4 justify-end sticky bottom-0 z-10">
                <button 
                  onClick={() => setSelectedPlan(null)}
                  className="px-6 py-3 rounded-full font-semibold text-primary hover:bg-subtle transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    setSelectedPlan(null);
                    navigate(`/signup?plan=${selectedPlan.id}`);
                  }}
                  className="px-8 py-3 rounded-full font-bold bg-[#0052ff] hover:bg-[#0052ff]/90 text-white transition-all shadow-lg shadow-[#0052ff]/25 flex items-center justify-center gap-2"
                >
                  Proceed with {selectedPlan.name} <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
