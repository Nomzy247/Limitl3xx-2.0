import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import SmartNavbar from './SmartNavbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import Chatbot from './Chatbot';
import MouseTracker from './MouseTracker';
import LoadingScreen from './LoadingScreen';
import ScrollDots from './ScrollDots';
import ScrollToTopButton from './ScrollToTopButton';
import PWAInstallPrompt from './PWAInstallPrompt';
import { fluidSpring } from './SystemManager';

export default function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col">
      <LoadingScreen />
      <MouseTracker />
      <ScrollDots />
      <Toaster theme="system" position="top-right" />
      <SmartNavbar />
      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={fluidSpring}
          className="flex-1 pb-16 md:pb-0"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <Chatbot />
      <Footer />
      <BottomNav />
      <ScrollToTopButton />
      <PWAInstallPrompt />
    </div>
  );
}
