import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Download, X, Smartphone, Tablet } from 'lucide-react';
import { usePWA } from '../hooks/usePWA';
import { fluidSpring } from './SystemManager';

export default function PWAInstallPrompt() {
  const { isInstallable, isInstalled, installPWA } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Show prompt after a short delay if it's installable and not already installed
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => {
        // Check if user has already dismissed it in this session
        const dismissed = sessionStorage.getItem('pwa-prompt-dismissed');
        if (!dismissed) {
          setShowPrompt(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  const handleInstall = async () => {
    await installPWA();
    setShowPrompt(false);
  };

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={fluidSpring}
          className="fixed bottom-24 left-4 right-4 md:bottom-8 md:left-auto md:right-8 md:w-80 z-[60]"
        >
          <div className="bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-5 shadow-2xl relative overflow-hidden group">
            {/* Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
            
            <button 
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1 hover:bg-subtle rounded-full transition-colors text-muted hover:text-primary"
            >
              <X size={16} />
            </button>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                <Download className="text-primary" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-primary text-sm">Install PoolMining App</h3>
                <p className="text-xs text-secondary mt-1 leading-relaxed">
                  Get a faster, more reliable experience on your mobile or tablet device.
                </p>
                
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={handleInstall}
                    className="flex-1 py-2 bg-primary text-background rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    Install Now
                  </button>
                  <div className="flex gap-1 text-muted">
                    <Smartphone size={14} />
                    <Tablet size={14} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
