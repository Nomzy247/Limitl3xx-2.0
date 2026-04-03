import { motion } from 'motion/react';
import { Shield, Zap, Globe } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

export default function AboutUs() {
  const isDark = useIsDark();

  return (
    <section id="about" className="py-24 bg-surface relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-[#0052ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={fluidSpring}
          >
            <motion.h2 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ ...fluidSpring, duration: 1.5, repeat: Infinity }}
              className="text-4xl md:text-5xl font-bold mb-6 tracking-tight cursor-default"
            >
              Pioneering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">
                Future of Mining
              </span>
            </motion.h2>
            <p className="text-secondary text-lg leading-relaxed mb-8">
              PoolMining.cloud was founded with a singular vision: to democratize access to institutional-grade cryptocurrency mining. We bridge the gap between complex blockchain infrastructure and everyday investors.
            </p>
            <p className="text-secondary text-lg leading-relaxed mb-8">
              Our proprietary AI-driven algorithms continuously scan global mining pools, automatically reallocating hash power to ensure maximum profitability and minimal downtime.
            </p>
            
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">2019</span>
                <span className="text-sm text-muted font-medium uppercase tracking-wider">Founded</span>
              </div>
              <div className="w-px bg-subtle-hover mx-4"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">$2B+</span>
                <span className="text-sm text-muted font-medium uppercase tracking-wider">Mined</span>
              </div>
              <div className="w-px bg-subtle-hover mx-4"></div>
              <div className="flex flex-col">
                <span className="text-3xl font-bold text-primary">150+</span>
                <span className="text-sm text-muted font-medium uppercase tracking-wider">Experts</span>
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ ...fluidSpring, delay: 0.2 }}
            whileHover={{ 
              scale: 1.02,
              boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.15)' : '0 0 30px rgba(0, 82, 255, 0.1)',
            }}
            className="relative"
          >
            <div className="aspect-square rounded-[2rem] bg-gradient-to-br from-[#111827] to-[#05080f] border border-border p-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('https://picsum.photos/seed/mining/800/800')] opacity-20 mix-blend-overlay bg-cover bg-center" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-transparent to-transparent" />
              
              <div className="relative z-10 h-full flex flex-col justify-end">
                <div className="bg-card/80 backdrop-blur-md border border-border rounded-2xl p-6 shadow-2xl">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#0052ff]/20 flex items-center justify-center">
                      <Shield className="text-[#0052ff]" size={24} />
                    </div>
                    <div>
                      <motion.h4 
                        whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="font-bold text-primary cursor-default"
                      >
                        Regulated & Compliant
                      </motion.h4>
                      <p className="text-sm text-secondary">Fully licensed operations</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#00f0ff]/20 flex items-center justify-center">
                      <Globe className="text-[#00f0ff]" size={24} />
                    </div>
                    <div>
                      <motion.h4 
                        whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="font-bold text-primary cursor-default"
                      >
                        100% Carbon Neutral
                      </motion.h4>
                      <p className="text-sm text-secondary">Powered by renewable energy</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
