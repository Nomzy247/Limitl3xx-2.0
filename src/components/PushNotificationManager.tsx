import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellRing, CheckCircle2, Gift, Sparkles, X, Zap } from 'lucide-react';
import { db, collection, query, where, onSnapshot } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { 
  getNotificationPermission, 
  isPushNotificationSupported, 
  requestPushPermission, 
  notifyMinedPayout, 
  notifyGiftCardApproved, 
  triggerPushAlert,
  isPushAlertsEnabled
} from '../services/pushNotificationService';
import { fluidSpring } from './SystemManager';

export default function PushNotificationManager() {
  const { user } = useAuth();
  const [showPermissionPrompt, setShowPermissionPrompt] = useState(false);
  const knownTxStatusRef = useRef<Map<string, string>>(new Map());
  const isInitialSnapshotRef = useRef(true);

  // Check if we should suggest enabling push notifications
  useEffect(() => {
    if (!user) return;
    
    // Check permission after slight delay so UI isn't bombarded on load
    const timer = setTimeout(() => {
      if (isPushNotificationSupported() && getNotificationPermission() === 'default') {
        let hasDismissed = false;
        try {
          hasDismissed = sessionStorage.getItem('poolmining_push_prompt_dismissed') === 'true';
        } catch {
          hasDismissed = false;
        }
        if (!hasDismissed) {
          setShowPermissionPrompt(true);
        }
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, [user]);

  // Real-time Firestore transaction listener to trigger instant alerts
  useEffect(() => {
    if (!user) {
      knownTxStatusRef.current.clear();
      isInitialSnapshotRef.current = true;
      return;
    }

    const q = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // On initial snapshot load, index all existing transactions without alerting
      if (isInitialSnapshotRef.current) {
        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          knownTxStatusRef.current.set(docSnap.id, data.status || 'pending');
        });
        isInitialSnapshotRef.current = false;
        return;
      }

      // Check for document changes or newly added documents
      snapshot.docChanges().forEach((change) => {
        const txId = change.doc.id;
        const tx = change.doc.data();
        const prevStatus = knownTxStatusRef.current.get(txId);
        const currentStatus = tx.status || 'pending';

        // 1. Newly added mining payout / yield reward
        if (change.type === 'added' && !prevStatus) {
          knownTxStatusRef.current.set(txId, currentStatus);

          if (tx.type === 'mining_reward' || tx.type === 'payout' || tx.payment_method === 'mining_yield') {
            notifyMinedPayout(
              Number(tx.amount) || 0,
              tx.currency || 'USD',
              tx.plan_name || tx.description || 'Cloud ASIC Plan'
            );
          }
        }

        // 2. Status Transition: Pending -> Completed / Approved
        if ((change.type === 'modified' || change.type === 'added') && prevStatus !== currentStatus) {
          knownTxStatusRef.current.set(txId, currentStatus);

          if (currentStatus === 'completed' || currentStatus === 'approved') {
            // A) Gift Card Deposit Approved
            if (tx.payment_method === 'gift_card' || tx.gift_card_brand || tx.type === 'gift_card') {
              notifyGiftCardApproved(
                Number(tx.amount || tx.gift_card_amount) || 0,
                tx.gift_card_brand || tx.method || 'Gift Card',
                tx.currency || 'USD'
              );
            }
            // B) Standard Deposit / Payout Approved
            else if (tx.type === 'deposit') {
              triggerPushAlert({
                title: '💰 Deposit Confirmed!',
                body: `Your deposit of $${Number(tx.amount).toFixed(2)} USD has been credited and settled.`,
                type: 'deposit',
                url: '/dashboard'
              });
            } else if (tx.type === 'withdrawal') {
              triggerPushAlert({
                title: '⚡ Withdrawal Processed!',
                body: `Your withdrawal of $${Number(tx.amount).toFixed(2)} USD has been sent to your external wallet.`,
                type: 'withdrawal',
                url: '/dashboard'
              });
            }
          }
        }
      });
    }, (error) => {
      console.warn('PushNotificationManager listener note:', error?.message);
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const handleEnablePush = async () => {
    setShowPermissionPrompt(false);
    await requestPushPermission();
  };

  const handleDismissPrompt = () => {
    setShowPermissionPrompt(false);
    try {
      sessionStorage.setItem('poolmining_push_prompt_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  return (
    <AnimatePresence>
      {showPermissionPrompt && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={fluidSpring}
          className="fixed top-20 right-4 sm:right-8 max-w-sm w-[calc(100vw-2rem)] bg-surface border border-[#0052ff]/40 rounded-2xl p-4 shadow-2xl z-[90] backdrop-blur-xl"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-[#0052ff]/20 text-[#0052ff] rounded-xl shrink-0 mt-0.5 animate-bounce">
              <BellRing size={18} />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-xs font-black text-primary uppercase tracking-wider">
                  Enable Payout Alerts
                </h4>
                <button
                  onClick={handleDismissPrompt}
                  className="text-muted hover:text-primary transition-colors"
                >
                  <X size={14} />
                </button>
              </div>

              <p className="text-xs text-secondary mb-3 leading-relaxed">
                Get instant desktop and mobile notifications when your daily cloud mining payouts credit and when gift card deposits are approved.
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleEnablePush}
                  className="flex-1 py-1.5 px-3 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold rounded-lg text-xs shadow-md shadow-[#0052ff]/20 transition-all active:scale-95"
                >
                  Enable Alerts
                </button>
                <button
                  onClick={handleDismissPrompt}
                  className="py-1.5 px-2.5 text-xs text-muted hover:text-primary transition-colors"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
