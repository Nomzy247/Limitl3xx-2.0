import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence, useScroll, useMotionValueEvent, useTransform } from 'motion/react';
import { Hexagon, ArrowUp, Menu, X, LayoutDashboard, User, Activity, Bell, Sun, Moon, Power } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { toast } from 'sonner';

export default function SmartNavbar() {
  const { scrollY } = useScroll();
  const [isShrunken, setIsShrunken] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, isAdmin } = useAuth();
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isArrowHoveredRef = useRef(false);

  // Parallax effect for the bubble
  const bubbleY = useTransform(scrollY, [0, 2000], [0, -60]);

  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLElement>(null);
  const isAuthPage = ['/login', '/signup', '/admin/login'].includes(location.pathname);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Close profile menu if clicked outside
      if (isProfileMenuOpen && profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
      // Close auth menu if clicked outside
      if (isAuthMenuOpen && authMenuRef.current && !authMenuRef.current.contains(target)) {
        setIsAuthMenuOpen(false);
      }
      // Close main mobile menu if clicked outside
      if (isMobileMenuOpen && mainNavRef.current && !mainNavRef.current.contains(target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen, isAuthMenuOpen, isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsMobileMenuOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // Check initial theme
    setIsDark(document.documentElement.classList.contains('dark'));
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const direction = latest > lastScrollY ? "down" : "up";
    
    if (latest > 50) {
      if (direction === "down" && !isShrunken) {
        setIsShrunken(true);
      } else if (direction === "up" && isShrunken) {
        setIsShrunken(false);
      }
    } else {
      setIsShrunken(false);
    }
    
    setLastScrollY(latest);
  });

  const handleMouseEnterNav = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      if (!isArrowHoveredRef.current) {
        setIsHovered(true);
      }
    }, 1500);
  };

  const handleMouseLeaveNav = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(false);
  };

  const handleMouseEnterArrow = () => {
    isArrowHoveredRef.current = true;
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
  };

  const handleMouseLeaveArrow = () => {
    isArrowHoveredRef.current = false;
    handleMouseEnterNav();
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
    }
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();
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

  const effectivelyShrunken = isShrunken && !isHovered && !isMobileMenuOpen;

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
                <Link to="/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-[#0052ff] dark:hover:text-[#00f0ff] transition-colors p-2">Dashboard</Link>
                <Link to="/wallet" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-[#0052ff] dark:hover:text-[#00f0ff] transition-colors p-2">Wallet</Link>
                <Link to="/profile" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:text-[#0052ff] dark:hover:text-[#00f0ff] transition-colors p-2">Settings</Link>
                {isAdmin && (
                  <>
                    <Link to="/admin/dashboard" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors p-2">Dashboard</Link>
                    <Link to="/admin/settings" onClick={() => setIsProfileMenuOpen(false)} className="text-sm font-bold text-sky-600 dark:text-sky-400 hover:text-sky-500 transition-colors p-2">Settings</Link>
                  </>
                )}
                <div className="w-px h-4 bg-black/20 dark:bg-white/20 mx-1" />
                <button 
                  onClick={toggleTheme} 
                  className="p-2 text-slate-800 dark:text-slate-200 hover:text-[#0052ff] dark:hover:text-[#00f0ff] transition-colors"
                  title="Toggle Theme"
                >
                  {isDark ? <Sun size={16} /> : <Moon size={16} />}
                </button>
                <button 
                  onClick={() => {
                    import('../firebase').then(({ logOut }) => {
                      logOut();
                    });
                  }} 
                  className="p-2 text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors flex items-center gap-1"
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
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{userData?.name?.charAt(0) || user.email?.charAt(0) || 'U'}</span>
          )}
        </motion.button>
      </motion.div>
    );
  }

  if (isAuthPage && !user) {
    return (
      <motion.div 
        ref={authMenuRef}
        style={{ y: bubbleY }}
        className="fixed top-6 right-6 z-50 flex flex-col items-end pointer-events-auto"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAuthMenuOpen(!isAuthMenuOpen)}
          className="w-12 h-12 rounded-full bg-white/[0.32] dark:bg-black/[0.32] backdrop-blur-3xl border border-white/20 dark:border-white/10 shadow-2xl flex items-center justify-center z-10 mb-2"
        >
          {isAuthMenuOpen ? <X size={20} className="text-slate-800 dark:text-slate-200" /> : <Menu size={20} className="text-slate-800 dark:text-slate-200" />}
        </motion.button>
        
        <AnimatePresence>
          {isAuthMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95, originY: 0, originX: 1 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={fluidSpring}
              className="overflow-hidden flex flex-col bg-white/[0.85] dark:bg-black/[0.85] backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-2xl shadow-2xl min-w-[200px]"
            >
              <div className="flex flex-col p-2 whitespace-nowrap">
                <Link to="/about" onClick={() => setIsAuthMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors p-3">About</Link>
                <Link to="/locations" onClick={() => setIsAuthMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors p-3">Mining Pools</Link>
                <Link to="/services" onClick={() => setIsAuthMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors p-3">Pricing</Link>
                <Link to="/contact" onClick={() => setIsAuthMenuOpen(false)} className="text-sm font-medium text-slate-800 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 rounded-xl transition-colors p-3">Contact</Link>
                
                <div className="w-full h-px bg-black/10 dark:bg-white/10 my-1" />
                
                <div className="flex items-center justify-between p-3">
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-200">Theme</span>
                  <button 
                    onClick={toggleTheme} 
                    className="p-2 text-slate-800 dark:text-slate-200 hover:bg-black/10 dark:hover:bg-white/20 transition-colors bg-black/5 dark:bg-white/10 rounded-full"
                    title="Toggle Theme"
                  >
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex pt-4 pointer-events-none ${isMobile ? 'justify-end pr-4' : 'justify-center'}`}>
      <motion.nav
        ref={mainNavRef}
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
        initial={false}
        animate={{
          height: effectivelyShrunken ? 40 : (isMobileMenuOpen ? 'auto' : 80),
          width: effectivelyShrunken 
            ? (isMobile ? 260 : 200) 
            : (isMobile ? 'calc(100% - 32px)' : '92%'),
          maxWidth: effectivelyShrunken ? (isMobile ? 260 : 200) : 1200,
          borderRadius: effectivelyShrunken ? 9999 : 32,
          backgroundColor: effectivelyShrunken 
            ? 'rgba(15, 23, 42, 0.8)' 
            : (isMobileMenuOpen ? 'rgba(15, 23, 42, 0.98)' : 'rgba(15, 23, 42, 0.95)'),
          backdropFilter: effectivelyShrunken 
            ? 'blur(12px)' 
            : (isMobileMenuOpen ? 'blur(32px) saturate(200%)' : 'blur(24px) saturate(180%)'),
        }}
        transition={fluidSpring}
        className="relative flex flex-col shadow-2xl border border-white/10 pointer-events-auto overflow-hidden"
      >
        <AnimatePresence mode="wait">
          {effectivelyShrunken ? (
            <motion.div
              key="compact"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex items-center justify-between w-full px-4 h-full cursor-pointer"
              onClick={handleHomeClick}
            >
              <div className="flex items-center gap-2">
                <Hexagon size={20} className="text-[#00f0ff]" strokeWidth={2} />
                <span className="text-sm font-semibold text-slate-100 tracking-tight">
                  PoolMining<span className="text-[#0052ff]">.cloud</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={handleScrollToTop}
                  onMouseEnter={handleMouseEnterArrow}
                  onMouseLeave={handleMouseLeaveArrow}
                  className="p-1.5 rounded-full bg-slate-800/80 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Scroll to top"
                >
                  <ArrowUp size={14} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex flex-col w-full h-full"
            >
              <div className="flex items-center justify-between w-full px-6 md:px-8 h-20 min-h-[80px]">
                <a 
                  href="/" 
                  onClick={handleHomeClick}
                  className="flex items-center gap-1.5 group"
                >
                  <Hexagon className="text-[#00f0ff] size-6 sm:size-7 group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all" strokeWidth={2} />
                  <span className="text-base sm:text-xl font-semibold text-slate-100 tracking-tight">
                    PoolMining<span className="text-[#0052ff]">.cloud</span>
                  </span>
                </a>

                <div className="hidden md:flex items-center gap-6">
                  {user ? (
                    <>
                      <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                      <Link to="/wallet" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Wallet</Link>
                      <Link to="/referrals" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Referrals</Link>
                      <Link to="/support" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Support</Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors">Admin</Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</Link>
                      <Link to="/locations" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pools</Link>
                      <Link to="/services" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Pricing</Link>
                      <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-4">
                  <button onClick={toggleTheme} className="p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10">
                    {isDark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
                  {user ? (
                    <Link to="/profile" className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/10">
                      <User size={16} /> Profile
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Log in
                      </Link>
                      <Link to="/signup" className="text-sm font-medium bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2 rounded-full transition-colors shadow-[0_0_10px_rgba(0,82,255,0.3)]">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>

                <button 
                  className="md:hidden p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col px-6 py-6 gap-4 md:hidden border-t border-white/5"
                  >
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Dashboard</Link>
                        <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Wallet</Link>
                        <Link to="/referrals" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Referrals</Link>
                        <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Support</Link>
                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Profile</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">About</Link>
                        <Link to="/locations" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Mining Pools</Link>
                        <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Pricing</Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Contact</Link>
                        <div className="h-px bg-white/5 my-2" />
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-100 font-medium">Log in</Link>
                        <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-[#0052ff] text-white px-4 py-3 rounded-2xl text-center font-bold">Create Account</Link>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </div>
  );
}
