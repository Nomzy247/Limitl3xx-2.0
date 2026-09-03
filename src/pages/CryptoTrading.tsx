import { useState } from 'react';
import { motion } from 'motion/react';
import { RefreshCw } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';
import SmartBatteryEnergyHub from '../components/SmartBatteryEnergyHub';

export default function CryptoTrading() {
  const [fromAsset, setFromAsset] = useState('USDT');
  const [toAsset, setToAsset] = useState('BTC');

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-primary p-4 md:p-8 flex justify-center items-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={fluidSpring}
        className="w-full max-w-md bg-card border border-border/50 rounded-3xl p-6 shadow-2xl"
      >
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tighter">Spot Swap</h1>
            <p className="text-secondary text-sm">Instantly convert between assets</p>
          </div>
          <SmartBatteryEnergyHub variant="compact" />
        </header>

        <div className="space-y-4">
          <div className="bg-surface rounded-2xl p-4 border border-border/50">
            <div className="flex justify-between text-xs text-secondary mb-2">
              <span>From</span>
              <span>Balance: 14,250.00</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <input type="text" placeholder="0.00" className="bg-transparent outline-none font-bold w-1/2" defaultValue="5000" />
              <select className="bg-background px-3 py-1.5 rounded-lg text-sm font-semibold border border-border outline-none" value={fromAsset} onChange={(e) => setFromAsset(e.target.value)}>
                <option>USDT</option>
                <option>BTC</option>
                <option>ETH</option>
              </select>
            </div>
          </div>

          <div className="flex justify-center -my-2 relative z-10">
            <button className="bg-card p-2 rounded-full border border-border text-secondary hover:text-primary transition-colors">
              <RefreshCw size={20} />
            </button>
          </div>

          <div className="bg-surface rounded-2xl p-4 border border-border/50">
            <div className="flex justify-between text-xs text-secondary mb-2">
              <span>To</span>
              <span>Balance: 0.15</span>
            </div>
            <div className="flex justify-between items-center text-xl">
              <input type="text" placeholder="0.00" className="bg-transparent outline-none font-bold w-1/2 text-emerald-400" readOnly value="0.0775" />
              <select className="bg-background px-3 py-1.5 rounded-lg text-sm font-semibold border border-border outline-none" value={toAsset} onChange={(e) => setToAsset(e.target.value)}>
                <option>BTC</option>
                <option>USDT</option>
                <option>ETH</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-between text-xs font-semibold">
            <span className="text-secondary">Expected Price</span>
            <span>1 BTC = 64,500.00 USDT</span>
          </div>

          <button className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold py-4 rounded-xl transition-all active:scale-95 mt-4">
            Swap Assets
          </button>
        </div>
      </motion.div>
    </div>
  );
}
