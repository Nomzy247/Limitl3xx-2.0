import { motion } from 'motion/react';

const sponsors = [
  'Stripe', 'PayPal', 'Visa', 'Mastercard', 'Coinbase', 'Binance', 'Kraken', 'Gemini'
];

export default function Sponsors() {
  return (
    <section className="py-12 border-y border-border/50 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p 
          whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-center text-sm text-muted font-bold tracking-widest uppercase mb-8 cursor-default"
        >
          Trusted by Industry Leaders
        </motion.p>
        
        <div className="relative flex overflow-x-hidden group">
          <div className="animate-marquee whitespace-nowrap flex items-center gap-16 md:gap-24">
            {[...sponsors, ...sponsors].map((sponsor, index) => (
              <motion.span 
                key={index} 
                whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'], scale: 1.1, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-3xl md:text-4xl font-bold text-primary opacity-60 transition-all cursor-default"
              >
                {sponsor}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
