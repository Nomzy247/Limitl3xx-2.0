import React from 'react';
import { motion } from 'motion/react';
import { History, Search, Filter, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';
import { db, collection, query, where, orderBy, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <button className="p-2 bg-card border border-border rounded-full hover:bg-subtle transition-colors">
            <Filter size={20} />
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
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
                <th className="p-6 font-medium">Description</th>
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
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-subtle transition-colors group">
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
                      {new Date(tx.timestamp).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="p-6">
                      <span className={`font-bold ${
                        tx.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="p-6">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase ${
                        tx.status === 'approved' || tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                        tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-rose-500/20 text-rose-400'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-6 text-muted text-sm">
                      {tx.description || `Transaction for ${tx.type}`}
                    </td>
                  </tr>
                ))
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
