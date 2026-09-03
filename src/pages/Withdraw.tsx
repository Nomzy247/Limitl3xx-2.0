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
  
  // 2FA and Confirmation variables
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pin, setPin] = useState('');

  const [currency, setCurrency] = useState('BTC');

  const initiateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    const withdrawAmount = parseFloat(amount);
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

    setShowConfirmation(true);
  };

  const executeWithdrawal = async () => {
    if (userData?.two_factor_enabled && pin.length < 6) {
      toast.error('Please enter the 6-digit confirmation code.');
      return;
    }
    
    setShowConfirmation(false);
    setIsSubmitting(true);
    const toastId = toast.loading('Submitting withdrawal request...');
    
    try {
      const withdrawAmount = parseFloat(amount);
      
      const txRef = doc(collection(db, 'transactions'));
      
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', user!.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw new Error('User not found');
        
        const currentBalance = userSnap.data().balance || 0;
        if (withdrawAmount > currentBalance) throw new Error('Insufficient balance');

        // Create transaction record
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
      toast.dismiss(toastId);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      
      {/* Confirmation & 2FA Modal */}
      <AnimatePresence>
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card w-full max-w-md max-h-[90vh] overflow-y-auto p-6 rounded-3xl shadow-2xl border border-border/50 relative"
            >
              <button 
                onClick={() => setShowConfirmation(false)}
                className="absolute top-4 right-4 text-secondary hover:text-primary transition-colors z-10"
              >
                <X size={20} />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-[#0052ff]/10 rounded-full flex items-center justify-center mb-4 border border-[#0052ff]/20">
                  <ShieldAlert className="text-[#0052ff]" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Confirm Withdrawal</h3>
                <p className="text-sm text-secondary mb-6">
                  Please review the details below before submitting.
                </p>
                
                <div className="w-full space-y-4 mb-6">
                  <div className="bg-surface rounded-xl p-4 border border-border text-left">
                    <p className="text-secondary text-sm mb-1">Amount</p>
                    <p className="text-primary font-bold text-xl">${amount} <span className="text-sm text-secondary font-normal">({currency})</span></p>
                  </div>
                  
                  <div className="bg-surface rounded-xl p-4 border border-border text-left">
                    <p className="text-secondary text-sm mb-1">Destination Address</p>
                    <p className="text-primary font-mono text-sm break-all">{address}</p>
                  </div>
                </div>
                
                {userData?.two_factor_enabled && (
                  <div className="w-full space-y-4 mb-6">
                    <p className="text-sm text-secondary">
                      Please enter your 6-digit authenticator code or PIN to confirm.
                    </p>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Enter 6-digit code"
                      value={pin}
                      onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-center text-xl tracking-[0.5em] font-mono focus:outline-none focus:border-[#0052ff] transition-colors"
                    />
                  </div>
                )}
                
                <div className="w-full flex gap-3">
                  <button 
                    onClick={() => setShowConfirmation(false)}
                    className="flex-1 bg-surface border border-border hover:bg-subtle text-primary font-bold py-3 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={executeWithdrawal}
                    className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-[#0052ff]/20"
                  >
                    Confirm
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
                <option value="BTC">Bitcoin (BTC - Native SegWit)</option>
                <option value="USDT-TRC20">Tether USDT (TRC-20 Fast)</option>
                <option value="USDT-ERC20">Tether USDT (ERC-20)</option>
                <option value="ETH">Ethereum (ETH - ERC-20)</option>
                <option value="SOL">Solana (SOL - SPL)</option>
                <option value="TON">Toncoin (TON Network)</option>
                <option value="KAS">Kaspa (KAS Network)</option>
                <option value="LTC">Litecoin (LTC)</option>
                <option value="BCH">Bitcoin Cash (BCH)</option>
                <option value="XRP">Ripple (XRP)</option>
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
              className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4"
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
