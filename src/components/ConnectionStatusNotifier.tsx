import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { WifiOff, Wifi, RefreshCw } from 'lucide-react';
import { fluidSpring } from './SystemManager';

export default function ConnectionStatusNotifier() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showNotification, setShowNotification] = useState(false);
  const [reconnectedBanner, setReconnectedBanner] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnectedBanner(true);
      setShowNotification(true);
      const timer = setTimeout(() => {
        setReconnectedBanner(false);
        setShowNotification(false);
      }, 4000);
      return () => clearTimeout(timer);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnectedBanner(false);
      setShowNotification(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    if (!navigator.onLine) {
      setShowNotification(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetryConnection = () => {
    if (navigator.onLine) {
      setIsOnline(true);
      setReconnectedBanner(true);
      setTimeout(() => setShowNotification(false), 3000);
    } else {
      // Trigger a light ping
      fetch('/favicon.ico', { method: 'HEAD', cache: 'no-store' })
        .then(() => {
          setIsOnline(true);
          setReconnectedBanner(true);
          setTimeout(() => setShowNotification(false), 3000);
        })
        .catch(() => {
          setIsOnline(false);
        });
    }
  };

  return (
    <AnimatePresence>
      {showNotification && (
        <motion.div
          id="connection-status-notifier"
          initial={{ y: -60, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -60, opacity: 0, scale: 0.95 }}
          transition={fluidSpring}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-11/12 max-w-md"
        >
          <div
            className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              isOnline
                ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                : 'bg-rose-950/90 border-rose-500/30 text-rose-100'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {isOnline ? <Wifi size={18} /> : <WifiOff size={18} />}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold tracking-wide">
                  {isOnline ? 'Connection Restored' : 'Intermittent Connection / Offline'}
                </span>
                <span className="text-xs text-white/70">
                  {isOnline
                    ? 'Cloud sync is active and database updates resumed.'
                    : 'Changes are cached locally and will sync once reconnected.'}
                </span>
              </div>
            </div>

            {!isOnline ? (
              <button
                id="retry-connection-btn"
                onClick={handleRetryConnection}
                className="ml-3 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 border border-rose-500/30 text-xs font-medium transition-all flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw size={12} />
                Retry
              </button>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
