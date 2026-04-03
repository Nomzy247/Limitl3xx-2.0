import { motion } from 'motion/react';
import { Bitcoin, Coins, Diamond, Hexagon } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

const assets = [
  { name: 'Bitcoin', symbol: 'BTC', icon: <Bitcoin size={32} className="text-[#F7931A]" />, apy: '12-18%' },
  { name: 'Ethereum', symbol: 'ETH', icon: <Diamond size={32} className="text-[#627EEA]" />, apy: '15-22%' },
  { name: 'Solana', symbol: 'SOL', icon: <Hexagon size={32} className="text-[#14F195]" />, apy: '20-35%' },
  { name: 'Litecoin', symbol: 'LTC', icon: <Coins size={32} className="text-[#345D9D]" />, apy: '10-15%' }
];

export default function Portfolio() {
  const isDark = useIsDark();

  return (
    <section id="portfolio" className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#0052ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight cursor-default"
          >
            Supported <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Assets</span>
          </motion.h2>
          <p className="text-secondary text-lg">Diversify your mining portfolio across top-tier blockchain networks.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 grid-container">
          {assets.map((asset, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              whileHover={{ 
                y: -10,
                scale: 1.02,
                boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.15)' : '0 0 30px rgba(0, 82, 255, 0.1)',
                borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 82, 255, 0.3)'
              }}
              className="bg-gradient-to-br from-[#111827] to-[#05080f] border border-border/50 rounded-3xl p-8 transition-all group cursor-pointer tile"
            >
              <div className="w-16 h-16 rounded-2xl bg-subtle flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {asset.icon}
              </div>
              <motion.h3 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold text-primary mb-1 cursor-default"
              >
                {asset.name}
              </motion.h3>
              <p className="text-sm text-muted font-medium uppercase tracking-wider mb-6">{asset.symbol}</p>
              
              <div className="pt-6 border-t border-border/50">
                <p className="text-sm text-secondary mb-1">Estimated APY</p>
                <motion.p 
                  whileHover={{ color: ['#00f0ff', '#ffffff', '#00f0ff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-2xl font-bold text-[#00f0ff] cursor-default"
                >
                  {asset.apy}
                </motion.p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
