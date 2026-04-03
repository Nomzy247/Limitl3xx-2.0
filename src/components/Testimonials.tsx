import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Quote, RefreshCw } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

const testimonials = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    country: 'Spain',
    quote: 'PoolMining.cloud completely transformed my approach to crypto mining. The automated yield generation is flawless and the daily payouts are always on time.',
    image: 'https://picsum.photos/seed/elena/150/150'
  },
  {
    id: 2,
    name: 'David Chen',
    country: 'Singapore',
    quote: 'As an institutional investor, security is my top priority. PoolMining.cloud provides military-grade cold storage while delivering consistent 2.5% daily returns.',
    image: 'https://picsum.photos/seed/david/150/150'
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    country: 'United Kingdom',
    quote: 'The dashboard analytics are incredible. I can track my profit margins down to the minute. Best platform I have used in 5 years of crypto.',
    image: 'https://picsum.photos/seed/sarah/150/150'
  },
  {
    id: 4,
    name: 'Marcus Thorne',
    country: 'Australia',
    quote: 'Instant withdrawals actually mean instant here. I requested a $10k payout and it was in my wallet within 3 seconds. Unbelievable service.',
    image: 'https://picsum.photos/seed/marcus/150/150'
  },
  {
    id: 5,
    name: 'Aisha Patel',
    country: 'UAE',
    quote: 'The transparency of the mining pools is what won me over. I can see exactly where my hash power is directed and the returns are unmatched.',
    image: 'https://picsum.photos/seed/aisha/150/150'
  }
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const isDark = useIsDark();

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleHoverRefresh = () => {
    setIsHovered(true);
    next();
  };

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight cursor-default"
          >
            Global <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Trust</span>
          </motion.h2>
          <p className="text-secondary text-lg">Join thousands of investors worldwide generating passive income.</p>
        </div>

        <div className="relative max-w-4xl mx-auto">
          <div className="absolute top-1/2 -left-4 md:-left-12 -translate-y-1/2 z-10">
            <button onClick={prev} className="p-3 rounded-full bg-card border border-border hover:bg-subtle-hover hover:border-border-hover transition-all text-primary">
              <ChevronLeft size={24} />
            </button>
          </div>
          
          <div className="absolute top-1/2 -right-4 md:-right-12 -translate-y-1/2 z-10">
            <button onClick={next} className="p-3 rounded-full bg-card border border-border hover:bg-subtle-hover hover:border-border-hover transition-all text-primary">
              <ChevronRight size={24} />
            </button>
          </div>

          <motion.div 
            className="overflow-hidden relative h-[400px] md:h-[350px] bg-gradient-to-br from-[#111827] to-[#0a0e17] rounded-[2rem] border border-border/50 cursor-pointer"
            onMouseEnter={handleHoverRefresh}
            onMouseLeave={() => setIsHovered(false)}
            animate={{
              scale: isHovered ? 1.02 : 1,
              borderColor: isHovered ? (isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 82, 255, 0.3)') : 'rgba(255, 255, 255, 0.05)',
              boxShadow: isHovered ? (isDark ? '0 30px 60px -15px rgba(0, 240, 255, 0.2)' : '0 30px 60px -15px rgba(0, 82, 255, 0.1)') : '0 0 0 rgba(0,0,0,0)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={fluidSpring}
                className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 md:px-16"
              >
                <div className="relative mb-8">
                  <div className="w-16 h-16 rounded-full bg-[#0052ff]/10 flex items-center justify-center mx-auto">
                    <Quote className="text-[#00f0ff]" size={32} />
                  </div>
                  {isHovered && (
                    <motion.div 
                      initial={{ opacity: 0, rotate: -180, scale: 0 }}
                      animate={{ opacity: 1, rotate: 0, scale: 1 }}
                      className="absolute -top-2 -right-4 text-[#00f0ff] bg-card rounded-full p-1 border border-border shadow-lg"
                    >
                      <RefreshCw size={16} />
                    </motion.div>
                  )}
                </div>
                <p className="text-xl md:text-2xl text-primary mb-10 font-medium leading-relaxed max-w-3xl tracking-tight">
                  "{testimonials[currentIndex].quote}"
                </p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonials[currentIndex].image} 
                    alt={testimonials[currentIndex].name}
                    className="w-14 h-14 rounded-full border-2 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                    referrerPolicy="no-referrer"
                  />
                  <div className="text-left">
                    <h4 className="font-bold text-primary text-lg">{testimonials[currentIndex].name}</h4>
                    <p className="text-sm text-[#00f0ff] font-medium">{testimonials[currentIndex].country}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
