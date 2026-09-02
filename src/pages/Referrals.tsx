import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, Gift, Share2, TrendingUp, DollarSign, Award, ArrowRight, 
  Copy, Check, QrCode, ExternalLink, ShieldCheck, Sparkles, Send,
  MessageCircle, Mail, Globe, Calculator, UserCheck, Clock, HelpCircle, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot, orderBy } from '../firebase';
import { toast } from 'sonner';
import { fluidSpring } from '../components/SystemManager';

interface ReferralRecord {
  id: string;
  referrer_uid: string;
  referrer_code: string;
  referred_uid: string;
  referred_email?: string;
  referred_name?: string;
  status: 'active' | 'pending' | 'qualified';
  commission_earned?: number;
  total_spent?: number;
  created_at?: string;
  timestamp?: any;
}

export default function Referrals() {
  const { user, userData } = useAuth();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [linkType, setLinkType] = useState<'signup' | 'gateway' | 'preview'>('signup');
  const [referralsList, setReferralsList] = useState<ReferralRecord[]>([]);
  const [isLoadingReferrals, setIsLoadingReferrals] = useState(true);

  // Calculator state
  const [calcFriends, setCalcFriends] = useState(10);
  const [calcAvgInvestment, setCalcAvgInvestment] = useState(500);

  const refCode = userData?.referral_code || 'MINER';
  const directSignupUrl = `https://poolmining.cloud/signup?ref=${refCode}`;
  const gatewayUrl = `https://poolmining.cloud/ref/${refCode}`;
  const originUrl = typeof window !== 'undefined' ? `${window.location.origin}/signup?ref=${refCode}` : directSignupUrl;

  const activeReferralLink = linkType === 'signup' 
    ? directSignupUrl 
    : linkType === 'gateway' 
      ? gatewayUrl 
      : originUrl;

  // Real-time listener for referred users from Firestore
  useEffect(() => {
    if (!user && !userData?.referral_code) {
      setIsLoadingReferrals(false);
      return;
    }

    try {
      const q = query(
        collection(db, 'referrals'),
        where('referrer_uid', '==', user?.uid || '')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: ReferralRecord[] = [];
        snapshot.forEach((doc) => {
          list.push({ id: doc.id, ...doc.data() } as ReferralRecord);
        });
        setReferralsList(list);
        setIsLoadingReferrals(false);
      }, (err) => {
        console.warn("Referrals snapshot listener error:", err);
        setIsLoadingReferrals(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.warn("Failed to subscribe to referrals:", e);
      setIsLoadingReferrals(false);
    }
  }, [user, userData?.referral_code]);

  // Dynamic metrics
  const totalReferralsCount = Math.max(userData?.referral_count || 0, referralsList.length);
  const activeMinersCount = referralsList.filter(r => r.status === 'active' || (r.total_spent && r.total_spent > 0)).length || (totalReferralsCount > 0 ? totalReferralsCount : 0);
  const totalCommissionEarned = userData?.referral_earnings || referralsList.reduce((acc, curr) => acc + (curr.commission_earned || 0), 0);

  // Tier calculation
  const getTier = (count: number) => {
    if (count >= 50) return { name: 'Platinum', rate: 0.15, rateStr: '15%', nextCount: 0, progress: 100, color: 'text-cyan-400', border: 'border-cyan-500/30', bg: 'bg-cyan-500/10' };
    if (count >= 21) return { name: 'Gold', rate: 0.10, rateStr: '10%', nextCount: 50, progress: Math.round(((count - 20) / 30) * 100), color: 'text-amber-400', border: 'border-amber-500/30', bg: 'bg-amber-500/10' };
    if (count >= 6) return { name: 'Silver', rate: 0.07, rateStr: '7%', nextCount: 21, progress: Math.round(((count - 5) / 15) * 100), color: 'text-slate-300', border: 'border-slate-400/30', bg: 'bg-slate-400/10' };
    return { name: 'Bronze', rate: 0.05, rateStr: '5%', nextCount: 6, progress: Math.round((count / 5) * 100), color: 'text-amber-600', border: 'border-amber-700/30', bg: 'bg-amber-700/10' };
  };

  const currentTier = getTier(totalReferralsCount);

  // Calculator estimate
  const estimatedMonthly = Math.round(calcFriends * calcAvgInvestment * currentTier.rate);
  const estimatedYearly = estimatedMonthly * 12;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(activeReferralLink);
    setCopiedLink(true);
    toast.success('Referral link copied to clipboard!');
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(refCode);
    setCopiedCode(true);
    toast.success(`Referral code ${refCode} copied!`);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  // Social share urls
  const shareTitle = encodeURIComponent(`Join PoolMining.cloud with my referral code ${refCode} and get access to high-yield institutional cloud mining & daily payouts!`);
  const shareUrl = encodeURIComponent(activeReferralLink);

  const stats = [
    { 
      label: 'Total Referrals', 
      value: totalReferralsCount, 
      subtext: `${totalReferralsCount} registered friends`, 
      icon: Users, 
      color: 'text-blue-500', 
      bg: 'bg-blue-500/10' 
    },
    { 
      label: 'Active Miners', 
      value: activeMinersCount, 
      subtext: 'Generating hashpower', 
      icon: TrendingUp, 
      color: 'text-emerald-500', 
      bg: 'bg-emerald-500/10' 
    },
    { 
      label: 'Total Earnings', 
      value: `$${Number(totalCommissionEarned || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      subtext: 'Instant lifetime payouts', 
      icon: DollarSign, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10' 
    },
    { 
      label: 'Current VIP Tier', 
      value: currentTier.name, 
      subtext: `${currentTier.rateStr} Commission Rate`, 
      icon: Award, 
      color: currentTier.color, 
      bg: currentTier.bg 
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0052ff]/10 border border-[#0052ff]/20 text-[#00f0ff] text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> Official Affiliate & Rewards Program
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4 text-primary">
          Refer Friends & <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Earn Lifetime Commissions</span>
        </h1>
        <p className="text-secondary max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
          Invite investors to join PoolMining.cloud. Earn up to <span className="text-primary font-semibold">15% commission</span> on all their mining contracts and daily profit payouts.
        </p>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: i * 0.08 }}
            className="bg-card rounded-3xl p-6 border border-border shadow-xl hover:border-border/80 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${stat.bg} w-fit`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className="text-[11px] font-mono text-muted uppercase tracking-wider">Metric 0{i + 1}</span>
            </div>
            <p className="text-sm text-secondary font-medium mb-1">{stat.label}</p>
            <p className="text-2xl sm:text-3xl font-extrabold text-primary mb-1">{stat.value}</p>
            <p className="text-xs text-muted">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Main 2-Col Left Side */}
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link & Share Box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#0052ff]/15 via-[#00f0ff]/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
            
            <div className="relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2 text-primary">
                    <Share2 size={22} className="text-[#00f0ff]" />
                    Your Personal Referral Link
                  </h3>
                  <p className="text-xs text-secondary mt-1">
                    Anyone who signs up using this link is automatically attached to your affiliate account.
                  </p>
                </div>

                <div className="flex items-center gap-1.5 bg-surface p-1 rounded-2xl border border-border self-start sm:self-auto">
                  <button
                    onClick={() => setLinkType('signup')}
                    className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${linkType === 'signup' ? 'bg-[#0052ff] text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                  >
                    Direct Signup (Recommended)
                  </button>
                  <button
                    onClick={() => setLinkType('gateway')}
                    className={`px-3 py-1 text-xs rounded-xl font-medium transition-all ${linkType === 'gateway' ? 'bg-[#0052ff] text-white shadow-sm' : 'text-muted hover:text-primary'}`}
                  >
                    Short Link (/ref/)
                  </button>
                </div>
              </div>

              {/* Link Input Bar */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-6">
                <div className="flex-1 p-3.5 sm:p-4 bg-surface rounded-2xl border border-border font-mono text-sm text-primary break-all flex items-center select-all">
                  {activeReferralLink}
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-initial px-6 py-3.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-2xl font-bold text-sm transition-all shadow-lg shadow-[#0052ff]/20 flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {copiedLink ? <Check size={18} className="text-emerald-400" /> : <Copy size={18} />}
                    {copiedLink ? 'Copied!' : 'Copy Link'}
                  </button>

                  <button
                    onClick={() => setShowQRModal(true)}
                    className="p-3.5 bg-surface hover:bg-subtle text-primary rounded-2xl border border-border transition-colors flex items-center justify-center"
                    title="View QR Code"
                  >
                    <QrCode size={20} />
                  </button>
                </div>
              </div>

              {/* Code Snippet & Quick Copy */}
              <div className="p-4 rounded-2xl bg-surface/60 border border-border/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-muted mb-0.5">Your Referral Code</div>
                  <div className="text-xl font-black font-mono tracking-widest text-[#00f0ff]">{refCode}</div>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="px-4 py-2 bg-subtle hover:bg-subtle-hover rounded-xl text-xs font-semibold text-primary transition-colors flex items-center gap-1.5"
                >
                  {copiedCode ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                  {copiedCode ? 'Code Copied' : 'Copy Code Only'}
                </button>
              </div>

              {/* 1-Click Social Sharing */}
              <div>
                <div className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Instant 1-Click Social Share</div>
                <div className="flex flex-wrap gap-2.5">
                  <a 
                    href={`https://t.me/share/url?url=${shareUrl}&text=${shareTitle}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#229ED9]/10 hover:bg-[#229ED9]/20 text-[#229ED9] border border-[#229ED9]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Send size={14} /> Telegram
                  </a>
                  <a 
                    href={`https://api.whatsapp.com/send?text=${shareTitle}%20${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <MessageCircle size={14} /> WhatsApp
                  </a>
                  <a 
                    href={`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X (Twitter)
                  </a>
                  <a 
                    href={`mailto:?subject=${encodeURIComponent('Invitation to PoolMining.cloud')}&body=${shareTitle}%0A%0AJoin%20here:%20${shareUrl}`}
                    className="px-3.5 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold transition-all flex items-center gap-1.5"
                  >
                    <Mail size={14} /> Email
                  </a>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Interactive Calculator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.1 }}
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#0052ff]/10 rounded-2xl">
                <Calculator className="text-[#0052ff]" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Referral Earnings Calculator</h3>
                <p className="text-xs text-secondary">Estimate your passive income based on your current tier ({currentTier.rateStr})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-secondary">Invited Friends</label>
                  <span className="text-base font-bold text-primary">{calcFriends} users</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={calcFriends}
                  onChange={(e) => setCalcFriends(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[#0052ff]"
                />
                <div className="flex justify-between text-[11px] text-muted mt-1 font-mono">
                  <span>1</span>
                  <span>50</span>
                  <span>100+</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-semibold text-secondary">Avg. Contract Amount</label>
                  <span className="text-base font-bold text-primary">${calcAvgInvestment}</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="5000"
                  step="50"
                  value={calcAvgInvestment}
                  onChange={(e) => setCalcAvgInvestment(Number(e.target.value))}
                  className="w-full h-2 bg-surface rounded-lg appearance-none cursor-pointer accent-[#00f0ff]"
                />
                <div className="flex justify-between text-[11px] text-muted mt-1 font-mono">
                  <span>$100</span>
                  <span>$2,500</span>
                  <span>$5,000</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl bg-surface/80 border border-border">
              <div>
                <p className="text-xs text-secondary font-medium">Estimated Monthly Commissions</p>
                <p className="text-3xl font-extrabold text-emerald-400 mt-1">${estimatedMonthly.toLocaleString()}</p>
                <p className="text-[11px] text-muted mt-0.5">Credited in real-time to your balance</p>
              </div>
              <div>
                <p className="text-xs text-secondary font-medium">Projected Annual Revenue</p>
                <p className="text-3xl font-extrabold text-[#00f0ff] mt-1">${estimatedYearly.toLocaleString()}</p>
                <p className="text-[11px] text-muted mt-0.5">Assumes active rolling contracts</p>
              </div>
            </div>
          </motion.div>

          {/* Referred Members History Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.15 }}
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <UserCheck size={22} className="text-emerald-500" />
                  Referred Members ({referralsList.length})
                </h3>
                <p className="text-xs text-secondary mt-1">Real-time status of users who joined with your referral link</p>
              </div>
            </div>

            {isLoadingReferrals ? (
              <div className="py-12 text-center text-muted">
                <div className="w-8 h-8 border-2 border-[#0052ff] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs">Loading referral records...</p>
              </div>
            ) : referralsList.length === 0 ? (
              <div className="py-12 px-4 rounded-2xl bg-surface/50 border border-border/60 text-center">
                <Users size={36} className="text-muted mx-auto mb-3 opacity-60" />
                <h4 className="font-bold text-primary mb-1">No referrals recorded yet</h4>
                <p className="text-xs text-secondary max-w-sm mx-auto mb-6">
                  Share your link on social media or send it directly to your crypto community to start earning commissions!
                </p>
                <button
                  onClick={handleCopyLink}
                  className="px-6 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-full text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5"
                >
                  <Copy size={14} /> Copy & Share Your Link
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border/80 text-[11px] font-mono text-muted uppercase">
                      <th className="pb-3 pl-2">User / Email</th>
                      <th className="pb-3">Join Date</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right pr-2">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40 text-sm">
                    {referralsList.map((item) => (
                      <tr key={item.id} className="hover:bg-surface/50 transition-colors">
                        <td className="py-3 pl-2 font-medium text-primary">
                          {item.referred_email ? (
                            <span>{item.referred_email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}</span>
                          ) : (
                            <span>{item.referred_name || 'Anonymous Miner'}</span>
                          )}
                        </td>
                        <td className="py-3 text-xs text-secondary font-mono">
                          {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}
                        </td>
                        <td className="py-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Active
                          </span>
                        </td>
                        <td className="py-3 text-right pr-2 font-mono font-bold text-emerald-400">
                          +${Number(item.commission_earned || 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </motion.div>
        </div>

        {/* 1-Col Right Sidebar */}
        <div className="space-y-8">
          {/* Tier Program Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-amber-500/10 rounded-2xl">
                <Gift className="text-amber-500" size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">VIP Rewards Tiers</h3>
                <p className="text-xs text-secondary">Earn higher rates as your network grows</p>
              </div>
            </div>

            {/* Current Tier Progress */}
            <div className="p-4 rounded-2xl bg-surface border border-border mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-semibold text-secondary">Current Status</span>
                <span className={`text-xs font-bold uppercase tracking-wider ${currentTier.color}`}>
                  {currentTier.name} ({currentTier.rateStr})
                </span>
              </div>
              <div className="w-full bg-subtle h-2 rounded-full overflow-hidden mb-2">
                <div 
                  className="h-full bg-gradient-to-r from-[#0052ff] to-[#00f0ff] rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, Math.max(10, currentTier.progress))}%` }}
                />
              </div>
              <p className="text-[11px] text-muted flex items-center justify-between">
                <span>{totalReferralsCount} Referrals</span>
                {currentTier.nextCount > 0 && (
                  <span>{currentTier.nextCount - totalReferralsCount} more for next tier</span>
                )}
              </p>
            </div>

            <div className="space-y-3">
              {[
                { tier: 'Bronze', req: '0 - 5 Referrals', comm: '5%', active: currentTier.name === 'Bronze', color: 'text-amber-600' },
                { tier: 'Silver', req: '6 - 20 Referrals', comm: '7%', active: currentTier.name === 'Silver', color: 'text-slate-300' },
                { tier: 'Gold', req: '21 - 50 Referrals', comm: '10%', active: currentTier.name === 'Gold', color: 'text-amber-400' },
                { tier: 'Platinum', req: '50+ Referrals', comm: '15%', active: currentTier.name === 'Platinum', color: 'text-cyan-400' },
              ].map((tier, i) => (
                <div 
                  key={i} 
                  className={`p-3.5 rounded-2xl border transition-all ${
                    tier.active 
                      ? 'bg-[#0052ff]/10 border-[#0052ff]/40 shadow-sm' 
                      : 'bg-surface/60 border-border/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className={`font-bold text-sm ${tier.color}`}>{tier.tier}</span>
                    <span className={`text-xs font-mono font-bold ${tier.active ? 'text-[#00f0ff]' : 'text-muted'}`}>
                      {tier.comm} Comm.
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[11px] text-muted">
                    <span>{tier.req}</span>
                    {tier.active && <span className="text-emerald-400 font-semibold">Active</span>}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 3 Steps Guide */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...fluidSpring, delay: 0.1 }}
            className="bg-card rounded-3xl p-6 sm:p-8 border border-border shadow-xl space-y-4"
          >
            <h3 className="text-lg font-bold text-primary">How Referral Payouts Work</h3>
            <div className="space-y-4">
              {[
                { step: '1', title: 'Share your link', desc: 'Distribute your unique link or code to friends & followers.' },
                { step: '2', title: 'They activate mining', desc: 'When your referrals purchase hashpower, rewards are credited instantly.' },
                { step: '3', title: 'Instant withdrawal', desc: 'Commissions can be withdrawn anytime to your crypto wallet with 0 lockup.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/20 flex items-center justify-center font-bold text-xs shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-primary">{item.title}</h4>
                    <p className="text-xs text-secondary mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Help card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...fluidSpring, delay: 0.15 }}
            className="bg-gradient-to-br from-[#0052ff] to-[#003cb3] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20 pointer-events-none" />
            <h3 className="text-xl font-bold mb-2 relative z-10">Affiliate Support</h3>
            <p className="text-xs text-white/80 mb-6 relative z-10 leading-relaxed">
              Have a large audience or institutional traffic? Contact our partner managers for custom revenue sharing up to 25%.
            </p>
            <a 
              href="/support"
              className="w-full py-3 bg-white text-[#0052ff] rounded-full font-bold text-xs hover:bg-white/90 transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              Contact VIP Support <ArrowRight size={14} />
            </a>
          </motion.div>
        </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQRModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative text-center"
            >
              <button
                onClick={() => setShowQRModal(false)}
                className="absolute top-4 right-4 p-2 text-muted hover:text-primary rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex justify-center mb-4">
                <div className="p-3 bg-[#0052ff]/10 rounded-2xl">
                  <QrCode className="text-[#0052ff]" size={28} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-primary mb-1">Referral QR Code</h3>
              <p className="text-xs text-secondary mb-6">Let friends scan this code with their smartphone camera to join</p>

              <div className="p-4 bg-white rounded-2xl shadow-inner inline-block mb-6">
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(activeReferralLink)}`}
                  alt="Referral QR Code" 
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="p-3 bg-surface rounded-xl border border-border text-xs font-mono text-secondary break-all mb-6">
                {activeReferralLink}
              </div>

              <button
                onClick={handleCopyLink}
                className="w-full py-3 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Copy size={14} /> Copy Link to Share
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
