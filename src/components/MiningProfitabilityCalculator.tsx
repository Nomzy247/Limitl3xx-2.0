import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Coins,
  ArrowRight,
  ShieldCheck,
  Calendar,
  Layers,
  ChevronRight,
  Check
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { fluidSpring } from './SystemManager';
import { useMarketWatch } from '../hooks/useMarketWatch';

interface MiningProfitabilityCalculatorProps {
  defaultHashpower?: number; // In TH/s
  defaultPowerConsumption?: number; // In Watts
  defaultCostPerKWh?: number; // In $/kWh
  coin?: 'BTC' | 'LTC' | 'KAS' | 'ETC';
  className?: string;
  initialMode?: 'budget' | 'hashrate';
}

const COIN_CONFIGS = {
  BTC: {
    name: 'Bitcoin',
    symbol: 'BTC',
    algo: 'SHA-256',
    priceKey: 'btcusdt',
    fallbackPrice: 96500,
    unit: 'TH/s',
    hashCostPerUnit: 22, // ~$22 per TH/s cloud allocation
    dailyBaseRoi: 1.45, // Base 1.45% daily
    color: 'from-amber-500 to-orange-600',
    iconColor: 'text-amber-500'
  },
  LTC: {
    name: 'Litecoin & Doge',
    symbol: 'LTC',
    algo: 'Scrypt',
    priceKey: 'ltcusdt',
    fallbackPrice: 115,
    unit: 'GH/s',
    hashCostPerUnit: 14,
    dailyBaseRoi: 1.55,
    color: 'from-blue-500 to-cyan-600',
    iconColor: 'text-blue-400'
  },
  KAS: {
    name: 'Kaspa',
    symbol: 'KAS',
    algo: 'kHeavyHash',
    priceKey: 'kasusdt',
    fallbackPrice: 0.16,
    unit: 'TH/s',
    hashCostPerUnit: 18,
    dailyBaseRoi: 1.65,
    color: 'from-emerald-400 to-teal-600',
    iconColor: 'text-emerald-400'
  },
  ETC: {
    name: 'Ethereum Classic',
    symbol: 'ETC',
    algo: 'Etchash',
    priceKey: 'etcusdt',
    fallbackPrice: 28,
    unit: 'MH/s',
    hashCostPerUnit: 8,
    dailyBaseRoi: 1.50,
    color: 'from-emerald-500 to-green-700',
    iconColor: 'text-emerald-500'
  }
};

const DURATION_PRESETS = [
  { days: 30, label: '30 Days', multiplier: 1.0, badge: 'Starter' },
  { days: 90, label: '90 Days', multiplier: 1.12, badge: '+12% Bonus' },
  { days: 180, label: '180 Days', multiplier: 1.25, badge: '+25% Bonus' },
  { days: 365, label: '1 Year', multiplier: 1.40, badge: '+40% Max Yield' },
];

const BUDGET_PRESETS = [100, 250, 500, 1000, 2500, 5000, 10000];

export default function MiningProfitabilityCalculator({
  defaultHashpower = 100,
  defaultPowerConsumption = 3250,
  defaultCostPerKWh = 0.05,
  coin = 'BTC',
  className = '',
  initialMode = 'budget'
}: MiningProfitabilityCalculatorProps) {
  const navigate = useNavigate();
  const [calcMode, setCalcMode] = useState<'budget' | 'hashrate'>(initialMode);
  
  // Budget Mode States
  const [budget, setBudget] = useState<number>(1000);
  const [selectedCoin, setSelectedCoin] = useState<'BTC' | 'LTC' | 'KAS' | 'ETC'>(coin);
  const [selectedDuration, setSelectedDuration] = useState<number>(90);
  const [reinvestGains, setReinvestGains] = useState<boolean>(false);

  // Hardware Mode States
  const [hashpower, setHashpower] = useState<number>(defaultHashpower);
  const [hashUnit, setHashUnit] = useState<'GH' | 'TH' | 'EH'>('TH');
  const [powerWatts, setPowerWatts] = useState<number>(defaultPowerConsumption);
  const [electricityCost, setElectricityCost] = useState<number>(defaultCostPerKWh);
  const [poolFeePercent, setPoolFeePercent] = useState<number>(1.0);
  
  // Market price watch
  const marketData = useMarketWatch(['btcusdt', 'ltcusdt']);
  const coinConfig = COIN_CONFIGS[selectedCoin];
  const liveCoinPrice = marketData[coinConfig.priceKey]?.price || coinConfig.fallbackPrice;
  const liveBtcPrice = marketData['btcusdt']?.price || 96500;
  
  // Network stats state
  const [networkDifficulty, setNetworkDifficulty] = useState<number>(84.2);
  const [blockReward, setBlockReward] = useState<number>(3.125);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      console.warn('Using standard difficulty baseline.');
    } finally {
      setTimeout(() => setIsRefreshing(false), 400);
    }
  };

  useEffect(() => {
    fetchNetworkData();
  }, []);

  // --- Budget Calculations ---
  const durationOption = DURATION_PRESETS.find(d => d.days === selectedDuration) || DURATION_PRESETS[1];
  const effectiveDailyRoiPercent = (coinConfig.dailyBaseRoi * durationOption.multiplier) * (reinvestGains ? 1.08 : 1.0);
  
  // Daily / Monthly / Total Dollar returns
  const dailyProfitUsd = (budget * (effectiveDailyRoiPercent / 100));
  const monthlyProfitUsd = dailyProfitUsd * 30.5;
  const totalContractReturnUsd = dailyProfitUsd * selectedDuration;
  const netTotalGainUsd = totalContractReturnUsd; // Profit on top of operations
  const netRoiPercent = (effectiveDailyRoiPercent * selectedDuration);
  const paybackPeriodDays = effectiveDailyRoiPercent > 0 ? Math.ceil(100 / effectiveDailyRoiPercent) : 0;
  
  // Estimated Hashpower allocated
  const estimatedHashpower = (budget / coinConfig.hashCostPerUnit).toFixed(1);
  // Crypto units mined
  const dailyCryptoUnits = liveCoinPrice > 0 ? (dailyProfitUsd / liveCoinPrice) : 0;
  const monthlyCryptoUnits = liveCoinPrice > 0 ? (monthlyProfitUsd / liveCoinPrice) : 0;
  const totalCryptoUnits = liveCoinPrice > 0 ? (totalContractReturnUsd / liveCoinPrice) : 0;

  // --- Hardware Mode Calculations ---
  const effectiveHashrateInH = (() => {
    switch (hashUnit) {
      case 'GH': return hashpower * 1e9;
      case 'TH': return hashpower * 1e12;
      case 'EH': return hashpower * 1e18;
      default: return hashpower * 1e12;
    }
  })();

  const difficultyInAbsolute = networkDifficulty * 1e12;
  const twoPower32 = 4294967296;

  const hardwareDailyMinedCoin = difficultyInAbsolute > 0 
    ? (effectiveHashrateInH * 86400 * blockReward) / (difficultyInAbsolute * twoPower32)
    : 0;

  const hardwareGrossDailyRev = hardwareDailyMinedCoin * liveBtcPrice * (1 - poolFeePercent / 100);
  const hardwareGrossMonthlyRev = hardwareGrossDailyRev * 30.5;

  const hardwareDailyPowerCost = ((powerWatts * 24) / 1000) * electricityCost;
  const hardwareMonthlyPowerCost = hardwareDailyPowerCost * 30.5;

  const hardwareNetDailyProfit = hardwareGrossDailyRev - hardwareDailyPowerCost;
  const hardwareNetMonthlyProfit = hardwareGrossMonthlyRev - hardwareMonthlyPowerCost;
  const hardwareNetYearlyProfit = hardwareNetDailyProfit * 365;

  const hashrateInTH = effectiveHashrateInH / 1e12;
  const efficiencyJPerTH = hashrateInTH > 0 ? (powerWatts / hashrateInTH).toFixed(1) : '0';

  return (
    <motion.section 
      id="mining-calculator-widget"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={fluidSpring}
      aria-label="Interactive Mining & Cloud ROI Calculator"
      className={`bg-card/95 dark:bg-card/70 backdrop-blur-xl border border-border/80 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden ${className}`}
    >
      {/* Glow backgrounds */}
      <div className="absolute -top-32 -right-32 w-80 h-80 bg-[#0052ff]/10 dark:bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Widget Header & Mode Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 pb-6 border-b border-border/60">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0052ff] to-[#00f0ff] flex items-center justify-center text-white shadow-lg shadow-[#0052ff]/20">
              <Calculator size={20} strokeWidth={2.4} />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl md:text-2xl font-black text-primary tracking-tight">
                  Mining ROI Calculator
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Model
                </span>
              </div>
              <p className="text-xs text-secondary mt-0.5">
                Calculate daily and monthly cloud mining profits, ROI yield, and break-even timelines.
              </p>
            </div>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex items-center gap-2">
          <div className="flex bg-surface/80 p-1 rounded-xl border border-border/80 backdrop-blur-sm">
            <button
              id="calc-mode-budget-tab"
              onClick={() => setCalcMode('budget')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'budget'
                  ? 'bg-gradient-to-r from-[#0052ff] to-[#00f0ff] text-white shadow-md'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <DollarSign size={13} />
              Budget & Cloud ROI
            </button>
            <button
              id="calc-mode-hashrate-tab"
              onClick={() => setCalcMode('hashrate')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                calcMode === 'hashrate'
                  ? 'bg-gradient-to-r from-[#0052ff] to-[#00f0ff] text-white shadow-md'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <Cpu size={13} />
              Hardware / TH/s
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-border/60 text-xs">
            <TrendingUp size={13} className="text-[#00f0ff]" />
            <span className="text-secondary font-medium">BTC:</span>
            <span className="font-bold font-mono text-primary">
              ${liveBtcPrice.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {calcMode === 'budget' ? (
          /* ================= BUDGET & CLOUD ROI MODE ================= */
          <motion.div
            key="budget-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={fluidSpring}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6"
          >
            {/* Left Column: Budget Controls */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* 1. Investment Budget Input & Presets */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="calculator-budget-input" className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <DollarSign size={14} className="text-emerald-400" /> Your Mining Budget (USD)
                  </label>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    Allocates ≈ {estimatedHashpower} {coinConfig.unit}
                  </span>
                </div>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold font-mono text-secondary">
                    $
                  </span>
                  <input
                    id="calculator-budget-input"
                    type="number"
                    min="25"
                    max="100000"
                    step="25"
                    value={budget}
                    onChange={(e) => setBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full bg-surface border-2 border-border focus:border-[#0052ff] rounded-2xl pl-9 pr-4 py-3.5 text-2xl font-black font-mono text-primary focus:outline-none focus:ring-4 focus:ring-[#0052ff]/20 transition-all shadow-inner"
                    placeholder="1000"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-xs font-bold uppercase px-2.5 py-1 bg-card rounded-lg border border-border text-secondary">
                      USD
                    </span>
                  </div>
                </div>

                {/* Range Slider for rapid budget adjustment */}
                <div className="mt-3">
                  <input
                    id="calculator-budget-slider"
                    type="range"
                    min="50"
                    max="10000"
                    step="50"
                    value={budget > 10000 ? 10000 : budget}
                    onChange={(e) => setBudget(parseFloat(e.target.value))}
                    className="w-full accent-[#00f0ff] h-2 bg-surface rounded-lg cursor-pointer transition-all"
                  />
                  <div className="flex justify-between text-[10px] text-muted font-mono mt-1">
                    <span>$50</span>
                    <span>$2,500</span>
                    <span>$5,000</span>
                    <span>$10,000+</span>
                  </div>
                </div>

                {/* Quick Budget Preset Buttons */}
                <div className="flex flex-wrap gap-2 mt-3">
                  {BUDGET_PRESETS.map((preset) => (
                    <button
                      key={preset}
                      id={`budget-preset-${preset}`}
                      onClick={() => setBudget(preset)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                        budget === preset
                          ? 'bg-primary text-background shadow-md scale-105'
                          : 'bg-surface border border-border/80 hover:border-primary/50 text-secondary hover:text-primary'
                      }`}
                    >
                      ${preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Coin Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2.5">
                  <Coins size={14} className="text-[#00f0ff]" /> Select Mining Pool Asset
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {(Object.keys(COIN_CONFIGS) as Array<keyof typeof COIN_CONFIGS>).map((key) => {
                    const c = COIN_CONFIGS[key];
                    const isSelected = selectedCoin === key;
                    return (
                      <button
                        key={key}
                        id={`select-coin-${key}`}
                        onClick={() => setSelectedCoin(key)}
                        className={`p-3 rounded-2xl border text-left transition-all relative overflow-hidden ${
                          isSelected
                            ? 'bg-surface border-[#0052ff] dark:border-[#00f0ff] shadow-md ring-2 ring-[#0052ff]/20'
                            : 'bg-surface/50 border-border/60 hover:border-border hover:bg-surface'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-black font-mono ${c.iconColor}`}>
                            {c.symbol}
                          </span>
                          {isSelected && <Check size={12} className="text-[#00f0ff]" />}
                        </div>
                        <p className="text-xs font-bold text-primary truncate">{c.name}</p>
                        <p className="text-[10px] text-secondary font-mono mt-0.5">{c.algo}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Contract Duration / Period */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5 mb-2.5">
                  <Calendar size={14} className="text-purple-400" /> Contract Duration & Multiplier
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {DURATION_PRESETS.map((duration) => {
                    const isSelected = selectedDuration === duration.days;
                    return (
                      <button
                        key={duration.days}
                        id={`select-duration-${duration.days}`}
                        onClick={() => setSelectedDuration(duration.days)}
                        className={`p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-surface border-purple-500 shadow-md ring-2 ring-purple-500/20'
                            : 'bg-surface/50 border-border/60 hover:border-border hover:bg-surface'
                        }`}
                      >
                        <span className="text-xs font-black text-primary block">{duration.label}</span>
                        <span className="text-[10px] font-bold text-purple-400 font-mono mt-0.5 block">
                          {duration.badge}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Auto-Compound / Reinvest Switch */}
              <div className="p-4 rounded-2xl bg-surface border border-border/70 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-primary">Auto-Reinvest Daily Yield</h4>
                    <p className="text-[11px] text-secondary">Compounds daily rewards into active hashpower (+8% compound boost).</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    id="calculator-reinvest-toggle"
                    type="checkbox"
                    checked={reinvestGains}
                    onChange={(e) => setReinvestGains(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-border peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>

            {/* Right Column: Dynamic Projected Output Card */}
            <div className="lg:col-span-5 flex flex-col justify-between bg-gradient-to-br from-surface via-surface/90 to-surface/60 border-2 border-border/90 rounded-3xl p-6 relative overflow-hidden shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
                    <TrendingUp size={14} className="text-[#00f0ff]" /> Projected Returns
                  </span>
                  <span className="text-xs font-mono font-bold text-[#00f0ff] bg-[#00f0ff]/10 px-2.5 py-0.5 rounded-full border border-[#00f0ff]/20">
                    {effectiveDailyRoiPercent.toFixed(2)}% Daily ROI
                  </span>
                </div>

                {/* Hero Projected Monthly Output */}
                <div className="mt-4 mb-5 p-4 rounded-2xl bg-card/80 border border-border/80 shadow-sm">
                  <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Estimated Monthly Earnings
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-black font-mono tracking-tight text-emerald-400">
                      +${monthlyProfitUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-secondary uppercase">/ Mo</span>
                  </div>
                  <p className="text-xs text-secondary mt-1 font-mono">
                    ≈ {monthlyCryptoUnits.toFixed(5)} {selectedCoin} per month
                  </p>
                </div>

                {/* Granular Table of Projected Milestones */}
                <div className="space-y-3 pt-2 text-xs">
                  {/* Daily Output */}
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-secondary flex items-center gap-1.5 font-medium">
                      <Clock size={13} className="text-[#0052ff]" /> Daily Payout
                    </span>
                    <div className="text-right font-mono">
                      <span className="font-bold text-primary">+${dailyProfitUsd.toFixed(2)}/day</span>
                      <span className="text-[10px] text-secondary block font-mono">≈ {dailyCryptoUnits.toFixed(6)} {selectedCoin}</span>
                    </div>
                  </div>

                  {/* Total Contract Maturity Yield */}
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-secondary flex items-center gap-1.5 font-medium">
                      <Layers size={13} className="text-purple-400" /> {selectedDuration}-Day Total Return
                    </span>
                    <div className="text-right font-mono">
                      <span className="font-bold text-emerald-400">
                        +${totalContractReturnUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-emerald-500 font-bold block">
                        (+{netRoiPercent.toFixed(1)}% Net ROI)
                      </span>
                    </div>
                  </div>

                  {/* Estimated Hashpower */}
                  <div className="flex justify-between items-center py-1.5 border-b border-border/40">
                    <span className="text-secondary flex items-center gap-1.5 font-medium">
                      <Cpu size={13} className="text-amber-500" /> Hashpower Power
                    </span>
                    <span className="font-bold font-mono text-primary">
                      {estimatedHashpower} {coinConfig.unit}
                    </span>
                  </div>

                  {/* Break-even / Payback Period */}
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-secondary flex items-center gap-1.5 font-medium">
                      <ShieldCheck size={13} className="text-emerald-400" /> Est. Break-even
                    </span>
                    <span className="font-bold font-mono text-emerald-400">
                      ≈ {paybackPeriodDays} Days
                    </span>
                  </div>
                </div>

                {/* Visual Return Progress Bar */}
                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className="flex justify-between text-[11px] font-mono mb-1.5">
                    <span className="text-secondary">Initial: <strong className="text-primary">${budget}</strong></span>
                    <span className="text-emerald-400 font-bold">Total: ${(budget + totalContractReturnUsd).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                  </div>
                  <div className="w-full h-2.5 bg-surface rounded-full overflow-hidden flex border border-border">
                    <div className="h-full bg-primary/40" style={{ width: `${Math.min(100, (budget / (budget + totalContractReturnUsd)) * 100)}%` }} />
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-[#00f0ff]" style={{ width: `${Math.min(100, (totalContractReturnUsd / (budget + totalContractReturnUsd)) * 100)}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted mt-1 font-mono">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary/40" /> Principal</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Net Yield (+{netRoiPercent.toFixed(0)}%)</span>
                  </div>
                </div>
              </div>

              {/* Action Button: Buy Hashpower with this calculated budget */}
              <div className="mt-6 pt-4 border-t border-border/60">
                <button
                  id="calc-buy-hashpower-btn"
                  onClick={() => navigate('/buy-hashpower')}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#0052ff] to-[#00f0ff] hover:from-[#0045d8] hover:to-[#00d6e6] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#0052ff]/25 hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
                >
                  <span>Start Mining with ${budget.toLocaleString()}</span>
                  <ArrowRight size={16} />
                </button>
                <p className="text-[10px] text-center text-muted mt-2">
                  Zero hardware maintenance fees • Automated daily payouts directly to wallet
                </p>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ================= HARDWARE & HASHRATE MODE ================= */
          <motion.div
            key="hashrate-mode"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={fluidSpring}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6"
          >
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
                        id={`hash-unit-${unit}`}
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
                      id={`hash-preset-${preset}`}
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
                  id="input-pool-fee"
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

                <div className="mt-2 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-black font-mono tracking-tight ${hardwareNetMonthlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      {hardwareNetMonthlyProfit >= 0 ? '+' : '-'}${Math.abs(hardwareNetMonthlyProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs font-bold text-secondary uppercase">/ Month</span>
                  </div>
                  <p className="text-xs text-secondary mt-1">
                    Yield after deducting ${(hardwareMonthlyPowerCost).toFixed(2)} in electricity expenses.
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border/70 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary flex items-center gap-1.5">
                      <Clock size={14} /> Daily Gross Output
                    </span>
                    <div className="text-right">
                      <span className="font-mono font-bold text-primary">
                        ${hardwareGrossDailyRev.toFixed(2)}
                      </span>
                      <div className="text-[10px] font-mono text-secondary">
                        ≈ {hardwareDailyMinedCoin.toFixed(6)} BTC
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-secondary flex items-center gap-1.5">
                      <Flame size={14} className="text-amber-500" /> Daily Power Cost
                    </span>
                    <span className="font-mono font-semibold text-rose-400">
                      -${hardwareDailyPowerCost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center font-semibold">
                    <span className="text-secondary">Daily Net Profit</span>
                    <span className={`font-mono ${hardwareNetDailyProfit >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400'}`}>
                      {hardwareNetDailyProfit >= 0 ? '+' : '-'}${Math.abs(hardwareNetDailyProfit).toFixed(2)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/40">
                    <span className="text-secondary font-medium">Annualized Projected</span>
                    <span className={`font-mono font-black ${hardwareNetYearlyProfit >= 0 ? 'text-emerald-400' : 'text-rose-500'}`}>
                      ${hardwareNetYearlyProfit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}/yr
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 p-3 rounded-xl bg-card border border-border/60 flex items-start gap-2 text-[11px] text-secondary">
                <Info size={14} className="text-[#0052ff] shrink-0 mt-0.5" />
                <p>
                  Calculations incorporate live difficulty and standard 3.125 BTC block reward. Cloud & Pool hosting packages on our platform include zero maintenance charges.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}

