import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { db, doc, collection, runTransaction, serverTimestamp } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Withdraw() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    const withdrawAmount = parseFloat(amount);
    const currentBtcBalance = userData.balance || 0;

    if (withdrawAmount > currentBtcBalance) {
      toast.error('Insufficient BTC balance');
      return;
    }

    setIsSubmitting(true);
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (withdrawAmount > currentBalance) throw new Error('Insufficient balance');

        // Create transaction record
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          user_id: user.uid,
          type: 'withdrawal',
          amount: withdrawAmount,
          status: 'pending',
          address: address,
          timestamp: serverTimestamp()
        });

        // Deduct balance immediately
        transaction.update(userRef, { balance: currentBalance - withdrawAmount });
      });

      toast.success('Withdrawal request submitted successfully!');
      setAmount('');
      setAddress('');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      toast.error(error.message || 'Failed to submit withdrawal request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-muted hover:text-primary transition-colors mb-8">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-surface border border-border rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-secondary mb-8">Transfer your earnings to an external wallet.</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-secondary mb-2">Amount (BTC)</label>
              <input 
                type="number" 
                id="amount"
                step="0.00000001"
                min="0.001"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                placeholder="0.00"
              />
              <p className="text-xs text-muted mt-2">Minimum withdrawal: 0.001 BTC</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-secondary mb-2">Destination BTC Address</label>
              <input 
                type="text" 
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                placeholder="Enter a valid Bitcoin address"
              />
            </div>

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={20} /> Request Withdrawal
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
