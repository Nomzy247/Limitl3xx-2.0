import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryLow, 
  BatteryMedium, 
  BatteryWarning, 
  Zap, 
  Leaf, 
  Sparkles,
  SlidersHorizontal,
  X,
  ChevronRight
} from 'lucide-react';
import { useBattery } from '../hooks/useBattery';
import { usePowerSave } from '../context/PowerSaveContext';
import { fluidSpring } from './SystemManager';
import SmartBatteryEnergyHub from './SmartBatteryEnergyHub';
import { trackClientActivity } from '../services/activityTracker';

export default function FloatingBatteryIndicator() {
  const battery = useBattery();
  const { 
    batteryViewMode, 
    toggleBatteryViewMode, 
    showFloatingBattery, 
    toggleFloatingBattery,
    chargingPulseEffect,
    isEffectivePowerSaving 
  } = usePowerSave();

  const [isHovered, setIsHovered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!showFloatingBattery) return null;

  const percentage = Math.round(battery.level * 100);
  const isCritical = percentage <= 10 && !battery.charging;
  const isLow = percentage <= 20 && !battery.charging;
  const isMedium = percentage > 20 && percentage <= 50;

  // Icon Selection
  const renderIcon = (size = 16) => {
    if (battery.charging) {
      return (
        <BatteryCharging 
          size={size} 
          className="text-[#00f0ff] shrink-0" 
        />
      );
    }
    if (isCritical) {
      return <BatteryWarning size={size} className="text-rose-400 animate-bounce shrink-0" />;
    }
    if (isLow) {
      return <BatteryLow size={size} className="text-amber-400 shrink-0" />;
    }
    if (isMedium) {
      return <BatteryMedium size={size} className="text-cyan-300 shrink-0" />;
    }
    return <Battery size={size} className="text-emerald-400 shrink-0" />;
  };

  // Status Styling
  let borderClass = 'border-emerald-500/30 shadow-emerald-500/10';
  let textClass = 'text-emerald-400';
  let bgClass = 'bg-surface/90';

  if (battery.charging) {
    borderClass = 'border-[#00f0ff]/50 shadow-[0_0_20px_rgba(0,240,255,0.35)]';
    textClass = 'text-[#00f0ff]';
    bgClass = 'bg-surface-dark/95';
  } else if (isCritical) {
    borderClass = 'border-rose-500/50 shadow-rose-500/20';
    textClass = 'text-rose-400';
  } else if (isLow) {
    borderClass = 'border-amber-500/40 shadow-amber-500/15';
    textClass = 'text-amber-400';
  }

  return (
    <>
      <div 
        id="floating-battery-indicator"
        className="fixed bottom-20 md:bottom-6 left-4 md:left-6 z-40 select-none print:hidden pointer-events-auto"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: 0,
            ...(battery.charging && chargingPulseEffect
              ? {
                  boxShadow: [
                    '0 0 15px rgba(0,240,255,0.25)',
                    '0 0 28px rgba(0,240,255,0.6)',
                    '0 0 15px rgba(0,240,255,0.25)'
                  ]
                }
              : {})
          }}
          transition={
            battery.charging && chargingPulseEffect
              ? {
                  boxShadow: {
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut'
                  }
                }
              : fluidSpring
          }
          className={`group backdrop-blur-xl border ${borderClass} ${bgClass} rounded-2xl p-1.5 shadow-2xl flex items-center gap-2 transition-colors duration-300`}
        >
          {/* Main Clickable HUD Capsule */}
          <button
            onClick={() => {
              setIsModalOpen(true);
              trackClientActivity({
                action: `Clicked Floating Battery Indicator (${percentage}%, ${battery.charging ? 'Charging' : 'Discharging'})`,
                category: 'click'
              });
            }}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 active:scale-95 transition-all text-left"
            title="Click to view detailed battery diagnostics & zero-drain cloud metrics"
          >
            {/* Battery Icon with Charging Halo */}
            <div className="relative flex items-center justify-center">
              {renderIcon(18)}
              {battery.charging && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
              )}
            </div>

            {/* View Mode 1: Minimalist View */}
            {batteryViewMode === 'minimalist' ? (
              <div className="flex items-center gap-2 font-mono">
                <span className={`text-xs font-black tracking-tight ${textClass}`}>
                  {percentage}%
                </span>
                {battery.charging && (
                  <span className="flex items-center gap-0.5 text-[9px] font-black uppercase text-[#00f0ff] bg-[#00f0ff]/15 px-1.5 py-0.5 rounded-md border border-[#00f0ff]/30 animate-pulse">
                    <Zap size={9} className="fill-[#00f0ff]" /> AC
                  </span>
                )}
              </div>
            ) : (
              /* View Mode 2: Detailed View */
              <div className="flex items-center gap-2.5">
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5 font-mono">
                    <span className={`text-xs font-black tracking-tight ${textClass}`}>
                      {percentage}%
                    </span>
                    {battery.charging ? (
                      <span className="text-[9px] font-extrabold uppercase text-[#00f0ff] bg-[#00f0ff]/15 px-1.5 py-0.5 rounded-md border border-[#00f0ff]/30 flex items-center gap-0.5">
                        <Zap size={9} className="fill-[#00f0ff]" /> AC Fast Charge
                      </span>
                    ) : isEffectivePowerSaving ? (
                      <span className="text-[9px] font-extrabold uppercase text-emerald-400 bg-emerald-500/15 px-1.5 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-0.5">
                        <Leaf size={9} /> ECO Saver
                      </span>
                    ) : (
                      <span className="text-[9px] font-bold text-muted uppercase">
                        Battery
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-secondary mt-0.5">
                    <span>{battery.voltageV || 4.18}V</span>
                    <span>•</span>
                    <span className="text-emerald-400 font-bold">0.0W Cloud Load</span>
                  </div>
                </div>

                <div className="hidden sm:flex items-center text-muted group-hover:text-primary transition-colors">
                  <ChevronRight size={14} />
                </div>
              </div>
            )}
          </button>

          {/* Quick Hover Controls (Toggle Minimalist/Detailed & Hide) */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, width: 0, scale: 0.8 }}
                animate={{ opacity: 1, width: 'auto', scale: 1 }}
                exit={{ opacity: 0, width: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1 border-l border-border/50 pl-1.5 pr-1"
              >
                <button
                  onClick={toggleBatteryViewMode}
                  title={`Switch to ${batteryViewMode === 'minimalist' ? 'Detailed' : 'Minimalist'} View`}
                  className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-white/10 transition-colors"
                >
                  <SlidersHorizontal size={13} />
                </button>
                <button
                  onClick={toggleFloatingBattery}
                  title="Hide Floating Indicator (re-enable in Settings)"
                  className="p-1.5 rounded-lg text-muted hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <X size={13} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Interactive Modal triggered by clicking floating battery */}
      <SmartBatteryEnergyHub 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="compact"
        className="hidden"
      />
    </>
  );
}
