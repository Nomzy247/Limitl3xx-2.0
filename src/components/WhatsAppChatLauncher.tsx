import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Send, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Clock, 
  Phone, 
  MessageCircle,
  Zap,
  Gift
} from 'lucide-react';
import WhatsAppIcon from './WhatsAppIcon';
import { fluidSpring } from './SystemManager';

const WHATSAPP_NUMBER = '12368577040';
const WHATSAPP_DISPLAY = '+1 (236) 857-7040';

interface QuickTopic {
  id: string;
  icon: React.ReactNode;
  label: string;
  message: string;
}

const QUICK_TOPICS: QuickTopic[] = [
  {
    id: 'gift_card',
    icon: <Gift size={14} className="text-amber-400" />,
    label: 'Gift Card Verification & Credit',
    message: 'Hello PoolMining Support! I would like to verify and credit my gift card deposit.'
  },
  {
    id: 'mining_yield',
    icon: <Zap size={14} className="text-[#00f0ff]" />,
    label: 'Cloud Hashpower & Mining Yields',
    message: 'Hello! I have a question regarding active cloud mining plans and daily payouts.'
  },
  {
    id: 'payouts',
    icon: <Sparkles size={14} className="text-emerald-400" />,
    label: 'Crypto Payouts & Withdrawals',
    message: 'Hello! I need assistance with a crypto withdrawal/payout settlement.'
  },
  {
    id: 'vip_support',
    icon: <ShieldCheck size={14} className="text-purple-400" />,
    label: 'VIP Account & Security Upgrade',
    message: 'Hello! I would like to speak with an account manager regarding VIP limits.'
  }
];

export default function WhatsAppChatLauncher() {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<QuickTopic | null>(null);

  const getWhatsAppUrl = (text?: string) => {
    const messageToSend = text || (selectedTopic ? selectedTopic.message : customText) || 'Hello PoolMining.cloud Support! I would like to chat with an agent.';
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(messageToSend)}`;
  };

  const handleLaunchWhatsApp = (text?: string) => {
    const url = getWhatsAppUrl(text);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      {/* Floating Pill Trigger */}
      <div className="fixed bottom-20 md:bottom-6 right-20 md:right-24 z-50 flex items-center">
        <motion.button
          id="whatsapp-support-floating-pill"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-full bg-[#25D366] hover:bg-[#20ba59] text-white shadow-xl shadow-[#25D366]/25 border border-white/20 transition-all group font-bold text-xs"
          title={`WhatsApp Support: ${WHATSAPP_DISPLAY}`}
          aria-label="Open WhatsApp Support Chat Launcher"
        >
          {/* Pulsing Aura */}
          <span className="absolute -inset-0.5 rounded-full bg-[#25D366] opacity-40 blur-sm group-hover:opacity-75 transition-opacity animate-pulse pointer-events-none" />
          
          <div className="relative flex items-center justify-center">
            <WhatsAppIcon size={18} className="text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full border-2 border-[#25D366] animate-ping" />
          </div>

          <span className="relative hidden sm:inline font-black tracking-wide text-white drop-shadow-sm">
            WhatsApp
          </span>

          <span className="relative text-[10px] bg-black/20 text-white font-mono px-2 py-0.5 rounded-full hidden md:inline">
            24/7 Live
          </span>
        </motion.button>
      </div>

      {/* Expandable Support Launcher Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.92 }}
            transition={fluidSpring}
            className="fixed bottom-36 md:bottom-20 right-4 sm:right-20 w-[calc(100vw-2rem)] sm:w-96 bg-surface border border-border/80 rounded-3xl shadow-2xl z-[70] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#128C7E] to-[#25D366] p-4 text-white relative shadow-md">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                    <WhatsAppIcon size={20} className="text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black flex items-center gap-1.5">
                      <span>WhatsApp Support Desk</span>
                      <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
                    </h4>
                    <p className="text-[11px] text-white/90 font-mono font-bold">
                      {WHATSAPP_DISPLAY}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] bg-black/15 px-3 py-1.5 rounded-xl backdrop-blur-sm">
                <span className="flex items-center gap-1 text-emerald-100">
                  <Clock size={12} />
                  <span>Avg Response: <strong className="text-white">&lt; 2 mins</strong></span>
                </span>
                <span className="text-emerald-100 font-bold uppercase tracking-wider text-[10px]">
                  Verified Business
                </span>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-4 sm:p-5 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <p className="text-xs text-secondary leading-relaxed">
                Connect directly with our dedicated cloud mining and deposit specialists on WhatsApp for instant assistance.
              </p>

              {/* Quick Topics */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">
                  Select Quick Topic
                </label>
                <div className="space-y-1.5">
                  {QUICK_TOPICS.map((topic) => (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => handleLaunchWhatsApp(topic.message)}
                      className="w-full text-left p-2.5 rounded-xl bg-background border border-border/60 hover:border-[#25D366] hover:bg-[#25D366]/5 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <div className="p-1.5 rounded-lg bg-surface border border-border/40 shrink-0">
                          {topic.icon}
                        </div>
                        <span className="text-xs font-bold text-primary group-hover:text-[#25D366] transition-colors truncate">
                          {topic.label}
                        </span>
                      </div>
                      <ExternalLink size={13} className="text-muted group-hover:text-[#25D366] shrink-0 transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Message Field */}
              <div className="pt-2 border-t border-border/50">
                <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">
                  Or Send Custom Message
                </label>
                <div className="relative">
                  <textarea
                    rows={2}
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder="Type your question or request..."
                    className="w-full bg-background border border-border rounded-xl p-3 text-xs text-primary focus:outline-none focus:ring-2 focus:ring-[#25D366] resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleLaunchWhatsApp()}
                  className="w-full mt-2 py-2.5 px-4 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 active:scale-95 transition-all"
                >
                  <WhatsAppIcon size={16} className="text-white" />
                  <span>Start WhatsApp Chat</span>
                  <Send size={13} />
                </button>
              </div>

              {/* Direct Call Alternative */}
              <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-muted">
                <span>Or call direct line:</span>
                <a
                  href={`tel:+${WHATSAPP_NUMBER}`}
                  className="font-mono font-bold text-primary hover:text-[#00f0ff] transition-colors flex items-center gap-1"
                >
                  <Phone size={11} /> {WHATSAPP_DISPLAY}
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
