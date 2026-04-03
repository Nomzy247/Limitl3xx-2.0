import React, { useEffect, useState } from 'react';
import { disableNetwork, enableNetwork } from 'firebase/firestore';
import { db } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, WifiOff, RefreshCw } from 'lucide-react';

// Global fluid animation configuration for the entire app
export const fluidSpring = {
  type: "spring",
  damping: 25,
  stiffness: 120,
  mass: 0.5,
  bounce: 0.2,
  restDelta: 0.001
};

export default function SystemManager({ children }: { children: React.ReactNode }) {
  const [systemState, setSystemState] = useState<'running' | 'cooldown' | 'reconnecting' | 'failed'>('running');
  const [attempts, setAttempts] = useState(0);

  useEffect(() => {
    let mounted = true;

    const manageConnection = async () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();

      // Rule 1: 10 minute break at 9:11 AM (runs 11hrs 50mins otherwise)
      const isCooldownTime = hours === 9 && minutes >= 11 && minutes < 21;

      if (isCooldownTime) {
        if (systemState !== 'cooldown') {
          setSystemState('cooldown');
          try { await disableNetwork(db); } catch (e) {}
        }
      } else {
        // Rule 2 & 3: Connect and retry up to 3 times if deactivated/unresponsive
        if (systemState === 'cooldown' || systemState === 'failed' || systemState === 'reconnecting') {
          let connected = false;
          let currentAttempts = 0;
          
          setSystemState('reconnecting');

          while (currentAttempts < 3 && !connected && mounted) {
            try {
              currentAttempts++;
              setAttempts(currentAttempts);
              await enableNetwork(db);
              connected = true;
              if (mounted) setSystemState('running');
            } catch (error) {
              if (currentAttempts >= 3) {
                if (mounted) setSystemState('failed');
              } else {
                await new Promise(resolve => setTimeout(resolve, 2000));
              }
            }
          }
        }
      }
    };

    const interval = setInterval(manageConnection, 10000); // Check every 10 seconds
    manageConnection(); // Initial check

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [systemState]);

  return (
    <>
      <AnimatePresence mode="wait">
        {systemState === 'cooldown' && (
          <motion.div 
            key="cooldown"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={fluidSpring}
            className="fixed inset-0 z-[9999] bg-background/80 flex flex-col items-center justify-center"
          >
            <Activity size={48} className="text-[#0052ff] mb-6 animate-pulse" />
            <h1 className="text-4xl font-bold text-primary mb-4 tracking-tight">System Cooldown</h1>
            <p className="text-secondary text-lg max-w-md text-center leading-relaxed">
              The system is taking its scheduled 10-minute cooldown (9:11 AM - 9:21 AM) to ensure optimal performance.
            </p>
          </motion.div>
        )}
        
        {systemState === 'reconnecting' && (
          <motion.div 
            key="reconnecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={fluidSpring}
            className="fixed inset-0 z-[9999] bg-background/90 flex flex-col items-center justify-center backdrop-blur-md"
          >
            <RefreshCw size={48} className="text-yellow-500 mb-6 animate-spin" />
            <h1 className="text-3xl font-bold text-primary mb-4">Reconnecting to Core...</h1>
            <p className="text-secondary text-lg">Attempt {attempts} of 3</p>
          </motion.div>
        )}

        {systemState === 'failed' && (
          <motion.div 
            key="failed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={fluidSpring}
            className="fixed inset-0 z-[9999] bg-background/95 flex flex-col items-center justify-center backdrop-blur-xl"
          >
            <WifiOff size={48} className="text-rose-500 mb-6" />
            <h1 className="text-3xl font-bold text-rose-500 mb-4">Connection Failed</h1>
            <p className="text-secondary text-lg max-w-md text-center">
              Unable to establish connection to Firebase after 3 attempts. Please check your network or contact the Super User.
            </p>
            <button 
              onClick={() => setSystemState('cooldown')} // Reset to trigger reconnect
              className="mt-8 px-6 py-3 bg-rose-500 text-white rounded-full font-bold hover:bg-rose-600 transition-colors"
            >
              Retry Connection
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  );
}
