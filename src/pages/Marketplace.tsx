import { motion } from 'motion/react';
import { ShoppingBag } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

export default function Marketplace() {
  const navigate = useNavigate();
  const hardware = [
    { id: 1, name: 'Antminer S19 Pro', algo: 'SHA-256', hashrate: '110 TH/s', power: '3250W', price: 4200 },
    { id: 2, name: 'Whatsminer M30S++', algo: 'SHA-256', hashrate: '112 TH/s', power: '3472W', price: 3900 },
    { id: 3, name: 'Innosilicon A10 Pro', algo: 'Ethash', hashrate: '500 MH/s', power: '950W', price: 2100 },
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
                <div className="flex justify-between"><span>Hashrate:</span> <span>{item.hashrate}</span></div>
                <div className="flex justify-between"><span>Power Consumption:</span> <span>{item.power}</span></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end">
                <div className="text-2xl font-bold mb-4">${item.price.toLocaleString()}</div>
                {item.id === 1 && <span className="text-[10px] text-emerald-400 font-bold uppercase mb-4 px-2 py-1 bg-emerald-500/10 rounded">In Stock</span>}
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
