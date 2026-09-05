import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Home, Wallet, Activity, User, Settings, 
  HelpCircle, History, Plus, ArrowUpRight, 
  ArrowDownRight, Shield, Users, TrendingUp,
  Zap, Globe, Share2, Hexagon, ArrowUp, Menu
} from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { fluidSpring } from '../components/SystemManager';
import { useAuth } from '../context/AuthContext';
import { db, collection, query, where, onSnapshot } from '../firebase';
import MobileDrawer from '../components/MobileDrawer';

export default function Hub() {
  const { user, userData, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [totalMined, setTotalMined] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'contracts'), where('user_id', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let sum = 0;
      snapshot.forEach(doc => { sum += (doc.data().mined || 0); });
      setTotalMined(sum);
    }, (err) => {
      console.warn('Hub contracts listener note:', err?.message);
    });
    return () => unsubscribe();
  }, [user]);

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
    { icon: Home, label: 'Dashboard', path: '/dashboard', color: 'text-[#0052ff]' },
    { icon: TrendingUp, label: 'Stocks', path: '/buy-hashpower', color: 'text-emerald-400' },
    { icon: Zap, label: 'Mining', path: '/buy-hashpower', color: 'text-yellow-400' },
    { icon: Wallet, label: 'Wallet', path: '/wallet', color: 'text-purple-400' },
    { icon: History, label: 'History', path: '/transactions', color: 'text-pink-400' },
    { icon: Users, label: 'Referrals', path: '/referrals', color: 'text-orange-400' },
    { icon: HelpCircle, label: 'Support', path: '/support', color: 'text-[#00f0ff]' },
    { icon: Settings, label: 'Settings', path: '/settings', color: 'text-secondary' },
  ];

  if (isAdmin) {
    menuItems.push({ icon: Shield, label: 'Admin', path: '/admin/dashboard', color: 'text-[#00f0ff]' });
  }

  const quickActions = [
    { icon: ArrowDownRight, label: 'DEPOSIT', path: '/deposit' },
    { icon: ArrowUpRight, label: 'WITHDRAW', path: '/withdraw' },
    { icon: Plus, label: 'BUY HASH', path: '/buy-hashpower' },
    { icon: Globe, label: 'E-PAYMENT', path: '/integration/e-payment' },
  ];

  return (
    <div className="min-h-screen bg-background px-4 py-8 pb-24 max-w-7xl mx-auto">
      
      {/* Top Logo Chip */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center gap-2 bg-surface border border-border/50 px-4 py-2 rounded-full shadow-lg">
          <Hexagon className="text-[#00f0ff]" size={16} />
          <span className="text-sm font-bold text-white">PoolMining<span className="text-[#00f0ff]">.cloud</span></span>
          <ArrowUp className="text-secondary ml-2" size={14} />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Mobile Hub</h1>
          <p className="text-secondary text-sm">Quick access to all platform features</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#0052ff]/10 text-[#0052ff] dark:text-[#00f0ff] font-bold text-xs hover:bg-[#0052ff]/20 transition-colors"
            title="Open Navigation Drawer"
          >
            <Menu size={16} />
            <span className="hidden sm:inline">Drawer</span>
          </button>
          <Link to="/profile">
            <motion.div 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-10 h-10 rounded-full bg-[#0052ff]/10 flex items-center justify-center text-[#0052ff] font-bold text-lg"
            >
              {userData?.name?.charAt(0) || 'U'}
            </motion.div>
          </Link>
        </div>
      </div>

      {/* Stats Summary */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.2 }}
        className="mb-8 bg-gradient-to-br from-[#00f0ff] to-[#0052ff] p-6 rounded-2xl text-white shadow-2xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <p className="text-white/80 text-xs font-bold uppercase tracking-widest mb-1">CURRENT BALANCE</p>
              <h3 className="text-4xl font-bold tracking-tighter">${userData?.balance?.toLocaleString() || '0'}</h3>
            </div>
            <div className="pt-4 border-t border-white/20">
              <p className="text-emerald-300 font-bold text-xs uppercase tracking-widest mb-1 flex items-center gap-2"><Activity size={12} /> TOTAL PROFIT</p>
              <h3 className="text-4xl font-bold tracking-tighter text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]">
                ${(totalMined + (userData?.manual_profits || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md">
              <TrendingUp size={14} />
              +12.5% this week
            </div>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 text-xs font-bold bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-full backdrop-blur-md transition-colors"
            >
              <Share2 size={14} />
              Share App
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-24 -mt-24" />
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {quickActions.map((action, i) => (
          <Link key={i} to={action.path}>
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-surface border border-border/50 p-4 rounded-xl flex items-center justify-between shadow-lg"
            >
              <span className="text-[11px] font-bold text-white uppercase tracking-wider">{action.label}</span>
              <action.icon size={16} className="text-secondary" />
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Main Grid */}
      <div className="flex flex-col gap-4">
        {menuItems.map((item, i) => (
          <Link key={i} to={item.path}>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...fluidSpring, delay: i * 0.05 }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="bg-surface border border-border/50 p-5 rounded-xl flex items-center gap-4 shadow-lg relative overflow-hidden group"
            >
              <div className={`p-2 bg-background/50 rounded-lg ${item.color}`}>
                <item.icon size={20} />
              </div>
              <span className="font-bold text-base text-white">{item.label}</span>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Link>
        ))}
      </div>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </div>
  );
}
