import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion, animate } from 'motion/react';
import { Activity, Server } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { fluidSpring } from '../components/SystemManager';

export default function PoolMining() {
  const { user, userData } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const navigate = useNavigate();

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

  const totalHashrate = contracts.reduce((acc, curr) => acc + parseFloat(curr.hashpower || '0'), 0);
  const totalMined = contracts.reduce((acc, curr) => acc + (curr.mined || 0), 0);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-background text-primary p-4 md:p-8">
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

      <div className="bg-card border border-border/50 rounded-3xl p-6 shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Active Pool Allocations</h3>
          <button onClick={() => navigate('/buy-hashpower')} className="bg-[#0052ff] text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-[#0052ff]/90 transition">
             Connect New Worker
          </button>
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
                      <td className="py-4 text-[#00f0ff] font-medium">+{plan.dailyReturn || 0}%</td>
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
    </div>
  );
}
