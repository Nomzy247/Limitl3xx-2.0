import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from 'motion/react';
import { Cloud, ArrowUp, Menu, X, LayoutDashboard, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SmartNavbar() {
  const { scrollY } = useScroll();
  const [isShrunken, setIsShrunken] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isArrowHoveredRef = useRef(false);

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
    // Restart the hover timer if we are still in the nav
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

  // The navbar is effectively shrunken if it's in the shrunken state AND not being hovered AND mobile menu is closed
  const effectivelyShrunken = isShrunken && !isHovered && !isMobileMenuOpen;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex pt-4 pointer-events-none ${isMobile ? 'justify-end pr-4' : 'justify-center'}`}>
      <motion.nav
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
        initial={false}
        animate={{
          height: effectivelyShrunken ? 40 : (isMobileMenuOpen ? 620 : 80),
          width: effectivelyShrunken 
            ? (isMobile ? 260 : 200) 
            : (isMobile ? 'calc(100% - 32px)' : '92%'),
          maxWidth: effectivelyShrunken ? (isMobile ? 260 : 200) : 1200,
          borderRadius: effectivelyShrunken ? 9999 : 32,
          backgroundColor: effectivelyShrunken 
            ? 'rgba(15, 23, 42, 0.8)' 
            : (isMobileMenuOpen ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.95)'),
          backdropFilter: effectivelyShrunken 
            ? 'blur(12px)' 
            : (isMobileMenuOpen ? 'blur(32px) saturate(200%)' : 'blur(24px) saturate(180%)'),
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 30,
          mass: 0.8
        }}
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
                <Cloud size={20} className="text-sky-400" strokeWidth={2} />
                <span className="text-sm font-semibold text-slate-100 tracking-tight">
                  PoolMining<span className="text-sky-400">.cloud</span>
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsMobileMenuOpen(true);
                  }}
                  className="md:hidden p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                  aria-label="Open menu"
                >
                  <Menu size={16} />
                </button>
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
                {/* Logo and Company Name */}
                <a 
                  href="/" 
                  onClick={handleHomeClick}
                  className="flex items-center gap-1.5 group"
                >
                  <Cloud className="text-sky-400 size-6 sm:size-7 group-hover:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)] transition-all" strokeWidth={2} />
                  <span className="text-base sm:text-xl font-semibold text-slate-100 tracking-tight">
                    PoolMining<span className="text-sky-400">.cloud</span>
                  </span>
                </a>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center gap-8">
                  <Link to="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Home</Link>
                  {user ? (
                    <>
                      <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Dashboard</Link>
                      <Link to="/wallet" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Wallet</Link>
                      <Link to="/referrals" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Referrals</Link>
                      <Link to="/support" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Support</Link>
                    </>
                  ) : (
                    <>
                      <Link to="/services" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Services</Link>
                      <Link to="/locations" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Locations</Link>
                      <Link to="/about" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">About</Link>
                      <Link to="/contact" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Contact</Link>
                    </>
                  )}
                </div>

                {/* Auth Buttons */}
                <div className="hidden md:flex items-center gap-4">
                  {user ? (
                    <Link to="/profile" className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/10">
                      <User size={16} /> Profile
                    </Link>
                  ) : (
                    <>
                      <Link to="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                        Log in
                      </Link>
                      <Link to="/signup" className="text-sm font-medium bg-sky-500 hover:bg-sky-400 text-white px-4 py-2 rounded-full transition-colors shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                        Create Account
                      </Link>
                    </>
                  )}
                </div>

                {/* Mobile Menu Button */}
                <button 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden p-2 text-slate-300 hover:text-white transition-colors"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>

              {/* Mobile Dropdown */}
              <AnimatePresence>
                {isMobileMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center gap-7 pb-10 md:hidden border-t border-white/5 pt-8 px-6"
                  >
                    <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Home</Link>
                    {user ? (
                      <>
                        <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Dashboard</Link>
                        <Link to="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Wallet</Link>
                        <Link to="/referrals" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Referrals</Link>
                        <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Support</Link>
                        <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Profile</Link>
                      </>
                    ) : (
                      <>
                        <Link to="/services" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Services</Link>
                        <Link to="/locations" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Locations</Link>
                        <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">About</Link>
                        <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">Contact</Link>
                        <div className="h-px w-full bg-white/5 my-2" />
                        <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-slate-100 hover:text-sky-400 transition-colors">
                          Log in
                        </Link>
                        <motion.div
                          initial={{ opacity: 0, y: 15, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.15, duration: 0.4, type: 'spring' }}
                          className="w-full mt-2"
                        >
                          <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block w-full text-center text-lg font-medium bg-sky-500 hover:bg-sky-400 text-white py-3.5 rounded-full transition-colors shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                            Create Account
                          </Link>
                        </motion.div>
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
