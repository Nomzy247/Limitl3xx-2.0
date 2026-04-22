import { Link, useLocation } from 'react-router';
import { Home, List, Search, MessageSquare, PlusSquare, Activity, Wallet, User } from 'lucide-react';
import { motion } from 'motion/react';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';

export default function BottomNav() {
  const { user } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  if (!user) return null;

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Home' },
    { path: '/pool-mining', icon: Activity, label: 'Mining' },
    { path: '/live-trading', icon: Search, label: 'Trade' },
    { path: '/marketplace', icon: PlusSquare, label: 'Market' },
    { path: '/wallet', icon: Wallet, label: 'Wallet' },
  ];

  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={fluidSpring}
      className="md:hidden fixed bottom-6 left-4 right-4 bg-white/[0.32] dark:bg-black/[0.32] backdrop-blur-3xl rounded-[2.5rem] px-6 py-3 flex justify-between items-center z-50 shadow-2xl border border-white/20 dark:border-white/10"
    >
      {navItems.map((item) => {
        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
        const Icon = item.icon;
        
        return (
          <Link 
            key={item.path}
            to={item.path} 
            className={`relative flex items-center justify-center transition-all duration-300 ${
              isActive 
                ? 'bg-black/80 text-white dark:bg-white/80 dark:text-black w-14 h-12 rounded-[1.5rem] shadow-lg' 
                : 'text-black/60 hover:text-black dark:text-white/60 dark:hover:text-white w-12 h-12'
            }`}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            {/* Optional dot indicator for notifications, matching the image's 4th icon */}
            {item.label === 'Wallet' && !isActive && (
              <span className="absolute top-3 right-3 w-1.5 h-1.5 bg-black dark:bg-white rounded-full border border-white/50 dark:border-black/50" />
            )}
          </Link>
        );
      })}
    </motion.div>
  );
}
