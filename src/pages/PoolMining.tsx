import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Server, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { db, doc, collection, query, where, orderBy, onSnapshot, runTransaction, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { fluidSpring } from '../components/SystemManager';
import LowPowerMiningBanner from '../components/LowPowerMiningBanner';

export default function PoolMining() {
  const { user, userData } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [settings, setSettings] = useState({ global_profit_margin: 15, costings: { pool: 150 } });
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null);
  const [confirmPlan, setConfirmPlan] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'global'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSettings({
          global_profit_margin: data.global_profit_margin || 15,
          costings: data.costings || { pool: 150 }
        });
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('user_id', '==', user.uid),
      where('type', '==', 'pool'),
      orderBy('start_date', 'desc')
    );

    const unsubscribe = onSnapshot(contractsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContracts(data);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'contracts'));
    return () => unsubscribe();
  }, [user]);

  const plans = [
    { id: 'p1', name: 'Starter Pool', hashpower: '10 TH/s', price: settings.costings.pool, dailyReturn: (settings.global_profit_margin / 10).toFixed(1) },
    { id: 'p2', name: 'Pro Pool', hashpower: '50 TH/s', price: settings.costings.pool * 4.3, dailyReturn: (settings.global_profit_margin / 8).toFixed(1) },
    { id: 'p3', name: 'Elite Pool', hashpower: '100 TH/s', price: settings.costings.pool * 8, dailyReturn: (settings.global_profit_margin / 6).toFixed(1) }
  ];

  const handlePurchase = (plan: any) => {
    if (!user || !userData) {
      toast.error('Please login to purchase hashpower.');
      return;
    }

    const price = Number(plan.price);
    if ((userData.balance || 0) < price) {
      toast.error('Insufficient balance. Please deposit funds first.');
      return;
    }

    setConfirmPlan(plan);
  };

  const executePurchase = async () => {
    if (!user || !userData || !confirmPlan) return;
    const plan = confirmPlan;
    const price = Number(plan.price);
    
    setIsPurchasing(plan.id);
    try {
      const contractRef = doc(collection(db, 'contracts'));
      const txRef = doc(collection(db, 'transactions'));

      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (currentBalance < price) throw new Error('Insufficient balance');

        transaction.update(userRef, { balance: currentBalance - price });

        transaction.set(contractRef, {
          user_id: user.uid,
          plan_id: plan.id,
          plan_name: plan.name,
          type: 'pool',
          hashpower: plan.hashpower,
          price: price,
          daily_return: Number(plan.dailyReturn),
          status: 'active',
          start_date: serverTimestamp(),
          next_payout: new Date(Date.now() + 86400000)
        });

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
      setConfirmPlan(null);
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to complete purchase.');
    } finally {
      setIsPurchasing(null);
      setConfirmPlan(null);
    }
  };

  const totalHashrate = contracts.reduce((acc, curr) => acc + parseFloat(curr.hashpower || '0'), 0);
  const totalMined = contracts.reduce((acc, curr) => acc + (curr.mined || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-primary p-4 md:p-8">
      {/* Low Battery Warning Banner During Active Mining Operations */}
      <div className="mb-6">
        <LowPowerMiningBanner 
          hasActiveMining={contracts.filter(c => c.status === 'active').length > 0 || contracts.length > 0} 
          activeMiningCount={contracts.filter(c => c.status === 'active').length || contracts.length} 
        />
      </div>

      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tighter flex items-center gap-3">
          <Server className="text-[#0052ff]" /> Pool Mining
        </h1>
        <p className="text-secondary mt-2 text-sm leading-relaxed">Allocate hashpower and track your active pool miners.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={fluidSpring} className="bg-card border border-border/50 rounded-2xl p-6 shadow-md">
          <p className="text-xs text-secondary uppercase mb-2">Total Pool Hashrate</p>
          <div className="text-3xl font-bold text-primary">{totalHashrate.toFixed(2)} TH/s</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{...fluidSpring, delay: 0.1}} className="bg-card border border-border/50 rounded-2xl p-6 shadow-md">
          <p className="text-xs text-secondary uppercase mb-2">Active Pool Workers</p>
          <div className="text-3xl font-bold text-emerald-400">{contracts.filter(c => c.status === 'active').length}</div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{...fluidSpring, delay: 0.2}} className="bg-card border border-border/50 rounded-2xl p-6 shadow-md">
          <p className="text-xs text-secondary uppercase mb-2">Total Mined (Pool)</p>
          <div className="text-3xl font-bold text-[#00f0ff]">${totalMined.toFixed(2)}</div>
        </motion.div>
      </div>

      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg mb-10">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Active Pool Allocations</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-secondary text-sm">
                  <th className="pb-4 font-medium">Worker Name</th>
                  <th className="pb-4 font-medium">Hashpower</th>
                  <th className="pb-4 font-medium">Daily ROI</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length > 0 ? (
                  contracts.map((plan) => (
                    <tr key={plan.id} className="border-b border-border/50 last:border-0 hover:bg-subtle transition-colors">
                      <td className="py-4 font-semibold text-primary capitalize">{plan.type} #{(plan.id).substring(0,6)}</td>
                      <td className="py-4 text-muted">{plan.hashpower}</td>
                      <td className="py-4 text-[#00f0ff] font-medium">+{plan.daily_return || plan.dailyReturn || 0}%</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/20 text-muted'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted">No active pool workers found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>

      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-6">Purchase Hash Power</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div 
              key={plan.id}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={fluidSpring}
              className="p-6 rounded-2xl border-2 border-border bg-card shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-primary">{plan.name}</h3>
                  <Zap className="text-[#0052ff]" size={24} />
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-secondary text-sm">Hashpower:</span> 
                    <span className="font-bold text-primary">{plan.hashpower}</span>
                  </div>
                  <div className="flex justify-between border-b border-border/50 pb-2">
                    <span className="text-secondary text-sm">Est. Daily Return:</span> 
                    <span className="font-bold text-[#00f0ff]">~{plan.dailyReturn}%</span>
                  </div>
                  <div className="flex justify-between pb-2">
                    <span className="text-secondary text-sm">Price:</span> 
                    <span className="font-bold text-emerald-400">${plan.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                  </div>
                </div>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePurchase(plan)}
                disabled={isPurchasing === plan.id}
                className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPurchasing === plan.id ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  'Buy Now'
                )}
              </motion.button>
            </motion.div>
          ))}
        </div>
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
                disabled={isPurchasing !== null}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-primary hover:bg-subtle transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={executePurchase}
                disabled={isPurchasing !== null}
                className="flex-1 py-3 px-4 rounded-xl bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold transition-colors disabled:opacity-50 flex justify-center items-center"
              >
                {isPurchasing !== null ? (
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
