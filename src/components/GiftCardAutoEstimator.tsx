import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Calculator, 
  Sparkles, 
  TrendingUp, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Layers, 
  Coins,
  DollarSign
} from 'lucide-react';
import { GIFT_CARD_BRANDS, GiftCardBrand, CURRENCY_RATES_TO_USD } from '../data/giftCards';
import { useMarketWatch } from '../hooks/useMarketWatch';
import { fluidSpring } from './SystemManager';

interface GiftCardAutoEstimatorProps {
  selectedBrand?: GiftCardBrand;
  onSelectBrand?: (brand: GiftCardBrand) => void;
  initialAmount?: number;
  initialCurrency?: string;
  onApplyEstimate?: (amount: number, currency: string, brand: GiftCardBrand) => void;
  className?: string;
}

export default function GiftCardAutoEstimator({
  selectedBrand: propBrand,
  onSelectBrand,
  initialAmount = 100,
  initialCurrency = 'USD',
  onApplyEstimate,
  className = ''
}: GiftCardAutoEstimatorProps) {
  const [activeBrand, setActiveBrand] = useState<GiftCardBrand>(propBrand || GIFT_CARD_BRANDS[0]);
  const [faceAmount, setFaceAmount] = useState<string>(initialAmount.toString());
  const [currency, setCurrency] = useState<string>(initialCurrency);
  const [cryptoMode, setCryptoMode] = useState<'USD' | 'USDT' | 'BTC' | 'ETH'>('USD');
  
  const { marketData } = useMarketWatch();

  // Keep internal brand state in sync if prop changes
  const effectiveBrand = propBrand || activeBrand;

  const btcPrice = marketData?.BTC?.price || 67850;
  const ethPrice = marketData?.ETH?.price || 3540;
  const solPrice = marketData?.SOL?.price || 155;

  const parsedAmount = Math.max(0, parseFloat(faceAmount) || 0);
  const currencyRate = CURRENCY_RATES_TO_USD[currency] || 1.0;
  
  // Face value converted to USD base
  const faceValueUsd = parsedAmount * currencyRate;
  
  // Net credited USD value after brand payout rate (e.g. 95% = 0.95)
  const netCreditedUsd = faceValueUsd * effectiveBrand.payoutRate;
  
  // Crypto conversions
  const estimatedBtc = netCreditedUsd > 0 ? (netCreditedUsd / btcPrice) : 0;
  const estimatedEth = netCreditedUsd > 0 ? (netCreditedUsd / ethPrice) : 0;
  const estimatedUsdt = netCreditedUsd;
  
  // Cloud Hashpower projection (Approx 50 TH/s per $100 USD credit)
  const hashrateThs = Math.round((netCreditedUsd / 100) * (effectiveBrand.bonusHashratePer100Usd || 50));
  
  // Estimated daily mining return (~$2.80 daily per $100 plan)
  const estimatedDailyYieldUsd = (netCreditedUsd * 0.028);

  const handleBrandChange = (brand: GiftCardBrand) => {
    setActiveBrand(brand);
    if (onSelectBrand) {
      onSelectBrand(brand);
    }
    // If currency not supported, fallback to first supported
    if (!brand.supportedCurrencies.includes(currency)) {
      setCurrency(brand.supportedCurrencies[0] || 'USD');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-surface border border-border/70 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Background Neon Halo */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-[#0052ff]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border/50 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 text-amber-400 border border-amber-500/30">
            <Calculator size={20} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-primary flex items-center gap-2">
              <span>Gift Card Balance Auto-Estimator</span>
              <span className="text-[10px] font-black uppercase text-amber-400 bg-amber-400/15 px-2 py-0.5 rounded-full border border-amber-400/30">
                Live Rates
              </span>
            </h3>
            <p className="text-xs text-secondary">
              Real-time USD & crypto conversion based on institutional spot rates
            </p>
          </div>
        </div>

        {/* Currency Payout Mode Tabs */}
        <div className="flex items-center p-1 bg-background border border-border/70 rounded-2xl shrink-0">
          {(['USD', 'USDT', 'BTC', 'ETH'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setCryptoMode(mode)}
              className={`px-3 py-1 rounded-xl text-xs font-black transition-all ${
                cryptoMode === mode
                  ? 'bg-[#0052ff] text-white shadow-md'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calculator Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5 relative z-10">
        
        {/* Left: Input Parameters */}
        <div className="lg:col-span-6 space-y-4">
          {/* Brand Quick Carousel / Selector */}
          <div>
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-2">
              Select Card Brand & Market Tier
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1 custom-scrollbar">
              {GIFT_CARD_BRANDS.slice(0, 12).map((brand) => {
                const isSelected = effectiveBrand.id === brand.id;
                return (
                  <button
                    type="button"
                    key={brand.id}
                    onClick={() => handleBrandChange(brand)}
                    className={`p-2 rounded-xl text-left border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-[#0052ff]/15 border-[#0052ff] text-primary shadow-sm'
                        : 'bg-background border-border/50 text-secondary hover:border-border hover:text-primary'
                    }`}
                  >
                    <span className="text-[11px] font-bold truncate block">{brand.name.split(' ')[0]}</span>
                    <span className="text-[10px] font-black text-emerald-400 mt-0.5">
                      {(brand.payoutRate * 100).toFixed(0)}% Rate
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount & Currency Input */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-1">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Currency
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-xs font-bold text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              >
                {effectiveBrand.supportedCurrencies.map((cur) => (
                  <option key={cur} value={cur}>
                    {cur} ({cur === 'USD' ? '$' : cur === 'EUR' ? '€' : cur === 'GBP' ? '£' : '$'})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider mb-1">
                Card Face Value
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary font-bold text-sm">
                  {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}
                </span>
                <input
                  type="number"
                  step="any"
                  min="10"
                  value={faceAmount}
                  onChange={(e) => setFaceAmount(e.target.value)}
                  placeholder="100.00"
                  className="w-full bg-background border border-border rounded-xl pl-8 pr-4 py-2.5 text-sm font-black text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
              </div>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-1.5">
            {effectiveBrand.popularAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setFaceAmount(amt.toString())}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                  faceAmount === amt.toString()
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-extrabold shadow-sm'
                    : 'bg-background border border-border/60 text-secondary hover:text-primary'
                }`}
              >
                {currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : '$'}{amt}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Real-time Live Payout Breakdown Card */}
        <div className="lg:col-span-6 bg-background border border-border/70 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-4">
          {/* Card Top Pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${effectiveBrand.badgeBg}`}>
                {effectiveBrand.name}
              </span>
              <span className="text-xs text-secondary font-medium">
                P/O Rate: <strong className="text-emerald-400">{(effectiveBrand.payoutRate * 100).toFixed(0)}%</strong>
              </span>
            </div>
            <span className="flex items-center gap-1 text-[10px] font-bold text-muted">
              <Clock size={12} className="text-[#0052ff]" />
              <span>~{effectiveBrand.turnaroundMins} mins audit</span>
            </span>
          </div>

          {/* Main Display: Net Credited Value */}
          <div className="p-4 bg-surface rounded-2xl border border-border/50 text-center space-y-1">
            <span className="text-[10px] uppercase font-bold text-secondary tracking-widest block">
              Estimated Credited Payout
            </span>

            {cryptoMode === 'USD' && (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
                  ${netCreditedUsd.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-secondary">USD</span>
              </div>
            )}

            {cryptoMode === 'USDT' && (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-[#00f0ff] font-mono">
                  {estimatedUsdt.toFixed(2)}
                </span>
                <span className="text-xs font-bold text-secondary">USDT (TRC20/ERC20)</span>
              </div>
            )}

            {cryptoMode === 'BTC' && (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                  {estimatedBtc.toFixed(6)}
                </span>
                <span className="text-xs font-bold text-secondary">BTC</span>
              </div>
            )}

            {cryptoMode === 'ETH' && (
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">
                  {estimatedEth.toFixed(4)}
                </span>
                <span className="text-xs font-bold text-secondary">ETH</span>
              </div>
            )}

            <p className="text-[11px] text-muted">
              Face Value: {currency} {parsedAmount.toFixed(2)} • Net Yield Ratio: {(effectiveBrand.payoutRate * 100).toFixed(1)}%
            </p>
          </div>

          {/* Mining Equivalent Benefits */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="p-2.5 bg-surface/60 border border-white/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                <Zap size={11} className="text-amber-400" /> Cloud Hashrate
              </span>
              <p className="text-xs sm:text-sm font-black text-primary font-mono mt-0.5">
                +{hashrateThs} TH/s Power
              </p>
            </div>

            <div className="p-2.5 bg-surface/60 border border-white/5 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-secondary flex items-center gap-1">
                <TrendingUp size={11} className="text-emerald-400" /> Daily Cloud Yield
              </span>
              <p className="text-xs sm:text-sm font-black text-emerald-400 font-mono mt-0.5">
                +${estimatedDailyYieldUsd.toFixed(2)} / day
              </p>
            </div>
          </div>

          {/* Action Trigger Button */}
          {onApplyEstimate && (
            <button
              type="button"
              onClick={() => onApplyEstimate(parsedAmount, currency, effectiveBrand)}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
            >
              <span>Deposit This Amount Now</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Trust Badges Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-5 border-t border-border/50 text-[11px] text-muted">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} className="text-emerald-400" />
          <span>Automated OCR Verification • 100% Escrow Protection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles size={14} className="text-[#0052ff]" />
          <span>0% Platform Exchange Fees</span>
        </div>
      </div>
    </motion.div>
  );
}
