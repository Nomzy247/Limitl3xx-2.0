import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, DollarSign, Power, User as UserIcon, Mail, CheckCircle, ArrowUpCircle, ArrowDownCircle, LogIn, ChevronRight, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from '../firebase';
import { formatFirebaseDate } from '../utils/date';

interface UserActionModalProps {
  user: any;
  onClose: () => void;
  isSuperUser: boolean;
  onUpdateUser: (userId: string, data: any) => Promise<void>;
  onLogAction: (action: string) => Promise<void>;
}

type Tab = 'status' | 'balances' | 'account' | 'actions';

const TIERS = ['Basic', 'Silver', 'Gold', 'Platinum'];

export default function UserActionModal({ user, onClose, isSuperUser, onUpdateUser, onLogAction }: UserActionModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('status');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'BTC' | 'ETH' | 'USDT'>('USD');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{ type: string, payload?: any } | null>(null);

  const handleAction = async (action: string, payload?: any) => {
    setIsProcessing(true);
    try {
      if (action === 'block') {
        await onUpdateUser(user.id, { is_blocked: !user.is_blocked });
        await onLogAction(`Admin ${user.is_blocked ? 'unblocked' : 'blocked'} user ${user.id}`);
        toast.success(`User ${user.is_blocked ? 'unblocked' : 'blocked'}`);
      } else if (action === 'trade') {
        await onUpdateUser(user.id, { trade_enabled: !user.trade_enabled });
        await onLogAction(`Admin ${user.trade_enabled ? 'enabled' : 'disabled'} trading for user ${user.id}`);
        toast.success(`Trading ${user.trade_enabled ? 'disabled' : 'enabled'}`);
      } else if (action === 'verify') {
        const newStatus = user.verification_status === 'verified' ? 'pending' : 'verified';
        await onUpdateUser(user.id, { verification_status: newStatus });
        await onLogAction(`Admin marked user ${user.id} as ${newStatus}`);
        toast.success(`User verification status updated to ${newStatus}`);
      } else if (action === 'tier') {
        const currentTierIdx = TIERS.indexOf(user.tier || 'Basic');
        let newTierIdx = currentTierIdx + payload;
        if (newTierIdx < 0) newTierIdx = 0;
        if (newTierIdx > TIERS.length - 1) newTierIdx = TIERS.length - 1;
        const newTier = TIERS[newTierIdx];
        
        await onUpdateUser(user.id, { tier: newTier });
        await onLogAction(`Admin changed tier for user ${user.id} to ${newTier}`);
        toast.success(`User tier updated to ${newTier}`);
      } else if (action === 'credit' || action === 'debit') {
        const val = parseFloat(amount);
        if (isNaN(val) || val <= 0) throw new Error('Invalid amount');
        
        if (currency === 'USD') {
          const newBalance = action === 'credit' ? (user.balance || 0) + val : (user.balance || 0) - val;
          await onUpdateUser(user.id, { balance: newBalance });
          await onLogAction(`Admin ${action}ed $${val} to user ${user.id}. New USD balance: ${newBalance}`);
        } else {
          const currentCryptoBalance = user.balances?.[currency] || 0;
          const newBalance = action === 'credit' ? currentCryptoBalance + val : currentCryptoBalance - val;
          const newBalancesObj = { ...(user.balances || {}), [currency]: newBalance };
          await onUpdateUser(user.id, { balances: newBalancesObj });
          await onLogAction(`Admin ${action}ed ${val} ${currency} to user ${user.id}. New balance: ${newBalance}`);
        }
        toast.success(`User balance updated successfully`);
        setAmount('');
      } else if (action === 'impersonate') {
        toast.error('Switching accounts requires issuing a custom Firebase Auth backend token.');
        // If we want a soft mock, we could use a custom context, but we need backend for real auth impersonation.
      }
      if (action !== 'impersonate') onClose();
    } catch (error: any) {
      console.error('Action error:', error);
      toast.error(error.message || 'Failed to perform action');
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  const currentTier = user.tier || 'Basic';
  const tierIndex = TIERS.indexOf(currentTier);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-surface border border-border/50 rounded-3xl p-6 w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row gap-6 max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {confirmAction ? (
            <div className="text-center p-8 flex-1 flex flex-col justify-center items-center">
              <AlertTriangle className="text-yellow-500 mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-4">Confirm Action</h3>
              <p className="text-secondary mb-8 text-lg">Are you sure you want to proceed with this administrative action?</p>
              <div className="flex gap-4 w-full justify-center">
                <button onClick={() => setConfirmAction(null)} className="px-6 py-3 bg-subtle hover:bg-border transition-colors rounded-xl font-bold">Cancel</button>
                <button onClick={() => handleAction(confirmAction.type, confirmAction.payload)} className="px-6 py-3 bg-primary text-background rounded-xl font-bold hover:opacity-90 transition-opacity">Confirm Execute</button>
              </div>
            </div>
          ) : (
            <>
              {/* Sidebar Tabs */}
              <div className="md:w-48 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 pr-2 md:pr-4 border-b md:border-b-0 md:border-r border-border/50 shrink-0">
                <div className="font-bold text-sm text-secondary mb-2 hidden md:block px-2">Manage User</div>
                {[
                  { id: 'status', label: 'Status' },
                  { id: 'balances', label: 'Balances' },
                  { id: 'account', label: 'Account Tier' },
                  { id: 'actions', label: 'Actions' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`text-left px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${activeTab === tab.id ? 'bg-[#0052ff] text-white' : 'hover:bg-subtle text-secondary'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold flex items-center gap-2">
                    {user.name}
                  </h2>
                  <button onClick={onClose} className="p-2 bg-subtle hover:bg-border transition-colors rounded-full"><X size={20} /></button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                  {activeTab === 'status' && (
                    <div className="space-y-6">
                      <div className="p-4 bg-background border border-border/50 rounded-2xl grid gap-2">
                        <div className="flex justify-between"><span className="text-secondary text-sm">Email</span> <span className="font-medium text-sm">{user.email}</span></div>
                        <div className="flex justify-between"><span className="text-secondary text-sm">User ID</span> <span className="font-mono text-xs">{user.id}</span></div>
                        <div className="flex justify-between"><span className="text-secondary text-sm">Role</span> <span className="font-medium text-sm capitalize">{user.role}</span></div>
                        <div className="flex justify-between"><span className="text-secondary text-sm">Joined</span> <span className="font-medium text-sm">{formatFirebaseDate(user.joined_date)}</span></div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <button onClick={() => setConfirmAction({ type: 'block' })} className={`p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 border transition-colors ${user.is_blocked ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'}`}>
                          <Shield size={24} />
                          <span>{user.is_blocked ? 'Unblock User' : 'Block User'}</span>
                        </button>
                        <button onClick={() => setConfirmAction({ type: 'trade' })} className={`p-4 rounded-2xl font-bold flex flex-col items-center justify-center gap-2 border transition-colors ${user.trade_enabled ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20' : 'bg-[#00f0ff]/10 border-[#00f0ff]/20 text-[#00f0ff] hover:bg-[#00f0ff]/20'}`}>
                          <Power size={24} />
                          <span>{user.trade_enabled ? 'Disable Trading' : 'Enable Trading'}</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activeTab === 'balances' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="p-3 bg-subtle rounded-xl flex justify-between items-center">
                          <span className="text-secondary">USD</span>
                          <span className="font-mono font-bold">${(user.balance || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-subtle rounded-xl flex justify-between items-center bg-orange-500/5">
                          <span className="text-secondary">BTC</span>
                          <span className="font-mono font-bold">{(user.balances?.BTC || 0).toFixed(6)}</span>
                        </div>
                        <div className="p-3 bg-subtle rounded-xl flex justify-between items-center bg-indigo-500/5">
                          <span className="text-secondary">ETH</span>
                          <span className="font-mono font-bold">{(user.balances?.ETH || 0).toFixed(4)}</span>
                        </div>
                        <div className="p-3 bg-subtle rounded-xl flex justify-between items-center bg-green-500/5">
                          <span className="text-secondary">USDT</span>
                          <span className="font-mono font-bold">{(user.balances?.USDT || 0).toFixed(2)}</span>
                        </div>
                        <div className="p-3 bg-subtle rounded-xl flex justify-between items-center bg-purple-500/5">
                          <span className="text-secondary">SOL</span>
                          <span className="font-mono font-bold">{(user.balances?.SOL || 0).toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="p-4 border border-border rounded-2xl space-y-4">
                        <h3 className="font-bold">Modify Balance</h3>
                        <div className="flex gap-2">
                          <select 
                            value={currency} 
                            onChange={(e) => {
                              setCurrency(e.target.value as any);
                              setAmount('');
                            }}
                            className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:outline-none"
                          >
                            <option value="USD">USD</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                            <option value="USDT">USDT</option>
                            <option value="SOL">SOL</option>
                          </select>
                          <input 
                            type="number" 
                            placeholder={currency === 'USD' ? "Amount in USD" : `Amount in ${currency}`}
                            value={amount} 
                            onChange={(e) => setAmount(e.target.value)}
                            className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none"
                            step="any"
                          />
                        </div>
                        
                        {currency !== 'USD' && currency !== 'USDT' && (
                          <div className="flex items-center gap-2 mt-2 bg-subtle p-2 rounded-xl border border-border">
                            <span className="text-sm text-secondary font-medium w-32">Auto Convert from USD:</span>
                            <input
                              type="number"
                              placeholder="$0.00"
                              className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-sm focus:outline-none"
                              onChange={(e) => {
                                const val = parseFloat(e.target.value);
                                if (!isNaN(val) && val > 0) {
                                  const rates: any = { BTC: 65000, ETH: 3500, SOL: 150 };
                                  setAmount((val / rates[currency]).toFixed(8).replace(/\.?0+$/, ''));
                                } else {
                                  setAmount('');
                                }
                              }}
                            />
                            <span className="text-xs text-secondary px-2">
                              Rate: 1 {currency} = ${currency === 'BTC' ? '65K' : currency === 'ETH' ? '3.5K' : '150'}
                            </span>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button onClick={() => setConfirmAction({ type: 'credit' })} disabled={!amount} className="p-3 bg-emerald-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-emerald-600 transition-colors">Credit (Add)</button>
                          <button onClick={() => setConfirmAction({ type: 'debit' })} disabled={!amount} className="p-3 bg-red-500 text-white rounded-xl text-sm font-bold disabled:opacity-50 hover:bg-red-600 transition-colors">Debit (Remove)</button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'account' && (
                    <div className="space-y-6">
                      <div className={`p-6 rounded-2xl border ${user.verification_status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30'} flex flex-col items-center justify-center gap-4`}>
                        <div className="flex items-center gap-3">
                          {user.verification_status === 'verified' ? <CheckCircle className="text-emerald-500" size={32} /> : <AlertTriangle className="text-red-500" size={32} />}
                          <h3 className="text-xl font-bold">{user.verification_status === 'verified' ? 'Verified Account' : 'Unverified Account'}</h3>
                        </div>
                        <button 
                          onClick={() => setConfirmAction({ type: 'verify' })}
                          className="px-6 py-2 bg-background border border-border rounded-full text-sm font-bold hover:bg-subtle transition-colors"
                        >
                          {user.verification_status === 'verified' ? 'Revoke Verification' : 'Mark as Verified'}
                        </button>
                      </div>

                      <div className="p-6 bg-background border border-border/50 rounded-2xl">
                        <div className="flex justify-between items-center mb-6">
                          <h3 className="font-bold flex items-center gap-2"><ArrowUpCircle size={18} /> Account Tier</h3>
                          <span className="px-3 py-1 bg-[#0052ff]/10 text-[#0052ff] font-bold rounded-lg text-sm">{currentTier}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setConfirmAction({ type: 'tier', payload: 1 })}
                            disabled={tierIndex >= TIERS.length - 1}
                            className="p-3 bg-subtle hover:bg-border transition-colors rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <ArrowUpCircle size={16} /> Upgrade
                          </button>
                          <button 
                            onClick={() => setConfirmAction({ type: 'tier', payload: -1 })}
                            disabled={tierIndex <= 0}
                            className="p-3 bg-subtle hover:bg-border transition-colors rounded-xl text-sm font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            <ArrowDownCircle size={16} /> Downgrade
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'actions' && (
                    <div className="space-y-4">
                      <a 
                        href={`mailto:${user.email}`}
                        className="w-full p-4 bg-background border border-border hover:bg-subtle transition-colors rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 font-bold">
                          <Mail className="text-blue-500" size={20} />
                          Send Email to User
                        </div>
                        <ChevronRight size={18} className="text-secondary" />
                      </a>
                      
                      <button 
                        onClick={() => handleAction('impersonate')}
                        className="w-full p-4 bg-background border border-border hover:bg-subtle transition-colors rounded-2xl flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3 font-bold">
                          <LogIn className="text-purple-500" size={20} />
                          Switch to User Account (Impersonate)
                        </div>
                        <ChevronRight size={18} className="text-secondary" />
                      </button>
                      <p className="text-xs text-secondary px-2">Note: To fully switch accounts without logging out as admin, you need to use the "Switch to User Account" feature strictly supported by a secure token backend. Click above for action logic.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

