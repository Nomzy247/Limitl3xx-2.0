import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud } from 'lucide-react';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showOverview, setShowOverview] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowOverview(true);
          setTimeout(() => setIsLoading(false), 1500); // 1.5s highlight
          return 100;
        }
        return prev + Math.floor(Math.random() * 3) + 1;
      });
    }, 40);

    return () => clearInterval(interval);
  }, []);

  // Sparse, slow-moving motes
  const particles = Array.from({ length: 18 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: 30 + Math.random() * 20, // very slow
    delay: Math.random() * 5,
  }));

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }} // slide to landing page
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 overflow-hidden font-sans"
        >
          {/* Cinematic Background */}
          <motion.div 
            animate={{ 
              backgroundPosition: ['0% 0%', '100% 100%'],
            }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'radial-gradient(circle at 20% 30%, rgba(14, 165, 233, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.15) 0%, transparent 50%)',
              backgroundSize: '200% 200%'
            }}
          />

          {/* Sparse motes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((p) => (
              <motion.div
                key={p.id}
                className="absolute bg-cyan-200 rounded-full"
                style={{ 
                  left: `${p.x}%`, 
                  top: `${p.y}%`,
                  width: `${p.size}px`,
                  height: `${p.size}px`,
                  opacity: 0.10,
                  boxShadow: `0 0 ${p.size * 2}px rgba(165, 243, 252, 0.2)`
                }}
                animate={{
                  y: ['0%', '-100%'],
                  opacity: [0, 0.10, 0]
                }}
                transition={{
                  duration: p.duration,
                  delay: p.delay,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            ))}
          </div>

          {/* Main Content Container */}
          <div className="relative z-10 flex flex-col items-center w-full max-w-md px-6">
            
            {/* Logo with Ring Ripple and Bracket Accent */}
            <div className="mb-8 relative flex items-center justify-center">
              {/* Bracket Open */}
              <motion.span
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: -40 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-sky-400 text-5xl font-light"
              >
                [
              </motion.span>

              {/* Ring Ripple */}
              <motion.div
                animate={{ scale: [1, 2.5], opacity: [0.18, 0] }}
                transition={{ duration: 0.9, repeat: Infinity, ease: "easeOut" }}
                className="absolute w-16 h-16 rounded-full border border-sky-400"
              />

              {/* Cloud Icon with Micro-scale */}
              <motion.div
                animate={{ scale: [1, 1.02, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10"
              >
                <Cloud size={64} className="text-sky-400" strokeWidth={1.5} />
              </motion.div>

              {/* Bracket Close */}
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 40 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute text-sky-400 text-5xl font-light"
              >
                ]
              </motion.span>
            </div>

            {/* Company Name */}
            <div className="flex items-center justify-center text-4xl md:text-5xl font-light text-slate-100 tracking-wide mb-14">
              <span>PoolMining.</span>
              <Cloud size={32} className="text-sky-400 ml-1 inline-block drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" strokeWidth={2} />
            </div>

            {/* Progress Bar Container - Reduced width to 70% */}
            <div className="w-[70%] flex flex-col items-center gap-5">
              {/* Numeric Percentage Counter */}
              <div className="text-sky-300 font-medium text-2xl tracking-widest tabular-nums">
                {Math.min(progress, 100)}%
              </div>

              {/* Smooth Progress Bar */}
              <div className="w-full h-1.5 bg-slate-800/50 rounded-full overflow-hidden relative shadow-inner backdrop-blur-sm border border-slate-700/50">
                <motion.div 
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-sky-400 to-cyan-300 rounded-full shadow-[0_0_15px_rgba(56,189,248,0.6)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
                {/* Leading glow edge */}
                <motion.div
                  className="absolute top-0 h-full w-6 bg-white blur-[3px] opacity-70 rounded-full"
                  initial={{ left: -24 }}
                  animate={{ left: `calc(${progress}% - 12px)` }}
                  transition={{ duration: 0.1, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              
              {/* Status Text / Next Page Title Highlight */}
              <div className="h-6 mt-2 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  {showOverview ? (
                    <motion.p
                      key="overview"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-sm uppercase tracking-[0.2em] text-sky-300 font-semibold"
                    >
                      OVERVIEW
                    </motion.p>
                  ) : (
                    <motion.p 
                      key="booting"
                      animate={{ opacity: [0.3, 0.8, 0.3] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      className="text-xs uppercase tracking-[0.3em] text-slate-400 font-medium"
                    >
                      BOOTING UP
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
