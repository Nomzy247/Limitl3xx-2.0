import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BatteryWarning, ZapOff, PlugZap, X, ShieldAlert, Sparkles, Leaf } from 'lucide-react';
import { useBattery } from '../hooks/useBattery';
import { usePowerSave } from '../context/PowerSaveContext';
import { fluidSpring } from './SystemManager';

interface LowPowerMiningBannerProps {
  hasActiveMining: boolean;
  activeMiningCount?: number;
  className?: string;
}

export default function LowPowerMiningBanner({
  hasActiveMining,
  activeMiningCount = 1,
  className = ''
}: LowPowerMiningBannerProps) {
  const battery = useBattery();
  const { powerSaveMode, isEffectivePowerSaving, togglePowerSaveMode } = usePowerSave();
  const [isDismissed, setIsDismissed] = useState(false);
  const [showPowerSaverTips, setShowPowerSaverTips] = useState(false);

  // Trigger conditions:
  // 1. Browser supports Battery API
  // 2. Battery level is strictly < 20% (0.20)
  // 3. Device is discharging (not plugged in to power)
  // 4. User has active mining operations running
  // 5. User hasn't dismissed the banner in this session
  const isLowBattery = battery.isSupported && battery.level < 0.20 && !battery.charging;
  const shouldDisplay = isLowBattery && hasActiveMining && !isDismissed;

  if (!shouldDisplay) {
    return null;
  }

  const batteryPercent = Math.round(battery.level * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={fluidSpring}
        className={`w-full relative overflow-hidden rounded-2xl bg-amber-500/10 border border-amber-500/30 p-4 md:p-5 shadow-lg backdrop-blur-md ${className}`}
      >
        {/* Glow ambient accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5 sm:mt-0">
              <BatteryWarning className="w-5 h-5 animate-pulse" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Low Power Mode • {batteryPercent}%
                </span>
                <span className="text-xs text-amber-200/80 flex items-center gap-1">
                  <ZapOff size={13} className="text-amber-400" />
                  {activeMiningCount} Active Hashrate Operation{activeMiningCount > 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-sm font-semibold text-primary mt-1">
                Battery is below 20% during cloud hash monitoring
              </p>
              <p className="text-xs text-secondary mt-0.5 leading-relaxed max-w-2xl">
                Your device battery is low. Since cloud mining operates server-side on remote data centers, you can safely close this browser or connect a charger without losing hashrate or yield.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 flex-wrap sm:flex-nowrap">
            <button
              onClick={togglePowerSaveMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                powerSaveMode 
                  ? 'bg-emerald-500/20 hover:bg-emerald-500/30 border-emerald-500/40 text-emerald-300' 
                  : 'bg-surface/80 hover:bg-surface border-border/80 text-secondary'
              }`}
            >
              <Leaf size={14} className={powerSaveMode ? 'text-emerald-400' : 'text-secondary'} />
              {powerSaveMode ? 'Power Saver On' : 'Turn On Power Saver'}
            </button>

            <button
              onClick={() => setShowPowerSaverTips(!showPowerSaverTips)}
              className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <PlugZap size={14} />
              {showPowerSaverTips ? 'Hide Tips' : 'Recommendations'}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              aria-label="Dismiss low battery alert"
              className="p-1.5 rounded-lg text-secondary hover:text-primary hover:bg-amber-500/20 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Expandable Power Optimization Recommendations */}
        <AnimatePresence>
          {showPowerSaverTips && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={fluidSpring}
              className="mt-4 pt-3 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs"
            >
              <div className="bg-card/60 p-3 rounded-xl border border-border/40">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <ShieldAlert size={14} /> Uninterrupted Hashrate
                </div>
                <p className="text-secondary leading-normal">
                  All mining algorithms run in Tier-3 data centers. Your daily yield accumulates automatically even if your phone powers off.
                </p>
              </div>

              <div className="bg-card/60 p-3 rounded-xl border border-border/40">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <PlugZap size={14} /> Plug In Charger
                </div>
                <p className="text-secondary leading-normal">
                  Connect your charger to maintain real-time telemetry streaming, live charting, and order book animations.
                </p>
              </div>

              <div className="bg-card/60 p-3 rounded-xl border border-border/40">
                <div className="flex items-center gap-1.5 font-bold text-amber-400 mb-1">
                  <Sparkles size={14} /> Battery Health
                </div>
                <p className="text-secondary leading-normal">
                  Lower screen brightness or minimize the browser tab to conserve battery cycles while your contracts work in the background.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
