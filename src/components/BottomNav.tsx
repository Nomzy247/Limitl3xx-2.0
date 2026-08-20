import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { 
  LayoutDashboard, 
  Wallet, 
  CandlestickChart, 
  Compass, 
  Menu 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';
import MobileDrawer from './MobileDrawer';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!user) return null;

  // Primary destinations prioritized for mobile accessibility:
  // 1. Dashboard - Core analytics & mining overview
  // 2. Trading - Live cryptocurrency trading & market execution
  // 3. Wallet - Balances, transfers & transaction actions
  // 4. Hub - Quick service shortcuts & ecosystem utilities
  // 5. Menu - Full drawer with account, settings, referrals, support
  const navItems = [
    { 
      path: '/dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard',
      isExact: true
    },
    { 
      path: '/live-trading', 
      icon: CandlestickChart, 
      label: 'Trading',
      aliases: ['/live-trading', '/crypto-trading']
    },
    { 
      path: '/wallet', 
      icon: Wallet, 
      label: 'Wallet',
      aliases: ['/wallet', '/deposit', '/withdraw', '/assets', '/transactions']
    },
    { 
      path: '/hub', 
      icon: Compass, 
      label: 'Hub',
      aliases: ['/hub', '/buy-hashpower', '/pool-mining', '/cloud-mining']
    },
    { 
      action: 'drawer', 
      icon: Menu, 
      label: 'More' 
    },
  ];

  const visibleNavItems = navItems.filter((item) => {
    if (item.action === 'drawer') return true;
    const isActive = item.aliases 
      ? item.aliases.some(alias => currentPath === alias || currentPath.startsWith(alias + '/'))
      : (currentPath === item.path || (!item.isExact && currentPath.startsWith(item.path!)));
    // Omit the active page tab from the bottom nav bar when on that screen
    return !isActive;
  });

  return (
    <>
      {/* Bottom docked mobile tab bar */}
      <motion.nav 
        id="mobile-bottom-dock"
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={fluidSpring}
        aria-label="Mobile Navigation Bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-[max(env(safe-area-inset-bottom,12px),12px)] pt-2 bg-white/80 dark:bg-[#0a0f1d]/85 backdrop-blur-2xl border-t border-slate-200/80 dark:border-white/10 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.5)]"
      >
        <div className="max-w-md mx-auto flex items-center justify-around gap-1">
          {visibleNavItems.map((item, idx) => {
            const Icon = item.icon;

            if (item.action === 'drawer') {
              return (
                <button
                  key="bottom-nav-drawer-toggle"
                  id="mobile-menu-more-btn"
                  onClick={() => setIsDrawerOpen(true)}
                  className={`group relative flex flex-1 flex-col items-center justify-center py-1.5 px-2 min-h-[52px] rounded-2xl transition-all duration-200 active:scale-95 ${
                    isDrawerOpen
                      ? 'text-[#0052ff] dark:text-[#00f0ff] font-semibold'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  aria-label="Open More Navigation Options"
                  aria-expanded={isDrawerOpen}
                >
                  <div className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all">
                    <Icon size={22} strokeWidth={isDrawerOpen ? 2.4 : 1.9} />
                    {isDrawerOpen && (
                      <motion.div 
                        layoutId="bottomNavBubble"
                        className="absolute inset-0 bg-primary/10 dark:bg-primary/20 rounded-xl -z-10"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                      />
                    )}
                  </div>
                  <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                    {item.label}
                  </span>
                </button>
              );
            }

            return (
              <Link 
                key={item.path || idx}
                id={`mobile-nav-${item.label.toLowerCase()}`}
                to={item.path!} 
                className="group relative flex flex-1 flex-col items-center justify-center py-1.5 px-2 min-h-[52px] rounded-2xl transition-all duration-200 active:scale-95 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                aria-label={`Navigate to ${item.label}`}
              >
                <div className="relative flex items-center justify-center w-8 h-8 rounded-xl transition-all">
                  <Icon size={22} strokeWidth={1.9} />

                  {/* Indicator for live updates */}
                  {item.label === 'Wallet' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0a0f1d]" />
                  )}
                  {item.label === 'Trading' && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#0052ff] dark:bg-[#00f0ff] rounded-full animate-pulse ring-2 ring-white dark:ring-[#0a0f1d]" />
                  )}
                </div>
                
                <span className="text-[10px] tracking-tight mt-0.5 leading-none font-medium">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* Slide-over full mobile navigation drawer */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
