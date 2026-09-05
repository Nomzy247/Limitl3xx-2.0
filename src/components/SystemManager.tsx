import React, { useEffect, useState } from 'react';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, WifiOff, RefreshCw } from 'lucide-react';

// Global fluid animation configuration for the entire app
export const fluidSpring = {
  type: "tween",
  duration: 0.2,
  ease: "easeInOut"
};

export default function SystemManager({ children }: { children: React.ReactNode }) {
  const [systemState, setSystemState] = useState<'running' | 'reconnecting' | 'failed'>('running');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;

    const handleOffline = () => {
      if (mounted) setSystemState('failed');
    };

    const handleOnline = async () => {
      if (!mounted) return;
      setSystemState('reconnecting');
      try {
        await enableNetwork(db);
      } catch (err) {
        // ignore already enabled errors
      }
      if (mounted) setSystemState('running');
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    return () => {
      mounted = false;
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
    };
  }, []);

  const handleManualRetry = async () => {
    setSystemState('reconnecting');
    setAttempts(prev => prev + 1);
    try {
      await enableNetwork(db);
      setSystemState('running');
    } catch {
      setTimeout(() => setSystemState('running'), 1500);
    }
  };

  return (
    <>
      <AnimatePresence>
        {systemState === 'failed' && (
          <motion.div 
            key="connection-failed-banner"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={fluidSpring}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-lg w-[92%] bg-rose-950/90 border border-rose-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-4 text-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <WifiOff size={18} />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-200">Network Offline</p>
                <p className="text-[11px] text-rose-300/80">Using cached session. Connecting in background...</p>
              </div>
            </div>
            <button 
              onClick={handleManualRetry}
              className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-semibold shrink-0 transition-colors shadow-sm active:scale-95"
            >
              Retry
            </button>
          </motion.div>
        )}

        {systemState === 'reconnecting' && (
          <motion.div 
            key="reconnecting-banner"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={fluidSpring}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[9999] max-w-sm w-[90%] bg-slate-900/90 border border-yellow-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-slate-200"
          >
            <RefreshCw size={16} className="text-yellow-400 animate-spin shrink-0" />
            <p className="text-xs font-medium">Reconnecting to Core Network...</p>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
