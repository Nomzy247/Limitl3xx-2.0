import React from 'react';
import { motion } from 'motion/react';
import { History, Search, Filter, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import { fluidSpring } from '../components/SystemManager';

export default function Transactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transaction History</h1>
          <p className="text-secondary mt-1">Monitor all your financial activities on the platform.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
            <input 
              type="text" 
              placeholder="Search transactions..."
              className="pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:border-[#0052ff] transition-colors"
            />
          </div>
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            transition={fluidSpring}
            className="p-2 bg-card border border-border rounded-full hover:bg-subtle transition-colors"
          >
            <Filter size={20} />
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -5, scale: 1.005 }}
        transition={fluidSpring}
        className="bg-card rounded-3xl border border-border/50 overflow-hidden shadow-xl"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border/50 text-secondary text-sm">
                <th className="p-6 font-medium">Type</th>
                <th className="p-6 font-medium">Date</th>
                <th className="p-6 font-medium">Amount</th>
                <th className="p-6 font-medium">Status</th>
                <th className="p-6 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="w-8 h-8 border-4 border-[#0052ff] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : transactions.length > 0 ? (
                transactions.map((tx) => {
                  const isPositive = tx.type !== 'withdrawal';
                  // Mock confirmations based on status
                  const confirmations = tx.status === 'completed' || tx.status === 'approved' ? '12+ Confirmed' : 
                                        tx.status === 'pending' ? '2/12 Confirmations' : 'Failed';
                  
                  return (
                  <motion.tr 
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.02)', x: 5 }}
                    transition={fluidSpring}
                    key={tx.id} 
                    className="hover:bg-subtle transition-colors group cursor-pointer"
                  >
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.type === 'withdrawal' ? 'bg-rose-500/10 text-rose-400' :
                          'bg-[#00f0ff]/10 text-[#00f0ff]'
                        }`}>
                          {tx.type === 'deposit' ? <ArrowDownRight size={18} /> :
                           tx.type === 'withdrawal' ? <ArrowUpRight size={18} /> :
                           <Activity size={18} />}
                        </div>
                        <span className="font-semibold capitalize">{tx.type}</span>
                      </div>
                    </td>
                    <td className="p-6 text-muted text-sm">
                      {tx.timestamp ? 
                        (typeof tx.timestamp.toDate === 'function' ? tx.timestamp.toDate() : 
                         tx.timestamp.seconds ? new Date(tx.timestamp.seconds * 1000) : 
                         new Date(tx.timestamp)).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Pending...'}
                    </td>
                    <td className="p-6">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                          {isPositive ? '+' : '-'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {/* Visual indicator for balance change */}
                        <div className={`w-1.5 h-1.5 rounded-full ${isPositive ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase w-fit ${
                          tx.status === 'approved' || tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                          tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {tx.status}
                        </span>
                        <span className="text-[10px] text-muted">{confirmations}</span>
                      </div>
                    </td>
                    <td className="p-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-sm text-secondary">{tx.description || `Transaction for ${tx.type}`}</span>
                        <div className="flex items-center gap-2 text-[10px] text-muted font-mono">
                          <span>ID: {tx.id.substring(0, 8)}...</span>
                          <a 
                            href={`https://mempool.space/tx/${tx.id}`} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="text-[#00f0ff] hover:underline flex items-center gap-0.5"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Explorer <ArrowUpRight size={10} />
                          </a>
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                )})
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-muted">
                    <History className="mx-auto mb-4 opacity-20" size={48} />
                    <p>No transactions found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
