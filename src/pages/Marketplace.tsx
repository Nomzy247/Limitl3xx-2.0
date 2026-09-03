import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Marketplace() {
  const navigate = useNavigate();
  const hardware = [
    { id: 1, name: 'Antminer S21 Pro', algo: 'SHA-256', hashrate: '234 TH/s', power: '3510W', price: 6150, efficiency: '15.0 J/TH', badge: 'Best Seller' },
    { id: 2, name: 'Whatsminer M60S', algo: 'SHA-256', hashrate: '186 TH/s', power: '3441W', price: 4950, efficiency: '18.5 J/TH', badge: 'High Durability' },
    { id: 3, name: 'Kaspa KS5 Pro', algo: 'kHeavyHash', hashrate: '21 TH/s', power: '3150W', price: 8400, efficiency: '150 J/TH', badge: 'High Yield' },
    { id: 4, name: 'Antminer L9 (Scrypt)', algo: 'Scrypt (LTC/DOGE)', hashrate: '16 GH/s', power: '3360W', price: 7200, efficiency: '0.21 J/MH', badge: 'Dual Mining' },
    { id: 5, name: 'Antminer S21 Hydro', algo: 'SHA-256 Liquid', hashrate: '335 TH/s', power: '5360W', price: 9800, efficiency: '16.0 J/TH', badge: 'Hydro Immersion' },
    { id: 6, name: 'NVIDIA HGX H100 Cluster', algo: 'AI Compute & PoW', hashrate: '8x H100 SXM5', power: '5600W', price: 34500, efficiency: 'Tensor Float FP8', badge: 'AI Institutional' },
  ];

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-primary p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
          <ShoppingBag className="text-[#0052ff]" /> Mining Hardware Marketplace
        </h1>
        <p className="text-secondary mt-2 text-sm leading-relaxed">Purchase and host physical hardware for your mining operation.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hardware.map((item, index) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: index * 0.1 }}
            className="bg-card border border-border/50 rounded-2xl p-6 shadow-md flex flex-col justify-between hover:shadow-lg hover:border-[#0052ff]/50 transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-lg">{item.name}</h3>
                <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-primary/10 text-primary">{item.algo}</span>
              </div>
              <img src={`https://picsum.photos/seed/${item.id}/400/300`} alt={item.name} className="w-full h-40 object-cover rounded-xl mb-4 opacity-80" />
              <div className="space-y-2 text-sm text-secondary mb-6">
                <div className="flex justify-between"><span>Hashrate:</span> <span className="font-semibold text-primary">{item.hashrate}</span></div>
                <div className="flex justify-between"><span>Power / Efficiency:</span> <span className="font-semibold text-primary">{item.power} ({item.efficiency})</span></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="text-2xl font-bold">${item.price.toLocaleString()}</div>
                  <span className="text-xs text-secondary">Free Hosting & Setup</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] text-emerald-400 font-bold uppercase px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <button 
                onClick={() => {
                  toast.success(`Preparing checkout for ${item.name}...`);
                   setTimeout(() => {
                    navigate('/deposit');
                   }, 1500);
                }}
                className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-semibold py-3 rounded-xl transition-all active:scale-95 text-sm"
              >
                Purchase & Host
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
