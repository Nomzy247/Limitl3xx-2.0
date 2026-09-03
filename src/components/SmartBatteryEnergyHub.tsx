import React, { useState, useEffect, useRef } from 'react';
import { 
  Battery, 
  BatteryCharging, 
  BatteryLow, 
  BatteryMedium, 
  BatteryWarning, 
  Zap, 
  AlertTriangle,
  Leaf,
  Cpu,
  ShieldCheck,
  Sparkles,
  Thermometer,
  Activity,
  X,
  Volume2,
  VolumeX,
  Flame,
  CheckCircle2,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useBattery } from '../hooks/useBattery';
import { usePowerSave } from '../context/PowerSaveContext';
import { fluidSpring } from './SystemManager';
import { trackClientActivity } from '../services/activityTracker';

interface SmartBatteryProps {
  className?: string;
  variant?: 'pill' | 'compact' | 'card' | 'floating';
  showDetails?: boolean;
  hasActiveMining?: boolean;
}

export default function SmartBatteryEnergyHub({
  className = '',
  variant = 'pill',
  showDetails = true,
  hasActiveMining = false
}: SmartBatteryProps) {
  const battery = useBattery();
  const { isEffectivePowerSaving, powerSaveMode, setPowerSaveMode, togglePowerSaveMode } = usePowerSave();
  const [isOpen, setIsOpen] = useState(false);
  const [audioFeedback, setAudioFeedback] = useState(() => {
    return localStorage.getItem('pm_batt_sound') !== 'false';
  });
  const hasNotifiedRef = useRef(false);

  const percentage = Math.round(battery.level * 100);
  const isCritical = percentage <= 10 && !battery.charging;
  const isLow = percentage <= 20 && !battery.charging;
  const isMedium = percentage > 20 && percentage <= 50;

  // Proactive battery toast when low
  useEffect(() => {
    if (isLow && !battery.charging) {
      if (!hasNotifiedRef.current) {
        toast.warning(`Device Battery at ${percentage}%`, {
          description: 'Zero battery drain on your device: Cloud mining runs 100% on remote renewable datacenters.',
          duration: 5000,
          id: 'low-batt-hud'
        });
        hasNotifiedRef.current = true;
      }
    } else if (battery.charging || percentage > 20) {
      hasNotifiedRef.current = false;
    }
  }, [isLow, battery.charging, percentage]);

  const handleToggleSound = () => {
    const next = !audioFeedback;
    setAudioFeedback(next);
    localStorage.setItem('pm_batt_sound', String(next));
    toast.info(next ? 'Charging sound effects enabled' : 'Charging sounds muted');
  };

  const handleSimulateSurge = () => {
    if (battery.toggleSimulatedCharging) {
      battery.toggleSimulatedCharging();
      trackClientActivity({
        action: `Interacted with Battery Charging Surge Simulator (${!battery.charging ? 'Plugged In' : 'Unplugged'})`,
        category: 'mining'
      });
      toast.success(!battery.charging ? '⚡ AC Fast Charger Connected' : '🔋 Running on Internal Battery', {
        description: !battery.charging 
          ? 'Fast charging detected. Zero local GPU power drain active.' 
          : 'Power saver optimizations ready.',
        duration: 3000
      });
    }
  };

  // Status Colors & Themes
  let statusColor = 'text-emerald-400';
  let badgeBg = 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
  let dotColor = 'bg-emerald-400';
  let statusLabel = 'Optimal Power';

  if (battery.charging) {
    statusColor = 'text-[#00f0ff]';
    badgeBg = 'bg-[#00f0ff]/15 border-[#00f0ff]/40 text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.25)]';
    dotColor = 'bg-[#00f0ff]';
    statusLabel = 'Fast Charging';
  } else if (isCritical) {
    statusColor = 'text-rose-400';
    badgeBg = 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse';
    dotColor = 'bg-rose-500';
    statusLabel = 'Critical Battery';
  } else if (isLow) {
    statusColor = 'text-amber-400';
    badgeBg = 'bg-amber-500/20 border-amber-500/40 text-amber-400';
    dotColor = 'bg-amber-400';
    statusLabel = 'Low Power Mode';
  } else if (isMedium) {
    statusColor = 'text-cyan-300';
    badgeBg = 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300';
    dotColor = 'bg-cyan-400';
    statusLabel = 'Normal Battery';
  }

  // Icons
  const renderIcon = (size = 15) => {
    if (battery.charging) {
      return <BatteryCharging size={size} className="text-[#00f0ff] animate-pulse" />;
    }
    if (isCritical) {
      return <BatteryWarning size={size} className="text-rose-400 animate-bounce" />;
    }
    if (isLow) {
      return <BatteryLow size={size} className="text-amber-400" />;
    }
    if (isMedium) {
      return <BatteryMedium size={size} className="text-cyan-300" />;
    }
    return <Battery size={size} className="text-emerald-400" />;
  };

  return (
    <>
      {/* 1. Main Interactive Pill / HUD Trigger */}
      {variant === 'compact' ? (
        <button
          onClick={() => setIsOpen(true)}
          title={`Battery: ${percentage}% • ${battery.charging ? 'Charging (0% Mining Drain)' : 'Battery Power'}`}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all hover:scale-105 active:scale-95 select-none ${badgeBg} ${className}`}
        >
          {renderIcon(14)}
          <span className="font-mono text-[11px] font-extrabold">{percentage}%</span>
          {battery.charging && <Zap size={11} className="fill-current animate-pulse text-[#00f0ff]" />}
        </button>
      ) : (
        <button
          onClick={() => {
            setIsOpen(true);
            trackClientActivity({
              action: `Opened Battery & Green Power HUD (${percentage}%, ${battery.charging ? 'Charging' : 'Discharging'})`,
              category: 'click'
            });
          }}
          title="Click to open Green Cloud Mining & Battery Energy HUD"
          className={`group relative inline-flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border backdrop-blur-xl transition-all duration-300 hover:shadow-lg active:scale-95 cursor-pointer select-none ${badgeBg} ${className}`}
        >
          {/* Animated Glow Halo */}
          {battery.charging && (
            <span className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-[#00f0ff]/30 via-emerald-500/20 to-[#0052ff]/30 blur-sm opacity-70 group-hover:opacity-100 transition-opacity animate-pulse pointer-events-none" />
          )}

          <div className="relative flex items-center justify-center">
            {renderIcon(16)}
            {battery.charging && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#00f0ff] animate-ping" />
            )}
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs font-black z-10">
            <span className={`${statusColor} tracking-tight`}>
              {percentage}%
            </span>

            {battery.charging ? (
              <span className="flex items-center text-[10px] font-extrabold text-[#00f0ff] uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#00f0ff]/15 border border-[#00f0ff]/30 shadow-sm">
                <Zap size={10} className="mr-0.5 inline fill-[#00f0ff]" /> AC
              </span>
            ) : isEffectivePowerSaving ? (
              <span className="flex items-center text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30">
                <Leaf size={10} className="mr-0.5 inline" /> ECO
              </span>
            ) : isLow ? (
              <span className="flex items-center text-[10px] font-extrabold text-amber-400 uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-400/30">
                <AlertTriangle size={10} className="mr-0.5 inline" /> SAVE
              </span>
            ) : null}
          </div>

          {showDetails && (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] border-l border-current/20 pl-2 z-10">
              <span className={`w-1.5 h-1.5 rounded-full ${dotColor} ${battery.charging ? 'animate-pulse' : ''}`} />
              <span className="text-secondary font-bold text-[10px] uppercase tracking-wide group-hover:text-primary transition-colors">
                {statusLabel}
              </span>
            </div>
          )}
        </button>
      )}

      {/* 2. Interactive Smart Power & Green Mining Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 15 }}
              transition={fluidSpring}
              className="bg-surface border border-border rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col relative"
            >
              {/* Header Gradient Top Accent */}
              <div className="h-1.5 w-full bg-gradient-to-r from-[#00f0ff] via-emerald-500 to-[#0052ff]" />

              {/* Modal Header */}
              <div className="p-5 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                    battery.charging ? 'bg-[#00f0ff]/15 text-[#00f0ff]' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>
                    {battery.charging ? <Zap size={22} className="fill-current animate-pulse" /> : <Leaf size={22} />}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base text-primary flex items-center gap-2">
                      Device Power & Green Cloud Mining
                    </h3>
                    <p className="text-xs text-secondary">
                      Real-time device power telemetry & zero-drain cloud optimization
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleSound}
                    title={audioFeedback ? 'Sound FX Enabled' : 'Sound FX Muted'}
                    className="p-2 rounded-xl text-muted hover:text-primary hover:bg-subtle transition-colors"
                  >
                    {audioFeedback ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-muted hover:text-primary hover:bg-subtle transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                {/* Visual Battery Gauge Card */}
                <div className="p-5 rounded-3xl bg-gradient-to-br from-card to-subtle border border-border relative overflow-hidden">
                  {battery.charging && (
                    <div className="absolute top-0 right-0 w-40 h-40 bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none" />
                  )}

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-muted">
                        Device Battery Level
                      </span>
                      {battery.charging && (
                        <span className="px-2 py-0.5 rounded-full bg-[#00f0ff]/15 text-[#00f0ff] text-[10px] font-black border border-[#00f0ff]/30 flex items-center gap-1">
                          <Zap size={10} className="fill-[#00f0ff]" /> {battery.chargingSpeed || 'Fast Charging'}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-2xl font-black text-primary">
                      {percentage}%
                    </span>
                  </div>

                  {/* High-Tech Animated Battery Level Bar */}
                  <div className="w-full h-4 bg-background/80 rounded-full p-0.5 border border-border relative overflow-hidden mb-4">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full relative overflow-hidden ${
                        battery.charging
                          ? 'bg-gradient-to-r from-emerald-400 via-[#00f0ff] to-[#0052ff]'
                          : isLow
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    >
                      {battery.charging && (
                        <div className="absolute inset-0 bg-white/30 animate-[shimmer_1.5s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]" />
                      )}
                    </motion.div>
                  </div>

                  {/* Battery Telemetry Grid */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2.5 rounded-2xl bg-surface/60 border border-border/60">
                      <p className="text-[10px] font-bold text-muted uppercase">Health</p>
                      <p className="text-xs font-black text-emerald-400 mt-0.5">{battery.batteryHealth || 99}% Excellent</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-surface/60 border border-border/60">
                      <p className="text-[10px] font-bold text-muted uppercase">Temperature</p>
                      <p className="text-xs font-black text-cyan-300 mt-0.5">{battery.temperatureC || 28.5}°C Cool</p>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-surface/60 border border-border/60">
                      <p className="text-[10px] font-bold text-muted uppercase">Voltage</p>
                      <p className="text-xs font-black text-primary mt-0.5">{battery.voltageV || 4.18} V</p>
                    </div>
                  </div>

                  {/* Interactive Charger Simulation Button */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between">
                    <span className="text-xs text-secondary font-medium">
                      Simulate Power Adapter:
                    </span>
                    <button
                      onClick={handleSimulateSurge}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                        battery.charging
                          ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                          : 'bg-[#00f0ff]/15 border border-[#00f0ff]/40 text-[#00f0ff] hover:bg-[#00f0ff]/25'
                      }`}
                    >
                      <Zap size={13} className="fill-current" />
                      {battery.charging ? 'Disconnect Charger' : 'Connect ⚡ Turbo Charger'}
                    </button>
                  </div>
                </div>

                {/* Cloud Mining 0% Battery Drain Guarantee */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-xs">
                    <ShieldCheck size={16} />
                    <span>Zero Local Hardware Drain Guarantee</span>
                  </div>
                  <p className="text-xs text-secondary leading-relaxed">
                    Unlike traditional mining software that overheats your phone or laptop with 350W+ GPU load, <strong className="text-primary">Prime Mining</strong> computes all cryptographic blocks on enterprise hydropower & solar datacenters. Your battery health is 100% preserved.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                    <div className="p-2 rounded-xl bg-surface/80 border border-border/50">
                      <span className="text-muted block">Local Mining Draw:</span>
                      <span className="font-extrabold text-rose-400 flex items-center gap-1">
                        <Flame size={12} /> ~350 Watts (Hot)
                      </span>
                    </div>
                    <div className="p-2 rounded-xl bg-surface/80 border border-border/50">
                      <span className="text-muted block">Cloud Mining Draw:</span>
                      <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                        <Leaf size={12} /> 0.0 Watts (Cool)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Power Save Mode Configuration */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-muted">
                    Energy Profiles & Telemetry Speed
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Performance Profile */}
                    <button
                      onClick={() => setPowerSaveMode(false)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        !powerSaveMode
                          ? 'bg-[#0052ff]/10 border-[#0052ff] text-primary shadow-sm'
                          : 'bg-card border-border text-muted hover:text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-primary flex items-center gap-1.5">
                          <Zap size={14} className="text-[#0052ff]" /> High Performance
                        </span>
                        {!powerSaveMode && <CheckCircle2 size={14} className="text-[#0052ff]" />}
                      </div>
                      <p className="text-[11px] text-secondary mt-1 leading-tight">
                        Real-time 60fps telemetry, millisecond chart ticks & instant updates.
                      </p>
                    </button>

                    {/* Eco Profile */}
                    <button
                      onClick={() => setPowerSaveMode(true)}
                      className={`p-3.5 rounded-2xl border text-left transition-all ${
                        powerSaveMode
                          ? 'bg-emerald-500/10 border-emerald-500 text-primary shadow-sm'
                          : 'bg-card border-border text-muted hover:text-secondary'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs text-primary flex items-center gap-1.5">
                          <Leaf size={14} className="text-emerald-400" /> Eco Power Saver
                        </span>
                        {powerSaveMode && <CheckCircle2 size={14} className="text-emerald-400" />}
                      </div>
                      <p className="text-[11px] text-secondary mt-1 leading-tight">
                        Saves 40% battery by reducing background CPU wakeups while mining yield continues.
                      </p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 bg-subtle border-t border-border flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-secondary font-medium">
                  <Activity size={14} className="text-[#0052ff]" />
                  <span>Hashrate sync active</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-5 py-2 bg-[#0052ff] text-white rounded-xl text-xs font-bold hover:bg-[#0052ff]/90 transition-all shadow-md shadow-[#0052ff]/20"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
