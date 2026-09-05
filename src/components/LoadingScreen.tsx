import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(() => {
    try {
      if (typeof window !== 'undefined') {
        return !sessionStorage.getItem('pm_splash_shown');
      }
    } catch {
      return false;
    }
    return false;
  });

  useEffect(() => {
    if (!isLoading) return;

    const startTime = Date.now();
    const duration = 350; // fast 350ms loading duration

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.floor((elapsed / duration) * 100));
      setProgress(pct);

      if (pct >= 100) {
        clearInterval(interval);
        try {
          sessionStorage.setItem('pm_splash_shown', 'true');
        } catch {
          // ignore
        }
        setTimeout(() => setIsLoading(false), 100);
      }
    }, 20);

    // Hard fallback safety: never block screen for more than 500ms
    const safety = setTimeout(() => {
      clearInterval(interval);
      try {
        sessionStorage.setItem('pm_splash_shown', 'true');
      } catch {
        // ignore
      }
      setIsLoading(false);
    }, 500);

    return () => {
      clearInterval(interval);
      clearTimeout(safety);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          onClick={() => setIsLoading(false)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0B0F19] overflow-hidden font-sans cursor-pointer"
        >
          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-lg px-6">
            
            {/* Logo and Company Name */}
            <div className="flex items-center justify-center gap-5 mb-16">
              {/* 3-Bar Logo (Matching the video's style) */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="flex flex-col gap-2 transform -skew-x-[16deg]"
              >
                <div className="h-3.5 w-14 bg-gradient-to-r from-blue-600 to-sky-400 rounded-sm shadow-[2px_2px_5px_rgba(0,0,0,0.3)]" />
                <div className="h-3.5 w-9 bg-gradient-to-r from-blue-600 to-sky-400 rounded-sm shadow-[2px_2px_5px_rgba(0,0,0,0.3)]" />
                <div className="h-3.5 w-14 bg-gradient-to-r from-blue-600 to-sky-400 rounded-sm shadow-[2px_2px_5px_rgba(0,0,0,0.3)]" />
              </motion.div>

              {/* Company Name */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
                className="text-4xl md:text-5xl font-bold text-white tracking-tight flex items-center"
              >
                PoolMining<span className="text-sky-400 font-light">.cloud</span>
              </motion.div>
            </div>

            {/* Loading Bar & Text Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="w-full flex flex-col items-center gap-3"
            >
              {/* Status Text */}
              <div className="flex justify-between w-full text-[10px] md:text-xs uppercase tracking-[0.2em] text-slate-400 font-medium px-1">
                <motion.span
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  system initializing...
                </motion.span>
                <span className="text-sky-400 tabular-nums font-bold">{Math.min(progress, 100)}%</span>
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden relative shadow-inner">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 to-sky-400 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
                {/* Leading glow edge */}
                <motion.div
                  className="absolute top-0 h-full w-12 bg-white blur-[4px] opacity-60 rounded-full"
                  initial={{ left: '-48px' }}
                  animate={{ left: `calc(${progress}% - 24px)` }}
                  transition={{ duration: 0.1, ease: "linear" }}
                />
              </div>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
