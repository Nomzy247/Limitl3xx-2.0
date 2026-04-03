import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, CheckCircle2, Send } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { db, collection, addDoc, serverTimestamp } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';

export default function Deposit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const walletAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success('Wallet address copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        user_id: user.uid,
        type: 'deposit',
        amount: parseFloat(amount),
        status: 'pending',
        method: 'BTC',
        timestamp: serverTimestamp()
      });

      toast.success('Deposit notification sent! Admin will verify your transaction.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send deposit notification');
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
          transition={fluidSpring}
          className="bg-surface border border-border rounded-3xl p-8 shadow-2xl"
        >
          <h1 className="text-3xl font-bold mb-2">Deposit Funds</h1>
          <p className="text-secondary mb-8">Send BTC to the address below to fund your account.</p>

          <div className="flex flex-col items-center justify-center space-y-8">
            <div className="bg-white p-4 rounded-xl">
              {/* Placeholder for QR Code */}
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`} alt="QR Code" className="w-48 h-48" />
            </div>

            <div className="w-full max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Your Unique BTC Deposit Address</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="text" 
                    readOnly 
                    value={walletAddress}
                    className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary font-mono text-sm focus:outline-none"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    transition={fluidSpring}
                    onClick={handleCopy}
                    className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white p-3 rounded-full transition-colors flex-shrink-0"
                  >
                    {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                  </motion.button>
                </div>
                <p className="text-xs text-muted mt-3 text-center">
                  Only send Bitcoin (BTC) to this address. Sending any other asset will result in permanent loss.
                </p>
              </div>

              <div className="pt-6 border-t border-border/50">
                <h3 className="text-lg font-semibold mb-4 text-center">Confirm Deposit</h3>
                <form onSubmit={handleConfirmDeposit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Amount Sent (BTC)</label>
                    <input 
                      type="number" 
                      step="0.00000001"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                      required
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    transition={fluidSpring}
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 shadow-lg shadow-[#0052ff]/20"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={18} /> I've Sent the Funds
                      </>
                    )}
                  </motion.button>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
