import { motion } from 'motion/react';
import { UserPlus, Wallet, Activity, ArrowRight } from 'lucide-react';
import { useIsDark } from '../hooks/useIsDark';

const steps = [
  {
    icon: <UserPlus className="text-[#00f0ff]" size={32} />,
    title: 'Create Account',
    description: 'Sign up in under 2 minutes. Verify your identity to ensure compliance and security.'
  },
  {
    icon: <Wallet className="text-[#0052ff]" size={32} />,
    title: 'Select Plan',
    description: 'Choose from our range of institutional-grade mining contracts tailored to your goals.'
  },
  {
    icon: <Activity className="text-[#00f0ff]" size={32} />,
    title: 'Earn Daily',
    description: 'Watch your dashboard as our AI allocates hash power and deposits daily yields directly to your wallet.'
  }
];

export default function Processes() {
  const isDark = useIsDark();

  return (
    <section id="process" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#00f0ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <motion.h2 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-4xl md:text-5xl font-bold mb-6 tracking-tight cursor-default"
          >
            How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Works</span>
          </motion.h2>
          <p className="text-secondary text-lg">A streamlined process designed for maximum efficiency and ease of use.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-[#0052ff]/20 via-[#00f0ff]/50 to-[#0052ff]/20 -translate-y-1/2 z-0" />
          
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: index * 0.2, ease: "easeOut" }}
              whileHover={{ 
                scale: 1.05,
              }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              <motion.div 
                whileHover={{ 
                  boxShadow: isDark ? '0 0 30px rgba(0, 240, 255, 0.3)' : '0 0 30px rgba(0, 82, 255, 0.2)',
                  borderColor: isDark ? 'rgba(0, 240, 255, 0.5)' : 'rgba(0, 82, 255, 0.5)'
                }}
                className="w-24 h-24 rounded-full bg-card border border-border flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,82,255,0.15)] relative transition-all"
              >
                <div className="absolute inset-2 rounded-full border border-border/50" />
                {step.icon}
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0052ff] text-primary flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
              </motion.div>
              <motion.h3 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-2xl font-bold text-primary mb-4 cursor-default"
              >
                {step.title}
              </motion.h3>
              <p className="text-secondary leading-relaxed max-w-xs">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
