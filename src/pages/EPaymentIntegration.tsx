import { useState } from 'react';
import { motion } from 'motion/react';
import { CreditCard, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';

export default function EPaymentIntegration() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const handleConnect = () => {
    setIsConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnecting(false);
      setIsConnected(true);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background text-primary p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={fluidSpring}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#0052ff]/10 mb-6"
          >
            <CreditCard size={40} className="text-[#0052ff]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">E-Payment Gateway Integration</h1>
          <p className="text-xl text-secondary max-w-2xl mx-auto">
            Seamlessly connect your business with our secure, high-speed payment processing infrastructure.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...fluidSpring, delay: 0.1 }}
            className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <ShieldCheck className="text-emerald-400" />
              Enterprise Security
            </h3>
            <ul className="space-y-4">
              {[
                'PCI-DSS Level 1 Compliant',
                'End-to-End Encryption',
                'Advanced Fraud Detection',
                'Automated Chargeback Handling'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-secondary">
                  <CheckCircle2 size={18} className="text-[#0052ff]" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...fluidSpring, delay: 0.2 }}
            className="bg-card p-8 rounded-3xl border border-border/50 shadow-xl"
          >
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Zap className="text-yellow-400" />
              Lightning Fast
            </h3>
            <ul className="space-y-4">
              {[
                'Instant Settlement Options',
                'Global Currency Support',
                '99.99% Uptime SLA',
                'Real-time Analytics Dashboard'
              ].map((feature, idx) => (
                <li key={idx} className="flex items-center gap-3 text-secondary">
                  <CheckCircle2 size={18} className="text-[#0052ff]" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.3 }}
          className="bg-surface p-8 rounded-3xl border border-border/50 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-lg bg-[#0052ff]/5 blur-[100px] rounded-full pointer-events-none" />
          
          <h2 className="text-2xl font-bold mb-4 relative z-10">Ready to Integrate?</h2>
          <p className="text-secondary mb-8 max-w-xl mx-auto relative z-10">
            Get your API keys and start processing payments in minutes. Our developer-friendly documentation makes setup a breeze.
          </p>

          {!isConnected ? (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleConnect}
              disabled={isConnecting}
              className={`relative z-10 inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-lg transition-colors ${
                isConnecting 
                  ? 'bg-muted text-secondary cursor-not-allowed' 
                  : 'bg-[#0052ff] hover:bg-[#0052ff]/90 text-white'
              }`}
            >
              {isConnecting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  Generate API Keys <ArrowRight size={20} />
                </>
              )}
            </motion.button>
          ) : (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative z-10 bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-2xl inline-block"
            >
              <div className="flex items-center gap-3 text-emerald-400 font-bold mb-2 justify-center">
                <CheckCircle2 size={24} />
                Integration Successful
              </div>
              <p className="text-sm text-secondary">Your API keys have been sent to your registered email.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
