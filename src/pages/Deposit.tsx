import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Copy, CheckCircle2, Send, ShieldCheck, QrCode, Gift, Coins, Sparkles } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { db, collection, addDoc, doc, onSnapshot, serverTimestamp } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import GiftCardDepositSection from '../components/GiftCardDepositSection';

const DEFAULT_WALLET_ADDRESSES: Record<string, string> = {
  BTC: 'bc1qftqgamhv7hgs6msxfpwc0aawj5kn0mrjl3j4u7',
  ETH: '0xc64b82a830828A6b3AF1e71B40a0962A5FC07525',
  'USDT-TRC20': 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3ZiPUL4',
  'USDT-ERC20': '0xc64b82a830828A6b3AF1e71B40a0962A5FC07525',
  SOL: 'CS5onmGF5eUUCzLU4UJAqiBHh9ZP7KTpk5rgfVqXQy4A',
  TON: 'EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xqB2N',
  KAS: 'kaspa:qpm2qsznhks23z7629mms6s4cwef74vcwpgmm4j89dnmrxw8n3p2qspv5k9',
  LTC: 'LVRXy4jvsBK2rLLerjEohrKK1Pkem9nFzq',
  BCH: 'qrhe43zzq5rdn4wvgsre0j09j3phhj7zxsl4nq9p3p',
  USDT: 'TYDzsYUEpvnYmQk4zGP9sWWcTEd3ZiPUL4',
  XRP: 'rHxfaFeS2TTX5e4bp3dsvWa7kTaAaREg7e'
};

export default function Deposit() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const initialTab = searchParams.get('tab') === 'giftcard' || searchParams.get('method') === 'giftcard' 
    ? 'gift_card' 
    : 'crypto';
  const [depositMethod, setDepositMethod] = useState<'crypto' | 'gift_card'>(initialTab);

  const [copied, setCopied] = useState(false);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('BTC');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>(DEFAULT_WALLET_ADDRESSES);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.wallet_addresses) {
          setWalletAddresses({ ...DEFAULT_WALLET_ADDRESSES, ...data.wallet_addresses });
        }
      }
    }, (err) => {
      console.warn("Global settings snapshot fallback:", err);
    });
    return () => unsub();
  }, []);
  
  const walletAddress = walletAddresses[currency] || DEFAULT_WALLET_ADDRESSES[currency] || '';

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    toast.success(`${currency} address copied!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const depositAmount = parseFloat(amount);
    if (!amount || depositAmount < 500) {
      toast.error('Minimum deposit amount is $500.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'transactions'), {
        user_id: user.uid,
        type: 'deposit',
        payment_method: 'crypto',
        amount: depositAmount,
        status: 'pending',
        method: currency,
        currency: 'USD',
        timestamp: serverTimestamp()
      });

      // Add Admin Notification
      await addDoc(collection(db, 'notifications'), {
        type: 'deposit',
        userId: user.uid,
        userName: user.email || 'Unknown User',
        message: `New crypto deposit of $${depositAmount} initiated by ${user.email} (${currency})`,
        amount: depositAmount,
        currency: currency,
        timestamp: serverTimestamp(),
        read: false
      });

      toast.success('Deposit notification sent! Admin will verify your transaction.');
      setTimeout(() => navigate('/dashboard'), 2000);
    } catch (error: any) {
      console.error('Deposit Error:', error);
      toast.error(error.message || 'Failed to send deposit notification. Please contact support.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <Link to="/dashboard" className="inline-flex items-center text-muted hover:text-primary transition-colors mb-6">
          <ArrowLeft size={20} className="mr-2" />
          Back to Dashboard
        </Link>
        
        {/* Main Tab Toggle: Crypto vs Gift Card */}
        <div className="flex bg-surface p-1.5 rounded-full border border-border mb-8 shadow-md">
          <button
            onClick={() => {
              setDepositMethod('crypto');
              setSearchParams({});
            }}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              depositMethod === 'crypto'
                ? 'bg-[#0052ff] text-white shadow-lg shadow-[#0052ff]/20'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Coins size={18} />
            <span>Cryptocurrency Deposit</span>
          </button>
          <button
            onClick={() => {
              setDepositMethod('gift_card');
              setSearchParams({ tab: 'giftcard' });
            }}
            className={`flex-1 py-3 px-4 rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all ${
              depositMethod === 'gift_card'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20'
                : 'text-secondary hover:text-primary'
            }`}
          >
            <Gift size={18} />
            <span>Gift Card Deposit</span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
              POPULAR
            </span>
          </button>
        </div>

        <motion.div
          key={depositMethod}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-2xl"
        >
          {depositMethod === 'gift_card' ? (
            <GiftCardDepositSection onSuccess={() => navigate('/transactions')} />
          ) : (
            <div>
              <h1 className="text-3xl font-bold mb-2">Crypto Deposit</h1>
              <p className="text-secondary mb-8">Select cryptocurrency and send to the address below to fund your account.</p>

              <div className="flex flex-col items-center justify-center space-y-8">
                <div className="w-full max-w-md">
                  <label className="block text-sm font-medium text-secondary mb-2">Select Asset</label>
                  <select 
                    value={currency} 
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary text-sm focus:outline-none"
                  >
                    <option value="BTC">Bitcoin (BTC - Native SegWit)</option>
                    <option value="USDT-TRC20">Tether USDT (TRC-20 Fast)</option>
                    <option value="USDT-ERC20">Tether USDT (ERC-20)</option>
                    <option value="ETH">Ethereum (ETH - ERC-20)</option>
                    <option value="SOL">Solana (SOL - SPL)</option>
                    <option value="TON">Toncoin (TON)</option>
                    <option value="KAS">Kaspa (KAS)</option>
                    <option value="LTC">Litecoin (LTC)</option>
                    <option value="BCH">Bitcoin Cash (BCH)</option>
                    <option value="XRP">Ripple (XRP)</option>
                  </select>
                </div>

                <div className="bg-white p-4 rounded-xl">
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${walletAddress}`} alt="QR Code" className="w-48 h-48" />
                </div>

                <div className="w-full max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Your Unique {currency} Deposit Address</label>
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
                      Only send {currency} to this address on the correct network.
                    </p>
                  </div>

                  <div className="pt-6 border-t border-border/50">
                    <h3 className="text-lg font-semibold mb-4 text-center">Confirm Deposit</h3>
                    <form onSubmit={handleConfirmDeposit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-secondary mb-2">Amount to Deposit (USD)</label>
                        <input 
                          type="number" 
                          step="any"
                          min="500"
                          placeholder="0.00"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full bg-background border border-border rounded-full px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff] mb-2"
                          required
                        />
                        <p className="text-xs text-muted">
                          Minimum deposit: $500. Please send the equivalent of this amount in {currency}.
                        </p>
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
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

