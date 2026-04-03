import { motion } from 'motion/react';
import { Cpu, Shield, Zap, BarChart3, Wallet, Globe, ArrowUpRight } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';
import { fluidSpring } from './SystemManager';

const features = [
  {
    icon: <Cpu className="text-[#00f0ff]" size={24} />,
    title: 'Automated Mining',
    description: 'AI-driven algorithm allocates hash power to the most profitable pools in real-time.',
    colSpan: 'lg:col-span-2',
    bgClass: 'bg-gradient-to-br from-[#111827] to-[#0a0e17]'
  },
  {
    icon: <BarChart3 className="text-[#0052ff]" size={24} />,
    title: 'Profit Tracking',
    description: 'Live dashboard with minute-by-minute analytics and predictive yield modeling.',
    colSpan: 'lg:col-span-1',
    bgClass: 'bg-card'
  },
  {
    icon: <Shield className="text-[#00f0ff]" size={24} />,
    title: 'Secure Wallet',
    description: 'Military-grade cold storage with multi-sig protection for your digital assets.',
    colSpan: 'lg:col-span-1',
    bgClass: 'bg-card'
  },
  {
    icon: <Globe className="text-[#00f0ff]" size={24} />,
    title: 'Global Network',
    description: 'Distributed mining nodes across 14 countries ensuring 99.99% uptime.',
    colSpan: 'lg:col-span-2',
    bgClass: 'bg-gradient-to-bl from-[#111827] to-[#0a0e17]'
  },
  {
    icon: <Zap className="text-[#0052ff]" size={24} />,
    title: 'Instant Withdrawals',
    description: 'Access your funds 24/7 with zero-delay automated withdrawal processing.',
    colSpan: 'lg:col-span-2',
    bgClass: 'bg-card'
  },
  {
    icon: <Wallet className="text-[#0052ff]" size={24} />,
    title: 'Auto-Compounding',
    description: 'Reinvest earnings automatically to accelerate your portfolio growth.',
    colSpan: 'lg:col-span-1',
    bgClass: 'bg-card'
  }
];

export default function Features() {
  const isDark = useIsDark();

  return (
    <section id="features" className="py-24 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.h2 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl md:text-5xl font-bold mb-4 tracking-tight cursor-default"
            >
              Platform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Capabilities</span>
            </motion.h2>
            <p className="text-secondary text-lg">Engineered for performance, security, and maximum yield generation in the Web3 ecosystem.</p>
          </div>
          <button className="px-6 py-3 rounded-full border border-border hover:bg-subtle transition-colors flex items-center gap-2 text-sm font-medium">
            View Documentation <ArrowUpRight size={16} />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-container">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.15)' : '0 0 30px rgba(0, 82, 255, 0.1)',
                borderColor: isDark ? 'rgba(0, 240, 255, 0.3)' : 'rgba(0, 82, 255, 0.3)'
              }}
              className={`p-8 rounded-3xl border border-border/50 transition-all group ${feature.colSpan} ${feature.bgClass} relative overflow-hidden tile`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-subtle rounded-full blur-3xl -mr-10 -mt-10 transition-opacity group-hover:opacity-100 opacity-0" />
              
              <div className="w-14 h-14 rounded-2xl bg-subtle border border-border flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <motion.h3 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-semibold mb-3 tracking-tight cursor-default"
              >
                {feature.title}
              </motion.h3>
              <p className="text-secondary text-base leading-relaxed max-w-md">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
