import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router';
import { motion } from 'motion/react';
import { Gift, ArrowRight, CheckCircle2, Hexagon, Sparkles, ShieldCheck } from 'lucide-react';
import { fluidSpring } from '../components/SystemManager';

export default function ReferralRedirect() {
  const { referralCode } = useParams<{ referralCode?: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const queryCode = searchParams.get('ref') || searchParams.get('code');
  const activeCode = (referralCode || queryCode || '').trim().toUpperCase();

  useEffect(() => {
    if (activeCode) {
      localStorage.setItem('poolmining_referral_code', activeCode);
      sessionStorage.setItem('poolmining_referral_code', activeCode);
      
      // Auto-redirect to signup after brief presentation
      const timer = setTimeout(() => {
        setIsRedirecting(true);
        navigate(`/signup?ref=${encodeURIComponent(activeCode)}`);
      }, 1600);

      return () => clearTimeout(timer);
    } else {
      navigate('/signup');
    }
  }, [activeCode, navigate]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-[#0052ff]/20 to-[#00f0ff]/20 rounded-full blur-[140px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={fluidSpring}
        className="w-full max-w-md bg-card/90 backdrop-blur-xl border border-border/80 rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative z-10 text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#0052ff] to-[#00f0ff] p-0.5 shadow-lg shadow-[#0052ff]/20 flex items-center justify-center">
            <div className="w-full h-full bg-card rounded-[14px] flex items-center justify-center">
              <Gift className="w-8 h-8 text-[#00f0ff] animate-bounce" />
            </div>
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> VIP Referral Invitation
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mb-2">
          You've Been Invited!
        </h1>
        <p className="text-sm text-secondary mb-6 leading-relaxed">
          Unlock exclusive tier rates, institutional cloud mining hashpower, and lifetime reward benefits.
        </p>

        {activeCode && (
          <div className="p-4 bg-surface rounded-2xl border border-border mb-6">
            <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-1">Referral Code Applied</div>
            <div className="text-2xl font-black font-mono tracking-widest text-[#00f0ff]">
              {activeCode}
            </div>
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 font-medium mt-2">
              <CheckCircle2 size={13} /> 5% Lifetime Commission & Priority Mining Active
            </div>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={() => navigate(`/signup?ref=${encodeURIComponent(activeCode)}`)}
            className="w-full py-3.5 px-6 rounded-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white font-bold text-sm shadow-lg shadow-[#0052ff]/25 transition-all flex items-center justify-center gap-2 group"
          >
            {isRedirecting ? 'Redirecting to Sign Up...' : 'Claim Bonus & Register'}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <Link
            to="/login"
            className="block text-xs text-muted hover:text-primary transition-colors py-2"
          >
            Already have an account? <span className="text-[#0052ff] font-medium">Log in</span>
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-border/50 flex items-center justify-center gap-2 text-[11px] text-muted">
          <ShieldCheck size={14} className="text-emerald-500" /> Secure 256-bit Encrypted PoolMining.cloud Network
        </div>
      </motion.div>
    </div>
  );
}
