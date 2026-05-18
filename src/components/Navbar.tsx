import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { Hexagon, ChevronUp, MapPin, Activity, Sun, Moon, Bell, Menu, X, Power } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { toast } from 'sonner';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isGlowing, setIsGlowing] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [status, setStatus] = useState<'offline' | 'connecting' | 'connected' | 'ongoing'>('connected');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const { user, userData } = useAuth();
  const lastScrollY = useRef(0);
  const glowTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (e: React.MouseEvent | React.TouchEvent) => {
    if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
    
    // Don't expand if hovering over a specific element like back-to-top
    const target = e.target as HTMLElement;
    if (target.closest('.back-to-top')) return;

    hoverTimeoutRef.current = setTimeout(() => setIsHovered(true), 1500);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setIsHovered(false), 500);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    handleMouseEnter(e);
  };

  const handleTouchEnd = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    leaveTimeoutRef.current = setTimeout(() => setIsHovered(false), 1000);
  };

  const getGlowColor = () => {
    switch (status) {
      case 'offline': return 'rgba(239, 68, 68, 0.5)'; // Red
      case 'connecting': return 'rgba(253, 224, 71, 0.5)'; // Lemon
      case 'connected': return 'rgba(34, 197, 94, 0.5)'; // Green
      case 'ongoing': return 'rgba(245, 158, 11, 0.5)'; // Amber
      default: return 'transparent';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 10);
      
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsScrollingDown(false);
      }
      
      // Check if at bottom of page
      const isBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 100;
      setIsAtBottom(isBottom);
      
      const diff = Math.abs(currentScrollY - lastScrollY.current);
      if (diff > 15) {
        setIsGlowing(true);
        if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
        glowTimeoutRef.current = setTimeout(() => setIsGlowing(false), 1200);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (glowTimeoutRef.current) clearTimeout(glowTimeoutRef.current);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleTheme = () => {
    const root = document.documentElement;
    if (root.classList.contains('dark')) {
      root.classList.remove('dark');
      setIsDark(false);
      toast.success('Switched to Light Mode');
    } else {
      root.classList.add('dark');
      setIsDark(true);
      toast.success('Switched to Dark Mode');
    }
  };

  const showNotification = () => {
    const events = [
      'Deposit of 0.5 BTC successful!',
      'Mining reward: +0.0025 BTC',
      'Withdrawal of 1.2 ETH completed',
      'New mining pool online in Iceland'
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    toast(randomEvent, {
      icon: <Activity className="text-[#00f0ff]" size={16} />,
      style: {
        background: 'var(--bg-card)',
        color: 'var(--text-primary)',
        border: '1px solid var(--border-color)'
      }
    });
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { scrollY } = useScroll();
  const bubbleY = useTransform(scrollY, [0, 2000], [0, -60]);

  const isShrunken = !isMobile && isScrollingDown && isScrolled && !isHovered && !isMobileMenuOpen;
  const isMobileShrunken = isMobile && isScrollingDown && isScrolled && !isHovered && !isMobileMenuOpen;

  if (user) {
    return (
      <motion.div 
        ref={profileMenuRef}
        style={{ y: bubbleY }}
        className="fixed top-6 right-6 z-50 flex items-center justify-end pointer-events-auto"
      >
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, width: 0, scale: 0.9, originX: 1 }}
              animate={{ opacity: 1, width: 'auto', scale: 1 }}
              exit={{ opacity: 0, width: 0, scale: 0.9 }}
              transition={fluidSpring}
              className="overflow-hidden flex items-center mr-3 bg-white/[0.32] dark:bg-black/[0.32] backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-full shadow-2xl"
            >
              <div className="flex items-center gap-2 px-4 py-2 whitespace-nowrap">
                <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium hover:text-[#00f0ff] transition-colors p-2">Dashboard</Link>
                <Link to="/wallet" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium hover:text-[#00f0ff] transition-colors p-2">Wallet</Link>
                <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium hover:text-[#00f0ff] transition-colors p-2">Settings</Link>
                <div className="w-px h-4 bg-border/50 mx-1" />
                <button 
                  onClick={() => {
                    import('../firebase').then(({ logOut }) => {
                      logOut();
                    });
                  }} 
                  className="p-2 text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1"
                  title="Logout"
                >
                  <Power size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
          className="w-12 h-12 rounded-full bg-white/[0.32] dark:bg-black/[0.32] backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-2xl flex items-center justify-center overflow-hidden z-10"
        >
          {user.photoURL ? (
            <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg font-bold">{userData?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
          )}
        </motion.button>
      </motion.div>
    );
  }

  return (
    <div className={`fixed top-0 z-50 flex px-4 pt-4 pointer-events-none transition-all duration-500 ${isMobileShrunken ? 'right-0 justify-end' : 'left-0 right-0 justify-center'}`}>
      <motion.nav 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        initial={false}
        animate={{
          width: isMobileShrunken ? '180px' : (isShrunken ? '200px' : (isScrolled && !isMobileMenuOpen ? '95%' : '100%')),
          height: isMobileMenuOpen ? 'auto' : (isShrunken || isMobileShrunken ? '44px' : '64px'),
          maxWidth: isMobileShrunken ? '180px' : (isShrunken ? '200px' : (isScrolled && !isMobileMenuOpen ? '1000px' : '1280px')),
          borderRadius: '9999px',
          backgroundColor: isDark 
            ? (isScrolled ? (isHovered ? 'rgba(31, 41, 55, 0.95)' : 'rgba(31, 41, 55, 0.85)') : 'rgba(31, 41, 55, 0.6)')
            : (isScrolled ? (isHovered ? 'rgba(209, 213, 219, 0.95)' : 'rgba(209, 213, 219, 0.85)') : 'rgba(209, 213, 219, 0.6)'),
          boxShadow: isScrolled 
            ? (isDark 
                ? [
                    '0 0 15px rgba(0, 240, 255, 0.2), 0 0 5px rgba(0, 240, 255, 0.1)', 
                    '0 0 30px rgba(0, 240, 255, 0.5), 0 0 10px rgba(0, 240, 255, 0.2)', 
                    '0 0 15px rgba(0, 240, 255, 0.2), 0 0 5px rgba(0, 240, 255, 0.1)'
                  ]
                : [
                    '0 0 15px rgba(0, 82, 255, 0.15), 0 0 5px rgba(0, 82, 255, 0.05)', 
                    '0 0 30px rgba(0, 82, 255, 0.4), 0 0 10px rgba(0, 82, 255, 0.15)', 
                    '0 0 15px rgba(0, 82, 255, 0.15), 0 0 5px rgba(0, 82, 255, 0.05)'
                  ])
            : `0 10px 30px -10px rgba(0,0,0,0.5), 0 0 20px 5px ${getGlowColor()}`,
          scale: isGlowing ? 1.02 : 1,
        }}
        transition={{ 
          ...fluidSpring,
          boxShadow: isScrolled ? {
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          } : { duration: 0.8 },
          width: { duration: isHovered ? 2 : 0.8, ease: "easeInOut" },
          maxWidth: { duration: isHovered ? 2 : 0.8, ease: "easeInOut" }
        }}
        className="backdrop-blur-xl border border-white/10 overflow-hidden pointer-events-auto"
      >
        <div className={`w-full ${isShrunken || isMobileShrunken ? 'px-0' : 'px-6'}`}>
          <div className={`flex items-center justify-start h-full ${isShrunken || isMobileShrunken ? 'min-h-[44px]' : 'min-h-[64px]'}`}>
            <AnimatePresence mode="wait">
              {!isShrunken && !isMobileShrunken ? (
                <motion.div 
                  key="full-nav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <Link to="/" className="flex items-center gap-2">
                      <Logo compact={false} />
                    </Link>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="hidden md:flex items-baseline space-x-4">
                      <Link to="/" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">Home</Link>
                      <Link to="/marketplace" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">Marketplace</Link>
                      <Link to="/live-trading" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">Live Trading</Link>
                      <Link to="/services" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">Services</Link>
                      <Link to="/locations" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">Locations</Link>
                      <Link to="/faq" className="text-muted hover:text-primary px-2 py-1 rounded-md text-xs font-medium transition-colors">FAQ</Link>
                    </div>
                    
                    <motion.div 
                      className="flex items-center gap-3"
                      exit={{ scale: 0.3, opacity: 0, borderRadius: '9999px' }}
                      transition={{ duration: 0.3 }}
                    >
                      <button onClick={toggleTheme} className="p-1.5 text-muted hover:text-primary transition-colors rounded-full hover:bg-subtle">
                        {isDark ? <Sun size={16} /> : <Moon size={16} />}
                      </button>
                      <button onClick={showNotification} className="p-1.5 text-muted hover:text-primary transition-colors rounded-full hover:bg-subtle relative">
                        <Bell size={16} />
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00f0ff] rounded-full animate-pulse"></span>
                      </button>
                      <Link to="/login" className="hidden md:block text-xs font-medium text-muted hover:text-primary transition-colors">
                        Log in
                      </Link>
                      <Link to="/signup" className="hidden md:block bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-3 py-1.5 rounded-full text-xs font-medium transition-all shadow-[0_0_10px_rgba(0,82,255,0.3)] hover:shadow-[0_0_15px_rgba(0,82,255,0.5)]">
                        Create Account
                      </Link>
                      <button 
                        className="md:hidden p-1.5 text-muted hover:text-primary transition-colors rounded-full hover:bg-subtle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                      >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                      </button>
                    </motion.div>
                  </div>
                  
                  <AnimatePresence>
                    {isMobileMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="absolute top-16 left-0 w-full bg-surface/95 backdrop-blur-xl border-b border-border/50 flex flex-col px-6 py-4 gap-4 md:hidden"
                      >
                        <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Home</Link>
                        <Link to="/marketplace" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Marketplace</Link>
                        <Link to="/live-trading" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Live Trading</Link>
                        <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Services</Link>
                        <Link to="/locations" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Locations</Link>
                        <Link to="/faq" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">FAQ</Link>
                        <div className="h-px bg-border/50 my-2" />
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-primary font-medium">Log in</Link>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#0052ff] text-white px-4 py-2 rounded-full text-center font-medium">Create Account</Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : isMobileShrunken ? (
                <motion.div
                  key="mobile-shrunken-nav"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full h-full px-4"
                >
                  <div className="flex items-center gap-2">
                    <Logo compact={true} />
                  </div>
                </motion.div>
              ) : (
                  <motion.div
                  key="shrunken-nav"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-center w-full h-full px-4"
                >
                  <div className="flex items-center gap-2">
                    <Logo compact={true} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>


        {/* Expandable Details on Hover when Scrolled */}
        <AnimatePresence>
          {isScrolled && isHovered && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-background/20 hidden md:block"
            >
              <div className="p-4 flex justify-center">
                {/* Maps Widget */}
                <div className="bg-surface/50 backdrop-blur-md rounded-xl border border-border/30 p-4 h-[280px] w-full max-w-2xl flex flex-col shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-[#0052ff]" size={18} />
                    <motion.h3 
                      whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="text-sm font-semibold text-primary cursor-default"
                    >
                      Global Mining Pools
                    </motion.h3>
                  </div>
                  <div className="flex-1 rounded-full overflow-hidden relative">
                    <iframe 
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d100939.98555098464!2d-122.50764017948534!3d37.7578149966017!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8085806322cb61b1%3A0x8085806322cb61b1!2sSan%20Francisco%2C%20CA!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus" 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0, filter: isDark ? 'invert(90%) hue-rotate(180deg) contrast(100%)' : 'none' }} 
                      allowFullScreen={true} 
                      loading="lazy"
                      className="absolute inset-0"
                    ></iframe>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
