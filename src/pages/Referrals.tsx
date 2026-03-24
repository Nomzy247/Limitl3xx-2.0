import React from 'react';
import { motion } from 'motion/react';
import { Users, Gift, Share2, TrendingUp, DollarSign, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

export default function Referrals() {
  const { userData } = useAuth();

  const referralLink = `https://poolmining.cloud/ref/${userData?.referralCode || 'USER'}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success('Referral link copied to clipboard!');
  };

  const referralStats = [
    { label: 'Total Referrals', value: userData?.referralCount || 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Active Miners', value: 0, icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Total Earnings', value: '$0.00', icon: DollarSign, color: 'text-purple-500', bg: 'bg-purple-500/10' },
    { label: 'Current Level', value: 'Bronze', icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Refer & Earn Rewards</h1>
        <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
          Invite your friends to join PoolMining.cloud and earn a lifetime commission of 5% on all their mining profits.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {referralStats.map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
          >
            <div className={`p-3 rounded-xl ${stat.bg} w-fit mb-4`}>
              <stat.icon className={stat.color} size={24} />
            </div>
            <p className="text-sm text-secondary font-medium mb-1">{stat.label}</p>
            <p className="text-2xl font-bold text-primary">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Referral Link Card */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052ff] rounded-full blur-[100px] opacity-10 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Share2 size={24} className="text-[#00f0ff]" />
                Your Referral Link
              </h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 p-4 bg-surface rounded-2xl border border-border/50 font-mono text-sm text-primary break-all">
                  {referralLink}
                </div>
                <button 
                  onClick={handleCopy}
                  className="px-8 py-4 bg-[#0052ff] text-white rounded-2xl font-bold hover:bg-[#0052ff]/90 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  Copy Link
                </button>
              </div>
              <div className="mt-8 flex gap-4">
                <button className="p-3 bg-subtle hover:bg-subtle-hover rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </button>
                <button className="p-3 bg-subtle hover:bg-subtle-hover rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.17.054 1.805.249 2.227.412.56.216.96.474 1.38.894.42.42.678.82 1.38 1.38.163.422.358 1.057.412 2.227.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.054 1.17-.249 1.805-.412 2.227-.216.56-.474.96-.894 1.38-.42.42-.82.678-1.38 1.38-.422.163-1.057.358-2.227.412-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.054-1.805-.249-2.227-.412-.56-.216-.96-.474-1.38-.894-.42-.42-.678-.82-1.38-1.38-.163-.422-.358-1.057-.412-2.227-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.054-1.17.249-1.805.412-2.227.216-.56.474-.96.894-1.38.42-.42.82-.678 1.38-1.38.422-.163 1.057-.358 2.227-.412 1.266-.058 1.646-.07 4.85-.07m0-2.163c-3.259 0-3.667.014-4.947.072-1.277.057-2.15.26-2.914.557-.79.307-1.459.717-2.126 1.384-.667.667-1.077 1.336-1.384 2.126-.297.764-.5 1.637-.557 2.914-.058 1.28-.072 1.688-.072 4.947s.014 3.667.072 4.947c.057 1.277.26 2.15.557 2.914.307.79.717 1.459 1.384 2.126.667.667 1.336 1.077 2.126 1.384.764.297 1.637.5 2.914.557 1.28.058 1.688.072 4.947.072s3.667-.014 4.947-.072c1.277-.057 2.15-.26 2.914-.557.79-.307 1.459-.717 2.126-1.384.667-.667 1.077-1.336 1.384-2.126.297-.764.5-1.637.557-2.914.058-1.28.072-1.688.072-4.947s-.014-3.667-.072-4.947c-.057-1.277-.26-2.15-.557-2.914-.307-.79-.717-1.459-1.384-2.126-.667-.667-1.336-1.077-2.126-1.384-.764-.297-1.637-.5-2.914-.557-1.28-.058-1.688-.072-4.947-.072z"/><path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                </button>
                <button className="p-3 bg-subtle hover:bg-subtle-hover rounded-full transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/></svg>
                </button>
              </div>
            </div>
          </motion.div>

          {/* How it works */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold">How it works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { step: '01', title: 'Invite Friends', desc: 'Share your unique referral link with your network.' },
                { step: '02', title: 'They Start Mining', desc: 'Your friends sign up and purchase mining contracts.' },
                { step: '03', title: 'Earn Commission', desc: 'Receive 5% of their mining profits instantly.' },
              ].map((item, i) => (
                <div key={i} className="p-6 bg-card rounded-2xl border border-border/50 relative group">
                  <span className="text-4xl font-bold text-[#0052ff]/10 absolute top-4 right-4 group-hover:text-[#0052ff]/20 transition-colors">{item.step}</span>
                  <h4 className="font-bold mb-2">{item.title}</h4>
                  <p className="text-xs text-secondary leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-amber-500/10 rounded-xl">
                <Gift className="text-amber-500" size={24} />
              </div>
              <h3 className="text-xl font-bold">Rewards Program</h3>
            </div>
            <p className="text-sm text-secondary leading-relaxed mb-6">
              Reach new tiers to unlock higher commissions and exclusive bonuses.
            </p>
            <div className="space-y-4">
              {[
                { tier: 'Bronze', req: '0-5 Referrals', comm: '5%', active: true },
                { tier: 'Silver', req: '6-20 Referrals', comm: '7%', active: false },
                { tier: 'Gold', req: '21-50 Referrals', comm: '10%', active: false },
                { tier: 'Platinum', req: '50+ Referrals', comm: '15%', active: false },
              ].map((tier, i) => (
                <div key={i} className={`p-4 rounded-xl border ${tier.active ? 'bg-[#0052ff]/5 border-[#0052ff]/20' : 'bg-surface border-border/50 opacity-60'}`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-bold ${tier.active ? 'text-primary' : 'text-muted'}`}>{tier.tier}</span>
                    <span className={`text-xs font-bold ${tier.active ? 'text-[#00f0ff]' : 'text-muted'}`}>{tier.comm} Comm.</span>
                  </div>
                  <p className="text-[10px] text-muted mt-1">{tier.req}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0052ff] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full blur-[60px] opacity-20 pointer-events-none" />
            <h3 className="text-xl font-bold mb-4 relative z-10">Need Help?</h3>
            <p className="text-sm text-white/80 mb-6 relative z-10">
              Our support team is here to help you maximize your referral earnings.
            </p>
            <button className="w-full py-3 bg-white text-[#0052ff] rounded-full font-bold hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
              Contact Support <ArrowRight size={16} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
