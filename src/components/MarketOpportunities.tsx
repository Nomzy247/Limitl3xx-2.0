import { motion } from 'motion/react';
import { TrendingUp, Activity, Coins, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router';
import { fluidSpring } from './SystemManager';

const marketData = [
  {
    category: 'Yield Pool',
    icon: <Activity size={20} className="text-[#00f0ff]" />,
    items: [
      { name: 'USDT Liquidity', change: '+4.2%', value: '12.5% APY', positive: true },
      { name: 'ETH Staking', change: '+2.8%', value: '4.8% APY', positive: true },
    ]
  },
  {
    category: 'Crypto',
    icon: <Coins size={20} className="text-[#0052ff]" />,
    items: [
      { name: 'Bitcoin (BTC)', change: '+1.5%', value: '$65,240', positive: true },
      { name: 'Solana (SOL)', change: '+5.4%', value: '$145.20', positive: true },
    ]
  },
  {
    category: 'Stocks (Tokenized)',
    icon: <TrendingUp size={20} className="text-emerald-400" />,
    items: [
      { name: 'NVIDIA (NVDA)', change: '+3.2%', value: '$850.10', positive: true },
      { name: 'MicroStrategy', change: '+6.1%', value: '$1,240', positive: true },
    ]
  }
];

export default function MarketOpportunities() {
  return (
    <section className="py-16 bg-surface relative overflow-hidden border-y border-border/50">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-[#00f0ff] rounded-full blur-[200px] opacity-5 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2 tracking-tight">Market <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Opportunities</span></h2>
            <p className="text-secondary">Best performing assets to hold (3-hour timeframe)</p>
          </div>
          
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-[#0052ff]/10 to-[#00f0ff]/10 border border-[#00f0ff]/30 rounded-2xl p-4 flex items-center gap-4 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0052ff] to-[#00f0ff] flex items-center justify-center shrink-0">
              <Sparkles size={20} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary">New User Promo</p>
              <p className="text-xs text-secondary">Get <span className="text-[#00f0ff] font-bold">20% Bonus Yield</span> on your first 24 hours!</p>
            </div>
            <Link to="/signup" className="ml-2 px-4 py-2 bg-primary text-background text-xs font-bold rounded-full hover:scale-105 transition-transform whitespace-nowrap">
              Claim Now
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {marketData.map((category, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ ...fluidSpring, delay: idx * 0.1 }}
              className="bg-card border border-border/50 rounded-2xl p-6 hover:border-border transition-colors"
            >
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shadow-sm">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-lg">{category.category}</h3>
              </div>
              
              <div className="space-y-4">
                {category.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center group">
                    <div>
                      <p className="font-medium text-primary group-hover:text-[#00f0ff] transition-colors">{item.name}</p>
                      <p className="text-sm text-muted">{item.value}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-bold ${item.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.change}
                      </p>
                      <p className="text-[10px] text-muted uppercase tracking-wider">in 3h</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
