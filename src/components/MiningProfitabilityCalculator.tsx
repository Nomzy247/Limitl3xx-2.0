import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Zap, 
  DollarSign, 
  Cpu, 
  TrendingUp, 
  Percent, 
  Info, 
  Flame, 
  Sparkles, 
  RefreshCw,
  Clock,
  Coins
} from 'lucide-react';
import { fluidSpring } from './SystemManager';
import { useMarketWatch } from '../hooks/useMarketWatch';

interface MiningProfitabilityCalculatorProps {
  defaultHashpower?: number; // In TH/s
  defaultPowerConsumption?: number; // In Watts
  defaultCostPerKWh?: number; // In $/kWh
  coin?: 'BTC' | 'ETH' | 'LTC' | 'KAS';
  className?: string;
}

export default function MiningProfitabilityCalculator({
  defaultHashpower = 100, // 100 TH/s standard ASIC (e.g., Antminer S19)
  defaultPowerConsumption = 3250, // Watts
  defaultCostPerKWh = 0.05, // $0.05 / kWh
  coin = 'BTC',
  className = ''
}: MiningProfitabilityCalculatorProps) {
  const [hashpower, setHashpower] = useState<number>(defaultHashpower);
  const [hashUnit, setHashUnit] = useState<'GH' | 'TH' | 'EH'>('TH');
  const [powerWatts, setPowerWatts] = useState<number>(defaultPowerConsumption);
  const [electricityCost, setElectricityCost] = useState<number>(defaultCostPerKWh);
  const [poolFeePercent, setPoolFeePercent] = useState<number>(1.0); // 1% pool fee
  
  // Real-time BTC market price from Binance WebSocket / fallback
  const marketData = useMarketWatch(['btcusdt']);
  const liveBtcPrice = marketData['btcusdt']?.price || 96500;
  
  // Network stats state (BTC difficulty)
  const [networkDifficulty, setNetworkDifficulty] = useState<number>(84.2); // Trillion (T)
  const [blockReward, setBlockReward] = useState<number>(3.125); // Current post-2024 halving block reward
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch or simulate live network difficulty data
  const fetchNetworkData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/mining/stats?pool=bitcoin');
      if (res.ok) {
        const data = await res.json();
        if (data.networkDifficulty) {
          const parsedDiff = parseFloat(data.networkDifficulty);
          if (!isNaN(parsedDiff)) setNetworkDifficulty(parsedDiff);
        }
      }
    } catch (e) {
      console.warn('Using standard difficulty calculation baseline.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  // Standard Bitcoin Mining Formula:
  // Expected BTC per day = (Hashrate_in_H_s * 86400 * BlockReward) / (Difficulty * 2^32)
  const effectiveHashrateInH = (() => {
    switch (hashUnit) {
      case 'GH': return hashpower * 1e9;
      case 'TH': return hashpower * 1e12;
      case 'EH': return hashpower * 1e18;
      default: return hashpower * 1e12;
    }
  })();

  const difficultyInAbsolute = networkDifficulty * 1e12; // In standard units
  const twoPower32 = 4294967296;

  // Daily gross mined coin
  const dailyMinedCoin = difficultyInAbsolute > 0 
    ? (effectiveHashrateInH * 86400 * blockReward) / (difficultyInAbsolute * twoPower32)
    : 0;

  const grossDailyRevenueUsd = dailyMinedCoin * liveBtcPrice * (1 - poolFeePercent / 100);
  const grossMonthlyRevenueUsd = grossDailyRevenueUsd * 30.5;

  // Electricity cost calculations
  // Daily kWh = (Watts * 24) / 1000
  const dailyKWh = (powerWatts * 24) / 1000;
  const dailyPowerCostUsd = dailyKWh * electricityCost;
  const monthlyPowerCostUsd = dailyPowerCostUsd * 30.5;

  // Net Profit
  const netDailyProfitUsd = grossDailyRevenueUsd - dailyPowerCostUsd;
  const netMonthlyProfitUsd = grossMonthlyRevenueUsd - monthlyPowerCostUsd;
  const netYearlyProfitUsd = netDailyProfitUsd * 365;

  // Efficiency (Joules per Terahash: J/TH = Watts / (Hashrate in TH/s))
  const hashrateInTH = effectiveHashrateInH / 1e12;
  const efficiencyJPerTH = hashrateInTH > 0 ? (powerWatts / hashrateInTH).toFixed(1) : '0';

  return (
    <motion.section 
      id="mining-profitability-calculator-widget"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fluidSpring}
      aria-label="Mining Profitability & Network Difficulty Calculator"
      className={`bg-card/90 dark:bg-card/60 backdrop-blur-xl border border-border/80 rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-[#0052ff]/10 dark:bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#0052ff] to-[#00f0ff] flex items-center justify-center text-white shadow-md">
              <Calculator size={18} strokeWidth={2.4} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
                Mining Profitability Calculator
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Live Model
                </span>
              </h2>
              <p className="text-xs text-secondary mt-0.5">
                Real-time yield estimates based on network difficulty and energy tariffs.
              </p>
            </div>
          </div>
        </div>

        {/* Live Network Difficulty & Price Indicator */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border/60">
            <Coins size={14} className="text-amber-500" />
            <span className="text-secondary font-medium">BTC:</span>
            <span className="font-bold font-mono text-primary">
              ${liveBtcPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border/60">
            <TrendingUp size={14} className="text-[#0052ff] dark:text-[#00f0ff]" />
            <span className="text-secondary font-medium">Difficulty:</span>
            <span className="font-bold font-mono text-primary">{networkDifficulty.toFixed(2)} T</span>
            <button 
              onClick={fetchNetworkData}
              disabled={isRefreshing}
              className="ml-1 text-secondary hover:text-primary transition-colors disabled:opacity-50"
              aria-label="Refresh Network Difficulty"
            >
              <RefreshCw size={12} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Inputs + Output Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6">
        {/* Left Form: Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* Hashpower Input */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="input-hashpower" className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <Cpu size={14} className="text-[#0052ff]" /> Hashpower Rate
              </label>
              <div className="flex bg-surface rounded-lg p-0.5 border border-border/60">
                {(['GH', 'TH', 'EH'] as const).map((unit) => (
                  <button
                    key={unit}
                    onClick={() => setHashUnit(unit)}
                    className={`px-2 py-0.5 text-xs font-bold rounded-md transition-all ${
                      hashUnit === unit
                        ? 'bg-primary text-background shadow-sm'
                        : 'text-secondary hover:text-primary'
                    }`}
                  >
                    {unit}/s
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <input
                id="input-hashpower"
                type="number"
                min="1"
                step="any"
                value={hashpower}
                onChange={(e) => setHashpower(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-lg font-bold font-mono text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/40 transition-all"
                placeholder="e.g. 100"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary">
                {hashUnit}/s
              </span>
            </div>
            <div className="flex gap-2 mt-2">
              {[10, 50, 100, 200, 500].map((preset) => (
                <button
                  key={preset}
                  onClick={() => { setHashpower(preset); setHashUnit('TH'); }}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface border border-border/60 hover:border-primary/40 text-secondary hover:text-primary transition-all"
                >
                  {preset} TH/s
                </button>
              ))}
            </div>
          </div>

          {/* Power Consumption (Watts) & Electricity Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="input-power" className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2">
                <Zap size={14} className="text-amber-500" /> Power Consumption
              </label>
              <div className="relative">
                <input
                  id="input-power"
                  type="number"
                  min="0"
                  step="50"
                  value={powerWatts}
                  onChange={(e) => setPowerWatts(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-base font-bold font-mono text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/40 transition-all"
                  placeholder="3250"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary">
                  Watts
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1">
                Efficiency: <span className="font-semibold text-primary font-mono">{efficiencyJPerTH} J/TH</span>
              </p>
            </div>

            <div>
              <label htmlFor="input-cost-kwh" className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2">
                <DollarSign size={14} className="text-emerald-500" /> Electricity Tariff
              </label>
              <div className="relative">
                <input
                  id="input-cost-kwh"
                  type="number"
                  min="0"
                  step="0.01"
                  value={electricityCost}
                  onChange={(e) => setElectricityCost(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-base font-bold font-mono text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/40 transition-all"
                  placeholder="0.05"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-secondary">
                  $/kWh
                </span>
              </div>
              <p className="text-[11px] text-secondary mt-1">
                Industrial average: <span className="font-semibold text-primary font-mono">$0.04 - $0.07</span>
              </p>
            </div>
          </div>

          {/* Pool Fee Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                <Percent size={14} className="text-purple-400" /> Mining Pool Fee
              </span>
              <span className="text-xs font-mono font-bold text-primary">{poolFeePercent.toFixed(1)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={poolFeePercent}
              onChange={(e) => setPoolFeePercent(parseFloat(e.target.value))}
              className="w-full accent-[#0052ff] h-1.5 bg-border rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Right Output: Estimated Profit Card */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-surface to-surface/60 border border-border rounded-2xl p-6 relative overflow-hidden">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-secondary">
              Estimated Net Profit
            </span>

            {/* Monthly Net Hero */}
            <div className="mt-2 mb-4">
              <div className="flex items-baseline gap-2">
                <span className={`text-4xl font-black font-mono tracking-tight ${netMonthlyProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  {netMonthlyProfitUsd >= 0 ? '+' : '-'}${Math.abs(netMonthlyProfitUsd).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-xs font-bold text-secondary uppercase">/ Month</span>
              </div>
              <p className="text-xs text-secondary mt-1">
                Yield after deducting ${(monthlyPowerCostUsd).toFixed(2)} in electricity expenses.
              </p>
            </div>

            {/* Granular Breakdown Table */}
            <div className="space-y-3 pt-4 border-t border-border/70 text-sm">
              {/* Daily Gross & Net */}
              <div className="flex justify-between items-center">
                <span className="text-secondary flex items-center gap-1.5">
                  <Clock size={14} /> Daily Gross Output
                </span>
                <div className="text-right">
                  <span className="font-mono font-bold text-primary">
                    ${grossDailyRevenueUsd.toFixed(2)}
                  </span>
                  <div className="text-[10px] font-mono text-secondary">
                    ≈ {dailyMinedCoin.toFixed(6)} BTC
                  </div>
                </div>
              </div>

              {/* Daily Energy Cost */}
              <div className="flex justify-between items-center">
                <span className="text-secondary flex items-center gap-1.5">
                  <Flame size={14} className="text-amber-500" /> Daily Power Cost
                </span>
                <span className="font-mono font-semibold text-rose-400">
                  -${dailyPowerCostUsd.toFixed(2)}
                </span>
              </div>

              {/* Daily Net Profit */}
              <div className="flex justify-between items-center font-semibold">
                <span className="text-secondary">Daily Net Profit</span>
                <span className={`font-mono ${netDailyProfitUsd >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                  {netDailyProfitUsd >= 0 ? '+' : '-'}${Math.abs(netDailyProfitUsd).toFixed(2)}
                </span>
              </div>

              {/* Annualized Projected ROI */}
              <div className="flex justify-between items-center pt-2 border-t border-border/40">
                <span className="text-secondary font-medium">Annualized Projected</span>
                <span className={`font-mono font-black ${netYearlyProfitUsd >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                  ${netYearlyProfitUsd.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr
                </span>
              </div>
            </div>
          </div>

          {/* Footnote information */}
          <div className="mt-5 p-3 rounded-xl bg-card border border-border/60 flex items-start gap-2 text-[11px] text-secondary">
            <Info size={14} className="text-[#0052ff] shrink-0 mt-0.5" />
            <p>
              Calculations incorporate live difficulty and standard 3.125 BTC block reward. Cloud & Pool hosting packages on our platform include zero maintenance charges.
            </p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
