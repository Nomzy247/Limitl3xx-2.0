import { useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Home, Wallet, User, LayoutDashboard, Menu } from 'lucide-react';
import { motion } from 'motion/react';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';
import MobileDrawer from './MobileDrawer';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/hub', icon: LayoutDashboard, label: 'Hub' },
    { action: 'drawer', icon: Menu, label: 'Menu' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      <motion.div 
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={fluidSpring}
        className="md:hidden fixed bottom-6 left-3 right-3 bg-white/[0.45] dark:bg-black/[0.45] backdrop-blur-3xl rounded-[2.5rem] px-4 py-2.5 flex justify-between items-center z-50 shadow-2xl border border-white/20 dark:border-white/10"
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          if (item.action === 'drawer') {
            return (
              <button
                key="menu-drawer-btn"
                onClick={() => setIsDrawerOpen(true)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                  isDrawerOpen
                    ? 'bg-black/90 text-white dark:bg-white/90 dark:text-black w-12 h-11 rounded-[1.25rem] shadow-lg scale-105'
                    : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white w-11 h-11'
                }`}
                aria-label="Open Mobile Drawer Menu"
              >
                <Icon size={20} strokeWidth={isDrawerOpen ? 2.5 : 2} />
                <span className="text-[9px] font-bold tracking-tight mt-0.5 leading-none">Menu</span>
              </button>
            );
          }

          const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path!));
          
          return (
            <Link 
              key={item.path || idx}
              to={item.path!} 
              className={`relative flex flex-col items-center justify-center transition-all duration-300 ${
                isActive 
                  ? 'bg-black/90 text-white dark:bg-white/90 dark:text-black w-12 h-11 rounded-[1.25rem] shadow-lg' 
                  : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white w-11 h-11'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[9px] font-bold tracking-tight mt-0.5 leading-none">{item.label}</span>
              {item.label === 'Wallet' && !isActive && (
                <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-[#0052ff] dark:bg-[#00f0ff] rounded-full ring-2 ring-white/50 dark:ring-black/50" />
              )}
            </Link>
          );
        })}
      </motion.div>

      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  );
}
