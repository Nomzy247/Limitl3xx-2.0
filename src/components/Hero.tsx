import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';
import { Link } from 'react-router';
import { ArrowRight, Activity } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

export default function Hero() {
  const isDark = useIsDark();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -150]);

  return (
    <div ref={containerRef} className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 bg-background">
      {/* Background effects */}
      <motion.div 
        style={{ y: y1 }}
        className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0052ff] rounded-full blur-[150px] opacity-20 pointer-events-none" 
      />
      <motion.div 
        style={{ y: y2 }}
        className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[120px] opacity-10 pointer-events-none" 
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={fluidSpring}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-subtle border border-border mb-8 backdrop-blur-md"
            >
              <span className="flex h-2 w-2 rounded-full bg-[#00f0ff] animate-pulse" />
              <span className="text-xs font-semibold tracking-wider uppercase text-muted">PoolMining Protocol v2.0</span>
            </motion.div>
            
            <motion.h1
              initial="initial"
              animate="animate"
              whileHover="hover"
              className="text-5xl sm:text-6xl lg:text-8xl font-bold tracking-tighter mb-8 leading-[1.1] text-primary cursor-default flex flex-col"
            >
              <motion.span
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.1 } },
                  hover: {
                    scale: 1.02,
                    filter: [
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))", 
                      "brightness(1.3) drop-shadow(0px 0px 15px rgba(0,240,255,0.8))", 
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))"
                    ],
                    transition: { duration: 1.2, delay: 0 }
                  }
                }}
                className="block"
              >
                Automated
              </motion.span>
              <motion.span
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.2 } },
                  hover: {
                    scale: 1.02,
                    filter: [
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))", 
                      "brightness(1.3) drop-shadow(0px 0px 15px rgba(0,240,255,0.8))", 
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))"
                    ],
                    transition: { duration: 1.2, delay: 0.4 }
                  }
                }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-primary/60"
              >
                Wealth Generation
              </motion.span>
              <motion.span
                variants={{
                  initial: { opacity: 0, y: 20 },
                  animate: { opacity: 1, y: 0, transition: { duration: 0.5, delay: 0.3 } },
                  hover: {
                    scale: 1.02,
                    filter: [
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))", 
                      "brightness(1.3) drop-shadow(0px 0px 15px rgba(0,240,255,0.8))", 
                      "brightness(1) drop-shadow(0px 0px 0px rgba(0,240,255,0))"
                    ],
                    transition: { duration: 1.2, delay: 0.8 }
                  }
                }}
                className="block text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]"
              >
                for Web3
              </motion.span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: 0.2 }}
              className="text-lg md:text-xl text-secondary mb-10 max-w-2xl leading-relaxed font-medium"
            >
              Institutional-grade crypto mining and yield generation platform. 
              Secure, transparent, and optimized for maximum returns in the decentralized economy.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4"
            >
              <Link
                to="/signup"
                className="group px-8 py-4 rounded-full bg-primary text-background font-bold transition-all hover:scale-105 flex items-center justify-center gap-2 text-lg"
              >
                Start Mining <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="#features"
                className="px-8 py-4 rounded-full bg-subtle hover:bg-subtle-hover border border-border text-primary font-semibold transition-all flex items-center justify-center gap-2 text-lg backdrop-blur-md"
              >
                Explore Platform <Activity size={20} className="text-[#00f0ff]" />
              </a>
            </motion.div>
          </div>

          <div className="lg:col-span-4 relative hidden lg:block">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...fluidSpring, delay: 0.4 }}
              className="relative w-full aspect-square"
            >
              {/* Abstract 3D-like visual representation */}
              <div className="absolute inset-0 rounded-full border border-border animate-[spin_20s_linear_infinite]" />
              <div className="absolute inset-4 rounded-full border border-[#0052ff]/30 animate-[spin_15s_linear_infinite_reverse]" />
              <div className="absolute inset-8 rounded-full border border-[#00f0ff]/30 animate-[spin_10s_linear_infinite]" />
              
              <motion.div 
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                initial="initial"
                whileHover="hover"
              >
                {/* Ripple Effects */}
                <motion.div
                  variants={{
                    initial: { scale: 0.8, opacity: 0, transition: { duration: 0.5 } },
                    hover: { scale: 2, opacity: [0, 0.6, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeOut" } }
                  }}
                  className="absolute w-32 h-32 rounded-2xl border-2 border-[#00f0ff]"
                />
                <motion.div
                  variants={{
                    initial: { scale: 0.8, opacity: 0, transition: { duration: 0.5 } },
                    hover: { scale: 2.5, opacity: [0, 0.4, 0], transition: { duration: 1.5, repeat: Infinity, ease: "easeOut", delay: 0.4 } }
                  }}
                  className="absolute w-32 h-32 rounded-2xl border-2 border-[#0052ff]"
                />

                <div className="w-32 h-32 bg-gradient-to-br from-[#0052ff] to-[#00f0ff] rounded-2xl rotate-12 blur-sm opacity-50 animate-pulse" />
                <motion.div 
                  variants={{
                    initial: { scale: 1 },
                    hover: { scale: 1.05, transition: { duration: 0.3 } }
                  }}
                  className="absolute w-32 h-32 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-border-hover rounded-2xl -rotate-6 flex items-center justify-center shadow-2xl"
                >
                  <Activity size={48} className="text-primary" />
                </motion.div>
              </motion.div>

              {/* Floating stat cards */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.2)' : '0 0 30px rgba(0, 82, 255, 0.15)',
                }}
                className="absolute -left-12 top-1/4 bg-card/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl transition-all cursor-default"
              >
                <p className="text-xs text-secondary font-medium mb-1">Current Yield</p>
                <p className="text-xl font-bold text-[#00f0ff]">+2.5% Daily</p>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.2)' : '0 0 30px rgba(0, 82, 255, 0.15)',
                }}
                className="absolute -right-8 bottom-1/4 bg-card/80 backdrop-blur-md border border-border p-4 rounded-2xl shadow-xl transition-all cursor-default"
              >
                <p className="text-xs text-secondary font-medium mb-1">Active Miners</p>
                <p className="text-xl font-bold text-primary">14,205</p>
              </motion.div>
            </motion.div>
          </div>

        </div>
      </div>
    </div>
  );
}
