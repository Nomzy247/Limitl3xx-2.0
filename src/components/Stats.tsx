import { motion } from 'motion/react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';
import { useState, useEffect } from 'react';
import { db, doc, onSnapshot } from '../firebase';

export default function Stats() {
  const isDark = useIsDark();
  const [stats, setStats] = useState([
    { id: 'tvl', label: 'Total Value Locked', value: '$0' },
    { id: 'miners', label: 'Active Miners', value: '0' },
    { id: 'countries', label: 'Countries Supported', value: '0' },
    { id: 'uptime', label: 'Uptime', value: '0%' },
  ]);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'system', 'stats'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setStats([
          { id: 'tvl', label: 'Total Value Locked', value: data.tvl || '$0' },
          { id: 'miners', label: 'Active Miners', value: data.miners || '0' },
          { id: 'countries', label: 'Countries Supported', value: data.countries || '0' },
          { id: 'uptime', label: 'Uptime', value: data.uptime || '0%' },
        ]);
      }
    });
    return () => unsub();
  }, []);

  return (
    <section className="py-24 bg-background border-y border-border/50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[300px] bg-[#0052ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold tracking-tight cursor-default"
          >
            PoolMining <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">in numbers</span>
          </motion.h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8 md:gap-12">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.1,
              }}
              className="text-center group cursor-default"
            >
              <motion.div 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl sm:text-4xl md:text-6xl font-bold text-primary mb-2 tracking-tighter"
              >
                {stat.value}
              </motion.div>
              <div className="text-sm md:text-base text-secondary font-medium uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
