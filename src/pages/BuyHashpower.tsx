import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Cpu, Cloud, Zap, CheckCircle2, Sliders } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { db, doc, collection, runTransaction, serverTimestamp } from '../firebase';

const plans = {
  pool: [
    { id: 'p1', name: 'Starter Pool', hashpower: '10 TH/s', price: 150, dailyReturn: 1.2 },
    { id: 'p2', name: 'Pro Pool', hashpower: '50 TH/s', price: 650, dailyReturn: 1.5 },
  ],
  cloud: [
    { id: 'c1', name: 'Basic Cloud', hashpower: '5 TH/s', price: 100, dailyReturn: 1.0 },
    { id: 'c2', name: 'Advanced Cloud', hashpower: '25 TH/s', price: 450, dailyReturn: 1.3 },
  ],
  crypto: [
    { id: 'cr1', name: 'Altcoin Miner', hashpower: '100 MH/s', price: 200, dailyReturn: 1.4 },
    { id: 'cr2', name: 'DeFi Miner', hashpower: '500 MH/s', price: 800, dailyReturn: 1.8 },
  ]
};

export default function BuyHashpower() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'pool' | 'cloud' | 'crypto'>('pool');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [calcAmount, setCalcAmount] = useState(1000);

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

    if ((userData.balance || 0) < plan.price) {
      toast.error('Insufficient balance. Please deposit funds first.');
      return;
    }

    setIsPurchasing(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (currentBalance < plan.price) throw new Error('Insufficient balance');

        // Deduct balance
        transaction.update(userRef, { balance: currentBalance - plan.price });

        // Create contract
        const contractRef = doc(collection(db, 'contracts'));
        transaction.set(contractRef, {
          user_id: user.uid,
          plan_id: plan.id,
          plan_name: plan.name,
          type: activeTab,
          hashpower: plan.hashpower,
          price: plan.price,
          daily_return: plan.dailyReturn,
          status: 'active',
          start_date: serverTimestamp(),
          next_payout: new Date(Date.now() + 86400000) // 24 hours from now
        });

        // Create transaction record
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          user_id: user.uid,
          type: 'purchase',
          amount: plan.price,
          status: 'completed',
          description: `Purchased ${plan.name} (${plan.hashpower})`,
          timestamp: serverTimestamp()
        });
      });

      toast.success('Hashpower purchased successfully!');
      setSelectedPlan(null);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase.');
    } finally {
      setIsPurchasing(false);
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
          className="bg-surface border border-border rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold mb-2">Buy Hashpower</h1>
          <p className="text-secondary mb-8">Select a mining section and choose your desired hashpower plan.</p>

          {/* Tabs */}
          <div className="flex space-x-4 mb-8 border-b border-border pb-4">
            <button 
              onClick={() => setActiveTab('pool')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'pool' ? 'bg-[#0052ff] text-white' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Zap size={20} /> Pool Mining
            </button>
            <button 
              onClick={() => setActiveTab('cloud')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'cloud' ? 'bg-[#00f0ff] text-[#0a0a0a]' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Cloud size={20} /> Cloud Mining
            </button>
            <button 
              onClick={() => setActiveTab('crypto')}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-colors ${activeTab === 'crypto' ? 'bg-[#ff0055] text-white' : 'bg-background text-secondary hover:text-primary'}`}
            >
              <Cpu size={20} /> Crypto Mining
            </button>
          </div>

          {/* Mining Calculator */}
          <div className="bg-background border border-border rounded-2xl p-6 mb-8">
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
              <div className="bg-surface p-4 rounded-xl border border-border/50">
                <p className="text-xs text-secondary uppercase tracking-wider mb-1">Daily Profit</p>
                <p className="text-2xl font-bold text-emerald-400">${(calcAmount * 0.015).toFixed(2)}</p>
                <p className="text-[10px] text-secondary mt-1">Based on 1.5% avg. return</p>
              </div>
              <div className="bg-surface p-4 rounded-xl border border-border/50">
                <p className="text-xs text-secondary uppercase tracking-wider mb-1">Monthly Profit</p>
                <p className="text-2xl font-bold text-emerald-400">${(calcAmount * 0.015 * 30).toFixed(2)}</p>
                <p className="text-[10px] text-secondary mt-1">~{(calcAmount * 0.015 * 30 / 65000).toFixed(6)} BTC</p>
              </div>
            </div>
          </div>

          {/* Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {plans[activeTab].map((plan) => (
              <div 
                key={plan.id}
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
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-border pt-6">
            <button 
              onClick={handlePurchase}
              disabled={!selectedPlan || isPurchasing}
              className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-8 py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPurchasing ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Confirm Purchase'
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
