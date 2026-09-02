import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift } from 'lucide-react';
import GiftCardDepositSection from './GiftCardDepositSection';
import { fluidSpring } from './SystemManager';

interface GiftCardPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId?: string;
  planName?: string;
  planType?: string;
  requiredAmount?: number;
  onSuccess?: () => void;
}

export default function GiftCardPaymentModal({
  isOpen,
  onClose,
  planId,
  planName,
  planType,
  requiredAmount,
  onSuccess
}: GiftCardPaymentModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={fluidSpring}
          className="relative w-full max-w-2xl bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 my-8 max-h-[90vh] overflow-y-auto custom-scrollbar"
        >
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl">
                <Gift size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-primary">
                  {planName ? `Pay for ${planName}` : 'Deposit with Gift Cards'}
                </h2>
                <p className="text-xs text-secondary">
                  {planName 
                    ? `Instant checkout using any supported retail or gaming gift card` 
                    : `Credit your account balance with Apple, Steam, Amazon, Razer Gold & more`}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-muted hover:text-primary rounded-full hover:bg-subtle transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <GiftCardDepositSection
            initialAmount={requiredAmount}
            planId={planId}
            planName={planName}
            planType={planType}
            isModal={true}
            onSuccess={() => {
              if (onSuccess) onSuccess();
              setTimeout(() => onClose(), 2000);
            }}
          />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
