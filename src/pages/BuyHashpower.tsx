import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Cpu, Cloud, Zap, CheckCircle2, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { db, doc, collection, runTransaction, serverTimestamp, onSnapshot } from '../firebase';
import { fluidSpring } from '../components/SystemManager';

export default function BuyHashpower() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pool' | 'cloud' | 'crypto'>('pool');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<any>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [calcAmount, setCalcAmount] = useState(1000);
  
  const [settings, setSettings] = useState({
    global_profit_margin: 15,
    costings: { pool: 150, cloud: 100, crypto: 200 }
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          global_profit_margin: data.global_profit_margin || 15,
          costings: data.costings || { pool: 150, cloud: 100, crypto: 200 }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const plans = {
    pool: [
      { id: 'p1', name: 'Starter Pool', hashpower: '10 TH/s', price: settings.costings.pool, dailyReturn: (settings.global_profit_margin / 10).toFixed(1) },
      { id: 'p2', name: 'Pro Pool', hashpower: '50 TH/s', price: settings.costings.pool * 4.3, dailyReturn: (settings.global_profit_margin / 8).toFixed(1) },
    ],
    cloud: [
      { id: 'c1', name: 'Basic Cloud', hashpower: '5 TH/s', price: settings.costings.cloud, dailyReturn: (settings.global_profit_margin / 12).toFixed(1) },
      { id: 'c2', name: 'Advanced Cloud', hashpower: '25 TH/s', price: settings.costings.cloud * 4.5, dailyReturn: (settings.global_profit_margin / 9).toFixed(1) },
    ],
    crypto: [
      { id: 'cr1', name: 'Altcoin Miner', hashpower: '100 MH/s', price: settings.costings.crypto, dailyReturn: (settings.global_profit_margin / 11).toFixed(1) },
      { id: 'cr2', name: 'DeFi Miner', hashpower: '500 MH/s', price: settings.costings.crypto * 4, dailyReturn: (settings.global_profit_margin / 7).toFixed(1) },
    ]
  };

  const handlePurchase = async () => {
    if (!user || !userData) {
      toast.error('Please login to purchase hashpower.');
      return;
    }

    if (!selectedPlan) {
      toast.error('Please select a plan first.');
      return;
    }

    const plan = plans[activeTab].find(p => p.id === selectedPlan);
    if (!plan) return;

    const price = Number(plan.price);

    if ((userData.balance || 0) < price) {
      toast.error('Insufficient balance. Please deposit funds first.');
      return;
    }

    setConfirmPlan(plan);
  };

  const executePurchase = async () => {
    if (!user || !confirmPlan) return;
    const plan = confirmPlan;
    const price = Number(plan.price);
    
    setIsPurchasing(true);
    try {
      const contractRef = doc(collection(db, 'contracts'));
      const txRef = doc(collection(db, 'transactions'));
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (currentBalance < price) throw new Error('Insufficient balance');

        // Deduct balance
        transaction.update(userRef, { balance: currentBalance - price });

        // Create contract
        transaction.set(contractRef, {
          user_id: user.uid,
          plan_id: plan.id,
          plan_name: plan.name,
          type: activeTab,
          hashpower: plan.hashpower,
          price: price,
          daily_return: Number(plan.dailyReturn),
          status: 'active',
          start_date: serverTimestamp(),
          next_payout: new Date(Date.now() + 86400000) // 24 hours from now
        });

        // Create transaction record
        transaction.set(txRef, {
          user_id: user.uid,
          type: 'purchase',
          amount: price,
          status: 'completed',
          description: `Purchased ${plan.name} (${plan.hashpower})`,
          timestamp: serverTimestamp()
        });
      });

      toast.success('Hashpower purchased successfully!');
      setSelectedPlan(null);
      setConfirmPlan(null);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase.');
    } finally {
      setIsPurchasing(false);
      setConfirmPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="bg-surface border border-border rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold mb-2">Buy Hashpower</h1>
          <p className="text-secondary mb-8">Select a mining section and choose your desired hashpower plan.</p>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-border pb-4">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={fluidSpring}
              onClick={() => setActiveTab('pool')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'pool' ? 'bg-[#0052ff] text-white' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Zap size={20} /> Pool Mining
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={fluidSpring}
              onClick={() => setActiveTab('cloud')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'cloud' ? 'bg-[#00f0ff] text-[#0a0a0a]' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Cloud size={20} /> Cloud Mining
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={fluidSpring}
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'crypto' ? 'bg-[#ff0055] text-white' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Cpu size={20} /> Crypto Mining
            </motion.button>
          </div>

          {/* Mining Calculator */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.01 }}
            transition={fluidSpring}
            className="bg-background border border-border rounded-2xl p-6 mb-8 shadow-lg"
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sliders className="text-primary" size={20} /> Profit Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Investment Amount ($)</label>
                <input 
                  type="number" 
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value))}
                  className="w-full bg-surface border border-border rounded-xl px-4 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={fluidSpring}
                className="bg-surface p-4 rounded-xl border border-border/50"
              >
                <p className="text-xs text-secondary uppercase tracking-wider mb-1">Daily Profit</p>
                <p className="text-2xl font-bold text-emerald-400">${(calcAmount * 0.015).toFixed(2)}</p>
                <p className="text-[10px] text-secondary mt-1">Based on 1.5% avg. return</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                transition={fluidSpring}
                className="bg-surface p-4 rounded-xl border border-border/50"
              >
                <p className="text-xs text-secondary uppercase tracking-wider mb-1">Monthly Profit</p>
                <p className="text-2xl font-bold text-emerald-400">${(calcAmount * 0.015 * 30).toFixed(2)}</p>
                <p className="text-[10px] text-secondary mt-1">~{(calcAmount * 0.015 * 30 / 65000).toFixed(6)} BTC</p>
              </motion.div>
            </div>
          </motion.div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {plans[activeTab].map((plan) => (
              <motion.div 
                key={plan.id}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={fluidSpring}
                onClick={() => setSelectedPlan(plan.id)}
                className={`p-6 rounded-2xl border-2 cursor-pointer transition-all ${selectedPlan === plan.id ? 'border-[#0052ff] bg-[#0052ff]/5' : 'border-border bg-background hover:border-muted'}`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {selectedPlan === plan.id && <CheckCircle2 className="text-[#0052ff]" size={24} />}
                </div>
                <div className="space-y-2 mb-6">
                  <p className="text-secondary flex justify-between"><span>Hashpower:</span> <span className="font-mono text-primary">{plan.hashpower}</span></p>
                  <p className="text-secondary flex justify-between"><span>Daily Return:</span> <span className="font-mono text-[#00f0ff]">~{plan.dailyReturn}%</span></p>
                  <p className="text-secondary flex justify-between"><span>Cost:</span> <span className="font-mono text-primary">${plan.price}</span></p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={fluidSpring}
              onClick={handlePurchase}
              disabled={!selectedPlan || isPurchasing}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPurchasing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Confirm Purchase'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {confirmPlan && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-3xl p-8 max-w-md w-full shadow-2xl relative"
          >
            <h2 className="text-2xl font-bold mb-6">Confirm Purchase</h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-secondary">Plan</span>
                <span className="font-bold text-primary">{confirmPlan.name}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-secondary">Hashpower</span>
                <span className="font-bold text-primary">{confirmPlan.hashpower}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-border/50">
                <span className="text-secondary">Est. Daily Return</span>
                <span className="font-bold text-[#00f0ff]">~{confirmPlan.dailyReturn}%</span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-secondary">Total Cost</span>
                <span className="text-xl font-bold text-emerald-400">
                  ${confirmPlan.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </span>
              </div>
            </div>

            <p className="text-sm text-secondary mb-8 text-center pb-4 border-b border-border/10">
              The amount will be deducted from your current dashboard balance.
            </p>

            <div className="flex gap-4">
              <button 
                onClick={() => setConfirmPlan(null)}
                disabled={isPurchasing}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-primary hover:bg-subtle transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executePurchase}
                disabled={isPurchasing}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isPurchasing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Confirm Order'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
