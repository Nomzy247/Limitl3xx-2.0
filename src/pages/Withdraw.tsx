import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Send, ShieldAlert, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { db, doc, collection, runTransaction, serverTimestamp, addDoc } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';

export default function Withdraw() {
  const { user, userData } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 2FA variables
  const [show2FA, setShow2FA] = useState(false);
  const [pin, setPin] = useState('');

  const [currency, setCurrency] = useState('BTC');

  const initiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    const withdrawAmount = parseFloat(amount);
    // Since everything is denominated in USD or BTC, we might need a conversion, but let's assume balance is what we use.
    // In a real application, you handle balances per currency. Here we'll treat `balance` as the primary account value.
    const currentBalance = userData.balance || 0;

    if (withdrawAmount < 500) {
      toast.error('Minimum withdrawal amount is $500.');
      return;
    }

    if (withdrawAmount > currentBalance) {
      toast.error('Insufficient balance');
      return;
    }
    
    if (!address || address.length < 10) {
      toast.error(`Please enter a valid ${currency} destination address`);
      return;
    }

    if (userData.two_factor_enabled) {
      setShow2FA(true);
    } else {
      executeWithdrawal();
    }
  };

  const executeWithdrawal = async () => {
    if (show2FA && pin.length < 6) {
      toast.error('Please enter the 6-digit confirmation code.');
      return;
    }
    
    // In a real app we'd verify the PIN/2FA here via the server.
    // For now, accept any 6 digits as valid simulator.
    setShow2FA(false);
    setIsSubmitting(true);
    
    try {
      const withdrawAmount = parseFloat(amount);
      const toastId = toast.loading('Submitting withdrawal request...');
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user!.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (withdrawAmount > currentBalance) throw new Error('Insufficient balance');

        // Create transaction record
        const txRef = doc(collection(db, 'transactions'));
        transaction.set(txRef, {
          user_id: user!.uid,
          type: 'withdrawal',
          amount: withdrawAmount,
          currency: currency,
          status: 'pending',
          address: address,
          timestamp: serverTimestamp()
        });

        // Deduct balance immediately
        transaction.update(userRef, { balance: currentBalance - withdrawAmount });
      });

      // Add Admin Notification outside transaction
      await addDoc(collection(db, 'notifications'), {
        type: 'withdrawal',
        userId: user!.uid,
        userName: user!.email || 'Unknown User',
        message: `New withdrawal of $${withdrawAmount} ${currency} initiated by ${user!.email}`,
        amount: withdrawAmount,
        currency: currency,
        address: address,
        timestamp: serverTimestamp(),
        read: false
      });

      toast.dismiss(toastId);
      toast.success('Withdrawal request submitted securely! Admin will review for approval.');
      setAmount('');
      setAddress('');
      setPin('');
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
      
      {/* 2FA Modal */}
      <AnimatePresence>
        {show2FA && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md p-6 rounded-3xl shadow-2xl border border-border/50 relative overflow-hidden"
            >
              <button 
                onClick={() => setShow2FA(false)}
                className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-4 border border-blue-500/20">
                  <ShieldAlert className="text-blue-500" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Security Verification</h3>
                <p className="text-sm text-secondary mb-6">
                  Please enter your 6-digit authenticator code or withdrawal PIN to confirm this transaction.
                </p>
                
                <div className="w-full space-y-4">
                  <div className="bg-surface rounded-xl p-4 border border-border mb-4 text-left">
                    <div className="flex justify-between text-xs text-secondary mb-1">
                      <span>Sending</span>
                      <span>Destination</span>
                    </div>
                    <div className="flex justify-between font-mono text-sm">
                      <span className="text-primary font-bold">{amount} BTC</span>
                      <span className="text-muted truncate w-32 text-right">{address.substring(0,6)}...{address.substring(address.length - 4)}</span>
                    </div>
                  </div>
                  
                  <input
                    type="password"
                    maxLength={6}
                    placeholder="Enter 6-digit code"
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#0052ff] transition-colors"
                  />
                  
                  <button 
                    onClick={executeWithdrawal}
                    className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-[#0052ff]/20"
                  >
                    Confirm & Send
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-3xl mx-auto">
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
          <h1 className="text-3xl font-bold mb-2">Withdraw Funds</h1>
          <p className="text-secondary mb-8">Transfer your earnings to an external wallet.</p>

          <form onSubmit={initiateWithdrawal} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Select Asset</label>
              <select 
                value={currency} 
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary text-sm focus:outline-none mb-6"
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT ERC-20)</option>
                <option value="SOL">Solana (SOL)</option>
              </select>
            </div>

            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-secondary mb-2">Amount (USD)</label>
              <input 
                type="number" 
                id="amount"
                step="any"
                min="500"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary focus:outline-none focus:border-[#0052ff] transition-colors font-mono"
                placeholder="0.00"
              />
              <p className="text-xs text-muted mt-2">Available Balance: {userData?.balance || 0} USD</p>
              <p className="text-xs text-secondary mt-1">Minimum withdrawal amounts to 500 USD equivalent.</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-secondary mb-2">Destination {currency} Address</label>
              <input 
                type="text" 
                id="address"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary font-mono text-sm focus:outline-none focus:border-[#0052ff] transition-colors"
                placeholder={`Enter a valid ${currency} address`}
              />
            </div>

            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={fluidSpring}
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
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
