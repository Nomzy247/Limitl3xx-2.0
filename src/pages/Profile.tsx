import React from 'react';
import { motion } from 'motion/react';
import { User, Mail, Calendar, Shield, Award, TrendingUp, Wallet, ArrowRight, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'sonner';
import { fluidSpring } from '../components/SystemManager';

export default function Profile() {
  const { userData } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const profileStats = [
    { label: 'Total Balance', value: `$${(userData?.balance || 0).toLocaleString()}`, icon: Wallet, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { label: 'Mining Level', value: `Level ${userData?.level || 1}`, icon: Award, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { label: 'Referrals', value: userData?.referral_count || 0, icon: User, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { label: 'Efficiency', value: '98.5%', icon: TrendingUp, color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Sidebar */}
        <div className="lg:col-span-1 space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl text-center flex flex-col items-center"
          >
            <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-5xl mb-6 border-4 border-[#0052ff]/20">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <h2 className="text-2xl font-bold mb-1">{userData?.name || 'User'}</h2>
            <p className="text-secondary text-sm mb-6">{userData?.email}</p>
            
            <div className="w-full space-y-3">
              <button 
                onClick={() => navigate('/settings')}
                className="w-full py-3 bg-subtle hover:bg-subtle-hover text-primary rounded-full font-bold transition-all flex items-center justify-center gap-2 border border-border/50"
              >
                <Settings size={18} /> Edit Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full py-3 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-full font-bold transition-all flex items-center justify-center gap-2"
              >
                <LogOut size={18} /> Sign Out
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.1 }}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl"
          >
            <h3 className="font-bold mb-6 flex items-center gap-2">
              <Shield size={20} className="text-[#00f0ff]" />
              Account Verification
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-muted" />
                  <span className="text-sm font-medium">Email Verified</span>
                </div>
                <span className="text-emerald-400 font-bold text-xs">YES</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <User size={18} className="text-muted" />
                  <span className="text-sm font-medium">KYC Status</span>
                </div>
                <span className={`font-bold text-xs ${
                  userData?.verification_status === 'verified' ? 'text-emerald-400' :
                  userData?.verification_status === 'pending' ? 'text-yellow-400' :
                  'text-rose-400'
                }`}>
                  {userData?.verification_status?.toUpperCase() || 'PENDING'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-muted" />
                  <span className="text-sm font-medium">Member Since</span>
                </div>
                <span className="text-primary font-bold text-xs">
                  {userData?.joined_date ? new Date(userData.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Profile Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileStats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...fluidSpring, delay: i * 0.1 }}
                className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl flex items-center gap-4"
              >
                <div className={`p-4 rounded-2xl ${stat.bg}`}>
                  <stat.icon className={stat.color} size={24} />
                </div>
                <div>
                  <p className="text-xs text-secondary font-medium uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.4 }}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl"
          >
            <h3 className="text-xl font-bold mb-6">Recent Mining Activity</h3>
            <div className="space-y-4">
              {[
                { title: 'Daily Mining Reward', amount: '+0.00042 BTC', date: 'Today, 10:45 AM' },
                { title: 'Daily Mining Reward', amount: '+0.00041 BTC', date: 'Yesterday, 10:45 AM' },
                { title: 'Daily Mining Reward', amount: '+0.00043 BTC', date: 'Mar 22, 10:45 AM' },
              ].map((activity, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border/50">
                  <div>
                    <p className="font-semibold text-primary">{activity.title}</p>
                    <p className="text-xs text-muted mt-1">{activity.date}</p>
                  </div>
                  <span className="text-emerald-400 font-bold">{activity.amount}</span>
                </div>
              ))}
              <button 
                onClick={() => navigate('/transactions')}
                className="w-full py-3 text-sm font-bold text-[#0052ff] hover:underline flex items-center justify-center gap-2"
              >
                View Full History <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...fluidSpring, delay: 0.5 }}
            className="bg-[#0052ff] rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-[100px] opacity-20 pointer-events-none" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-4">Upgrade Your Mining Power</h3>
              <p className="text-white/80 mb-8 max-w-md leading-relaxed">
                Unlock higher daily returns and premium features by upgrading to a higher mining tier.
              </p>
              <button 
                onClick={() => navigate('/buy-hashpower')}
                className="px-8 py-4 bg-white text-[#0052ff] rounded-full font-bold hover:bg-white/90 transition-all shadow-lg flex items-center gap-2"
              >
                Explore Plans <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
