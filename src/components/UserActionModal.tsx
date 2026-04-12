import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Shield, DollarSign, Power, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, updateDoc, addDoc, collection, serverTimestamp } from '../firebase';

interface UserActionModalProps {
  user: any;
  onClose: () => void;
  isSuperUser: boolean;
  onUpdateUser: (userId: string, data: any) => Promise<void>;
  onLogAction: (action: string) => Promise<void>;
}

export default function UserActionModal({ user, onClose, isSuperUser, onUpdateUser, onLogAction }: UserActionModalProps) {
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const handleAction = async (action: string) => {
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
      } else if (action === 'credit' || action === 'debit') {
        const val = parseFloat(amount);
        if (isNaN(val)) throw new Error('Invalid amount');
        
        const newBalance = action === 'credit' ? (user.balance || 0) + val : (user.balance || 0) - val;
        await onUpdateUser(user.id, { balance: newBalance });
        await onLogAction(`Admin ${action}ed ${val} to user ${user.id}. New balance: ${newBalance}`);
        toast.success(`User balance updated`);
      }
      onClose();
    } catch (error: any) {
      console.error('Action error:', error);
      toast.error(error.message || 'Failed to perform action');
    } finally {
      setIsProcessing(false);
      setConfirmAction(null);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-surface border border-border rounded-3xl p-6 w-full max-w-md shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {confirmAction ? (
            <div className="text-center">
              <h3 className="text-lg font-bold mb-4">Confirm Action</h3>
              <p className="text-sm text-secondary mb-6">Are you sure you want to {confirmAction === 'block' ? (user.is_blocked ? 'unblock' : 'block') : (user.trade_enabled ? 'disable' : 'enable')} this user?</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmAction(null)} className="flex-1 p-3 bg-subtle rounded-xl text-sm font-bold">Cancel</button>
                <button onClick={() => handleAction(confirmAction)} className="flex-1 p-3 bg-primary text-background rounded-xl text-sm font-bold">Confirm</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <UserIcon size={20} /> User Actions: {user.name}
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-subtle rounded-full"><X size={20} /></button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-background rounded-xl text-sm">
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Balance:</strong> ${user.balance?.toFixed(2)}</p>
                  <p><strong>Status:</strong> {user.is_blocked ? 'Blocked' : 'Active'}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setConfirmAction('block')} className="p-3 bg-subtle rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <Shield size={16} /> {user.is_blocked ? 'Unblock' : 'Block'}
                  </button>
                  <button onClick={() => setConfirmAction('trade')} className="p-3 bg-subtle rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                    <Power size={16} /> {user.trade_enabled ? 'Disable Trade' : 'Enable Trade'}
                  </button>
                </div>

                <div className="space-y-2">
                  <input 
                    type="number" 
                    placeholder="Amount" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-background border border-border rounded-full px-4 py-2"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleAction('credit')} disabled={isProcessing} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl text-sm font-bold">Credit</button>
                    <button onClick={() => handleAction('debit')} disabled={isProcessing} className="p-3 bg-red-500/10 text-red-500 rounded-xl text-sm font-bold">Debit</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
