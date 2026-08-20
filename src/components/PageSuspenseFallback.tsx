import React from 'react';
import { motion } from 'motion/react';
import { Cpu, Activity } from 'lucide-react';

/**
 * High-performance, visually engaging route transition fallback
 * Optimizes perceived performance on slow mobile/desktop networks
 */
export default function PageSuspenseFallback() {
  return (
    <div
      id="page-suspense-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading page view"
      className="relative min-h-[75vh] w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden select-none"
    >
      {/* Top viewport infinite neon loading laser */}
      <div className="fixed top-0 left-0 right-0 h-[3px] bg-slate-900/20 z-[9999] overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-transparent via-[#00f0ff] to-[#0052ff] shadow-[0_0_12px_#00f0ff]"
          initial={{ x: '-100%' }}
          animate={{ x: '100%' }}
          transition={{
            repeat: Infinity,
            duration: 1.2,
            ease: 'easeInOut',
          }}
          style={{ width: '60%' }}
        />
      </div>

      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#0052ff]/10 dark:bg-[#00f0ff]/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Core animated loader structure */}
      <div className="flex flex-col items-center justify-center max-w-sm w-full">
        <div className="relative flex items-center justify-center w-24 h-24 mb-6">
          {/* Outer clockwise rotating dashed ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
            className="absolute inset-0 rounded-full border-2 border-dashed border-[#0052ff]/40 dark:border-[#00f0ff]/40"
          />

          {/* Inner counter-clockwise spinning glowing gradient arc */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="absolute inset-2 rounded-full border-2 border-transparent border-t-[#0052ff] border-r-[#00f0ff] filter drop-shadow-[0_0_6px_rgba(0,240,255,0.6)]"
          />

          {/* Center glowing core with CPU icon */}
          <motion.div
            animate={{ scale: [0.92, 1.06, 0.92], opacity: [0.85, 1, 0.85] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052ff] to-[#00f0ff] flex items-center justify-center shadow-[0_0_20px_rgba(0,82,255,0.4)] text-white"
          >
            <Cpu size={22} className="animate-pulse" />
          </motion.div>
        </div>

        {/* Dynamic loading label and status badge */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-subtle dark:bg-white/5 border border-border/50 text-[11px] font-semibold text-primary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
            <span className="tracking-wide text-xs">PoolMining Stratum Node</span>
          </div>

          <p className="text-sm font-medium text-foreground tracking-tight flex items-center gap-1.5 mt-1">
            <span>Loading interface modules</span>
            <span className="flex gap-0.5">
              <span className="animate-bounce delay-75">.</span>
              <span className="animate-bounce delay-150">.</span>
              <span className="animate-bounce delay-300">.</span>
            </span>
          </p>
          <span className="text-xs text-muted-foreground">
            Decentralized hashpower & telemetry stream
          </span>
        </div>

        {/* Simulated Shimmer Skeleton Layout (Instant perceived performance) */}
        <div className="w-full mt-8 space-y-3 opacity-60">
          <div className="h-4 w-3/4 bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse mx-auto" />
          <div className="grid grid-cols-2 gap-3 w-full pt-2">
            <div className="h-16 rounded-xl bg-slate-200/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 animate-pulse" />
            <div className="h-16 rounded-xl bg-slate-200/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 animate-pulse delay-100" />
          </div>
        </div>
      </div>
    </div>
  );
}
