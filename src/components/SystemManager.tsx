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
      // Re-enable network if it was somehow disabled or if we are in a failed state
      if (systemState === 'failed' || systemState === 'reconnecting') {
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
            console.error("Connection attempt failed", error);
            if (currentAttempts >= 3) {
              if (mounted) setSystemState('failed');
            } else {
              await new Promise(resolve => setTimeout(resolve, 2000));
            }
          }
        }
      }
    };

    const interval = setInterval(manageConnection, 30000); // Check every 30 seconds
    manageConnection(); // Initial check

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [systemState]);

  return (
    <>
      <AnimatePresence mode="wait">
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
