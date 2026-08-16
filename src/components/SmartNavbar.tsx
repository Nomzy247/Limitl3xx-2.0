import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useTransform,
} from "motion/react";
import {
  Hexagon,
  ArrowUp,
  Menu,
  X,
  LayoutDashboard,
  User,
  Activity,
  Bell,
  Sun,
  Moon,
  Power,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import LanguageSelector from "./LanguageSelector";
import MobileDrawer from "./MobileDrawer";
import { fluidSpring } from "./SystemManager";

import Logo from "./Logo";

export default function SmartNavbar() {
  const { scrollY } = useScroll();
  const [isShrunken, setIsShrunken] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "connecting" | "offline"
  >("connected");
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, isAdmin } = useAuth();

  const isArrowHoveredRef = useRef(false);

  // Parallax effect for the bubble
  const bubbleY = useTransform(scrollY, [0, 2000], [0, -60]);

  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const authMenuRef = useRef<HTMLDivElement>(null);
  const mainNavRef = useRef<HTMLElement>(null);
  const isAuthPage = ["/login", "/signup", "/admin/login"].includes(
    location.pathname,
  );

  useEffect(() => {
    const handleOnline = () => {
      setConnectionStatus("connecting");
      setTimeout(() => setConnectionStatus("connected"), 2000);
    };
    const handleOffline = () => setConnectionStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setConnectionStatus("offline");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      // Close profile menu if clicked outside
      if (
        isProfileMenuOpen &&
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setIsProfileMenuOpen(false);
      }
      // Close auth menu if clicked outside
      if (
        isAuthMenuOpen &&
        authMenuRef.current &&
        !authMenuRef.current.contains(target)
      ) {
        setIsAuthMenuOpen(false);
      }
      // Close main mobile menu if clicked outside
      if (
        isMobileMenuOpen &&
        mainNavRef.current &&
        !mainNavRef.current.contains(target)
      ) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
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
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const isAtBottom =
      window.innerHeight + latest >= document.documentElement.scrollHeight - 50;
    const direction = latest > lastScrollY ? "down" : "up";

    if (latest > 50) {
      if (isAtBottom) {
        setIsShrunken(false);
      } else if (direction === "down" && !isShrunken) {
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
    setIsHovered(true);
  };

  const handleMouseLeaveNav = () => {
    setIsHovered(false);
  };

  const handleMouseEnterArrow = () => {
    isArrowHoveredRef.current = true;
  };

  const handleMouseLeaveArrow = () => {
    isArrowHoveredRef.current = false;
  };

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      navigate("/");
    }
  };

  const handleScrollToTop = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const effectivelyShrunken = isShrunken && !isHovered && !isMobileMenuOpen;

  // Let the main navbar render always.

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 flex pt-4 pointer-events-none ${isMobile ? "justify-center px-4" : "justify-center"}`}
    >
      <motion.nav
        ref={mainNavRef}
        onMouseEnter={handleMouseEnterNav}
        onMouseLeave={handleMouseLeaveNav}
        initial={false}
        animate={{
          height: effectivelyShrunken ? 40 : isMobileMenuOpen ? "auto" : 80,
          width: effectivelyShrunken
            ? isMobile
              ? 260
              : 200
            : isMobile
              ? "calc(100% - 32px)"
              : "92%",
          maxWidth: effectivelyShrunken ? (isMobile ? 260 : 200) : 1200,
          borderRadius: effectivelyShrunken ? 9999 : 32,
          backgroundColor: effectivelyShrunken
            ? "rgba(15, 23, 42, 0.8)"
            : isMobileMenuOpen
              ? "rgba(15, 23, 42, 0.98)"
              : "rgba(15, 23, 42, 0.95)",
          backdropFilter: effectivelyShrunken
            ? "blur(12px)"
            : isMobileMenuOpen
              ? "blur(32px) saturate(200%)"
              : "blur(24px) saturate(180%)",
          boxShadow: `0 0 15px ${connectionStatus === "connected" ? "rgba(52, 211, 153, 0.15)" : connectionStatus === "connecting" ? "rgba(250, 204, 21, 0.3)" : "rgba(248, 113, 113, 0.4)"}`,
          borderColor:
            connectionStatus === "connected"
              ? "rgba(52, 211, 153, 0.3)"
              : connectionStatus === "connecting"
                ? "rgba(250, 204, 21, 0.5)"
                : "rgba(248, 113, 113, 0.5)",
        }}
        transition={{
          ...fluidSpring,
          borderColor: { duration: 0.5 },
          boxShadow: { duration: 0.5 },
        }}
        className="relative flex flex-col pointer-events-auto overflow-hidden border"
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
                <Logo compact={true} />
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
                  <Logo compact={false} />
                </a>

                <div className="hidden md:flex items-center gap-6">
                  {user ? (
                    <>
                      <Link
                        to="/dashboard"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/wallet"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Wallet
                      </Link>
                      <Link
                        to="/referrals"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Referrals
                      </Link>
                      <Link
                        to="/support"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Support
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="text-sm font-bold text-sky-400 hover:text-sky-300 transition-colors"
                        >
                          Admin
                        </Link>
                      )}
                    </>
                  ) : (
                    <>
                      <Link
                        to="/about"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        About
                      </Link>
                      <Link
                        to="/locations"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Pools
                      </Link>
                      <Link
                        to="/services"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Pricing
                      </Link>
                      <Link
                        to="/contact"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Contact
                      </Link>
                    </>
                  )}
                </div>

                <div className="hidden md:flex items-center gap-3">
                  <LanguageSelector variant="dropdown" />
                  <button
                    onClick={toggleTheme}
                    className="p-2 text-slate-300 hover:text-white transition-all rounded-full hover:bg-white/10 flex items-center justify-center border border-white/10 bg-white/5 shadow-sm"
                    title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle Theme"
                  >
                    {isDark ? <Sun size={18} className="text-amber-400 animate-pulse" /> : <Moon size={18} className="text-sky-400" />}
                  </button>
                  {user ? (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full transition-colors border border-white/10"
                      >
                        <User size={16} /> Profile
                      </Link>
                      <button
                        onClick={() => {
                          import("../firebase").then(({ logOut }) => logOut());
                        }}
                        className="p-2 text-rose-500 hover:text-white transition-colors rounded-full hover:bg-white/10"
                        title="Logout"
                      >
                        <Power size={18} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/signup"
                        className="text-sm font-medium bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-2 rounded-full transition-colors shadow-[0_0_10px_rgba(0,82,255,0.3)]"
                      >
                        Create Account
                      </Link>
                    </>
                  )}
                </div>

                <button
                  className="md:hidden p-2 text-slate-300 hover:text-white transition-colors rounded-full hover:bg-white/10"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle Navigation Drawer"
                >
                  {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Render MobileDrawer outside motion.nav to prevent overflow/clipping constraints */}
      <MobileDrawer isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </div>
  );
}
