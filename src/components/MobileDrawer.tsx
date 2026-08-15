import React, { useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LayoutDashboard,
  ChartCandlestick,
  Database,
  CloudRain,
  ShoppingBag,
  Wallet,
  Settings as SettingsIcon,
  LogOut,
  User,
  MessageSquare,
  Shield,
  Zap,
  History,
  Users,
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Sun,
  Moon,
  ChevronRight,
  Globe,
  Share2,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import LanguageSelector from './LanguageSelector';
import DiscordIcon from './DiscordIcon';
import { toast } from 'sonner';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  const { user, userData, isAdmin } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  // Close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Close drawer on location change
  useEffect(() => {
    onClose();
  }, [location.pathname]);

  const handleLogout = async () => {
    onClose();
    try {
      const { logOut } = await import('../firebase');
      await logOut();
      toast.success(t('nav.logoutSuccess', { defaultValue: 'Logged out successfully' }));
      navigate('/login');
    } catch {
      toast.error('Failed to logout');
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PoolMining.cloud',
          text: 'Join the premium crypto & mining platform!',
          url: window.location.origin,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      navigator.clipboard.writeText(window.location.origin);
      toast.success('Platform URL copied to clipboard!');
    }
  };

  const navGroups = [
    {
      title: t('nav.tradingGroup', { defaultValue: 'Trading & Markets' }),
      items: [
        { name: t('nav.dashboard', { defaultValue: 'Dashboard' }), icon: LayoutDashboard, path: '/dashboard', badge: null },
        { name: t('nav.liveTrading', { defaultValue: 'Live Trading' }), icon: ChartCandlestick, path: '/live-trading', badge: 'LIVE' },
        { name: t('nav.spotTrading', { defaultValue: 'Spot Trading' }), icon: Zap, path: '/crypto-trading', badge: null },
      ]
    },
    {
      title: t('nav.miningGroup', { defaultValue: 'Mining & Power' }),
      items: [
        { name: t('nav.poolMining', { defaultValue: 'Pool Mining' }), icon: Database, path: '/pool-mining', badge: 'HOT' },
        { name: t('nav.cloudMining', { defaultValue: 'Cloud Mining' }), icon: CloudRain, path: '/cloud-mining', badge: null },
        { name: t('nav.buyHash', { defaultValue: 'Buy Hashpower' }), icon: Plus, path: '/buy-hashpower', badge: null },
        { name: t('nav.marketplace', { defaultValue: 'Marketplace' }), icon: ShoppingBag, path: '/marketplace', badge: null },
      ]
    },
    {
      title: t('nav.accountGroup', { defaultValue: 'Account & Finances' }),
      items: [
        { name: t('nav.hub', { defaultValue: 'Mobile Hub' }), icon: LayoutDashboard, path: '/hub', badge: null },
        { name: t('nav.wallet', { defaultValue: 'Wallet' }), icon: Wallet, path: '/wallet', badge: null },
        { name: t('nav.history', { defaultValue: 'Transactions' }), icon: History, path: '/transactions', badge: null },
        { name: t('nav.profile', { defaultValue: 'Profile' }), icon: User, path: '/profile', badge: null },
        { name: t('nav.referrals', { defaultValue: 'Referrals' }), icon: Users, path: '/referrals', badge: null },
        { name: t('nav.epayment', { defaultValue: 'E-Payment' }), icon: Globe, path: '/integration/e-payment', badge: null },
      ]
    },
    {
      title: t('nav.supportGroup', { defaultValue: 'System & Support' }),
      items: [
        { name: 'FAQ & Help', icon: HelpCircle, path: '/faq', badge: null },
        { name: t('nav.support', { defaultValue: 'Support Center' }), icon: MessageSquare, path: '/support', badge: null },
        { name: t('nav.settings', { defaultValue: 'Settings' }), icon: SettingsIcon, path: '/settings', badge: null },
      ]
    }
  ];

  if (isAdmin) {
    navGroups.push({
      title: 'Administrator',
      items: [
        { name: 'Admin Dashboard', icon: Shield, path: '/admin/dashboard', badge: 'ADMIN' },
        { name: 'Live Support Desk', icon: MessageSquare, path: '/admin/support', badge: null },
        { name: 'Admin Settings', icon: SettingsIcon, path: '/admin/settings', badge: null },
      ]
    });
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/65 backdrop-blur-sm"
          />

          {/* Slide-out Drawer Panel */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="relative w-[85%] max-w-sm h-full bg-surface dark:bg-[#0b0e17] text-primary shadow-2xl flex flex-col border-r border-border overflow-hidden"
          >
            {/* Header / User Info Card */}
            <div className="p-5 border-b border-border bg-subtle/50 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full text-secondary hover:text-primary hover:bg-surface/80 transition-colors"
                aria-label="Close navigation menu"
              >
                <X size={20} />
              </button>

              {user ? (
                <div className="flex items-center gap-3.5 pr-8">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0052ff] to-[#00f0ff] flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                      {userData?.name ? userData.name.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                    {userData?.verification_status === 'verified' && (
                      <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full ring-2 ring-surface">
                        <CheckCircle2 size={12} />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-sm text-primary truncate">
                      {userData?.name || 'User Profile'}
                    </h3>
                    <p className="text-xs text-muted truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0052ff]/10 text-[#0052ff] dark:text-[#00f0ff]">
                      <Sparkles size={10} /> {userData?.verification_status?.toUpperCase() || 'VERIFIED USER'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="pr-8">
                  <div className="flex items-center gap-2 text-base font-bold text-primary">
                    <Zap className="text-[#0052ff]" size={20} />
                    <span>PoolMining<span className="text-[#0052ff]">.cloud</span></span>
                  </div>
                  <p className="text-xs text-muted mt-1">
                    Access your wallet, trading algorithms & cloud mining hardware.
                  </p>
                </div>
              )}
            </div>

            {/* Quick Financial Shortcuts (If Logged In) */}
            {user && (
              <div className="p-3 bg-surface border-b border-border/60">
                <div className="grid grid-cols-2 gap-2">
                  <NavLink
                    to="/deposit"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 text-xs font-bold transition-colors"
                  >
                    <ArrowDownRight size={14} />
                    <span>DEPOSIT</span>
                  </NavLink>
                  <NavLink
                    to="/withdraw"
                    onClick={onClose}
                    className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#0052ff]/10 text-[#0052ff] dark:text-[#00f0ff] hover:bg-[#0052ff]/20 text-xs font-bold transition-colors"
                  >
                    <ArrowUpRight size={14} />
                    <span>WITHDRAW</span>
                  </NavLink>
                </div>
              </div>
            )}

            {/* Scrollable Navigation Items */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6 custom-scrollbar">
              {user ? (
                navGroups.map((group, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted px-2 mb-1">
                      {group.title}
                    </h4>
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onClose}
                          className={`flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-xs transition-all ${
                            isActive
                              ? 'bg-[#0052ff] text-white shadow-lg shadow-blue-500/25 font-semibold'
                              : 'text-secondary hover:text-primary hover:bg-subtle'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={17} className={isActive ? 'text-white' : 'text-secondary'} />
                            <span>{item.name}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                                item.badge === 'HOT'
                                  ? 'bg-rose-500 text-white'
                                  : item.badge === 'LIVE'
                                  ? 'bg-emerald-500 text-white animate-pulse'
                                  : 'bg-blue-500/20 text-blue-400'
                              }`}>
                                {item.badge}
                              </span>
                            )}
                            <ChevronRight size={14} className={isActive ? 'text-white/80' : 'text-muted/40'} />
                          </div>
                        </NavLink>
                      );
                    })}
                  </div>
                ))
              ) : (
                <div className="space-y-3 pt-2">
                  <NavLink
                    to="/login"
                    onClick={onClose}
                    className="flex items-center justify-between w-full px-4 py-3 rounded-2xl border border-border bg-subtle/50 text-primary font-bold text-sm"
                  >
                    <span>{t('nav.login', { defaultValue: 'Log In' })}</span>
                    <ChevronRight size={16} />
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={onClose}
                    className="flex items-center justify-center w-full px-4 py-3 rounded-2xl bg-[#0052ff] text-white font-bold text-sm shadow-lg shadow-blue-500/25"
                  >
                    <span>{t('nav.createAccount', { defaultValue: 'Create Free Account' })}</span>
                  </NavLink>

                  <div className="pt-6 space-y-1">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted px-2 mb-2">
                      Platform Information
                    </h4>
                    <NavLink to="/about" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-subtle">
                      <span>About Us</span>
                      <ChevronRight size={14} />
                    </NavLink>
                    <NavLink to="/locations" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-subtle">
                      <span>Mining Pools</span>
                      <ChevronRight size={14} />
                    </NavLink>
                    <NavLink to="/services" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-subtle">
                      <span>Pricing Plans</span>
                      <ChevronRight size={14} />
                    </NavLink>
                    <NavLink to="/contact" onClick={onClose} className="flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium text-secondary hover:text-primary hover:bg-subtle">
                      <span>Contact Support</span>
                      <ChevronRight size={14} />
                    </NavLink>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Control Bar (Theme, Language, Logout) */}
            <div className="p-4 border-t border-border bg-subtle/30 space-y-3">
              <div className="flex items-center justify-between gap-2">
                {/* Theme Toggle Button */}
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-border text-xs font-semibold text-secondary hover:text-primary transition-colors flex-1 justify-center"
                >
                  {isDark ? (
                    <>
                      <Sun size={15} className="text-amber-400" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon size={15} className="text-sky-400" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </button>

                {/* Discord Community Button */}
                <a
                  href="https://discord.gg/p5XRG4bG8"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 text-[#5865F2] dark:text-[#7983f5] transition-colors"
                  title="Join PoolMining Discord"
                  aria-label="Join Discord"
                >
                  <DiscordIcon size={16} />
                </a>

                {/* Share Button */}
                <button
                  onClick={handleShare}
                  className="p-2 rounded-xl bg-surface border border-border text-secondary hover:text-primary transition-colors"
                  title="Share App"
                  aria-label="Share App"
                >
                  <Share2 size={16} />
                </button>
              </div>

              {/* Language Selector */}
              <div className="pt-1">
                <LanguageSelector variant="dropdown" className="w-full" />
              </div>

              {/* Logout Button (if logged in) */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 text-xs font-bold transition-colors mt-2"
                >
                  <LogOut size={16} />
                  <span>{t('nav.logout', { defaultValue: 'Log Out' })}</span>
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
