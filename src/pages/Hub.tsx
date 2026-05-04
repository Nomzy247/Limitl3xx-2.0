import { motion } from 'motion/react';
import { 
  Home, Wallet, Activity, User, Settings, 
  HelpCircle, History, Plus, ArrowUpRight, 
  ArrowDownRight, Shield, Users, TrendingUp,
  Cpu, Cloud, Zap, Globe, Mail, Phone, Share2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { fluidSpring } from '../components/SystemManager';
import { useAuth } from '../context/AuthContext';

export default function Hub() {
  const { userData, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PoolMining.cloud',
          text: 'Join the premium crypto and fintech platform for automated wealth generation!',
          url: window.location.origin,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success('Link copied to clipboard!');
    }
  };

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'text-[#0052ff]', bg: 'bg-[#0052ff]/10' },
    { icon: TrendingUp, label: 'Stocks', path: '/buy-hashpower', color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { icon: Zap, label: 'Mining', path: '/buy-hashpower', color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
    { icon: Wallet, label: 'Wallet', path: '/wallet', color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { icon: History, label: 'History', path: '/transactions', color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { icon: Users, label: 'Referrals', path: '/referrals', color: 'text-orange-400', bg: 'bg-orange-400/10' },
    { icon: HelpCircle, label: 'Support', path: '/support', color: 'text-[#00f0ff]', bg: 'bg-[#00f0ff]/10' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-secondary', bg: 'bg-secondary/10' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Admin', path: '/admin', color: 'text-sky-400', bg: 'bg-sky-400/10' });
  }

  const quickActions = [
    { icon: ArrowDownRight, label: 'Deposit', path: '/deposit' },
    { icon: ArrowUpRight, label: 'Withdraw', path: '/withdraw' },
    { icon: Plus, label: 'Buy Hash', path: '/buy-hashpower' },
    { icon: Globe, label: 'E-Payment', path: '/integration/e-payment' },
  ];

  return (
    <div className="min-h-screen bg-surface px-4 py-8 pb-24 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Menu</h1>
          <p className="text-secondary text-sm">Quick access to all features</p>
        </div>
        <Link to="/profile">
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-[#0052ff]/10 flex items-center justify-center text-[#0052ff] font-bold text-xl border border-[#0052ff]/20"
          >
            {userData?.name?.charAt(0) || 'U'}
          </motion.div>
        </Link>
      </div>

      {/* Stats Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.5 }}
        className="mb-8 bg-gradient-to-br from-[#0052ff] to-[#00f0ff] p-6 rounded-3xl text-white shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Current Balance</p>
          <h3 className="text-3xl font-bold mb-4">${userData?.balance?.toLocaleString() || '0.00'}</h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-md">
              <TrendingUp size={14} />
              +12.5% this week
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-4 py-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              <Share2 size={14} />
              Share App
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.path}>
            <motion.div
              whileHover={{ y: -5, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={fluidSpring}
              className="bg-card border border-border/50 p-4 rounded-2xl flex flex-row items-center justify-between gap-2 shadow-lg"
            >
              <span className="text-xs font-bold uppercase tracking-wider">{action.label}</span>
              <div className="p-2 bg-primary/5 rounded-xl text-primary">
                <action.icon size={20} />
              </div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} to={item.path}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-card border border-border/50 p-6 rounded-3xl flex items-center gap-4 shadow-xl relative overflow-hidden group"
            >
              <div className={`p-4 ${item.bg} ${item.color} rounded-2xl transition-transform group-hover:scale-110`}>
                <item.icon size={28} />
              </div>
              <span className="font-bold text-xl">{item.label}</span>
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
}
