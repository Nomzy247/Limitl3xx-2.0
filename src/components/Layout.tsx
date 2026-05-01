import { Outlet, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { motion, AnimatePresence } from 'motion/react';
import SmartNavbar from './SmartNavbar';
import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import Footer from './Footer';
import Chatbot from './Chatbot';
import MouseTracker from './MouseTracker';
import LoadingScreen from './LoadingScreen';
import ScrollDots from './ScrollDots';
import ScrollToTopButton from './ScrollToTopButton';
import PWAInstallPrompt from './PWAInstallPrompt';
import OnboardingModal from './OnboardingModal';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-primary flex">
      <LoadingScreen />
      <MouseTracker />
      <ScrollDots />
      <Toaster theme="system" position="top-right" />
      <OnboardingModal />
      {user && <Sidebar />}
      <div className="flex-1 flex flex-col min-h-screen">
        <SmartNavbar />
        <AnimatePresence mode="wait">
          <motion.main 
            key={location.pathname}
            initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className={`flex-1 ${user ? 'pb-24 md:pb-0' : ''}`}
          >
            <Outlet />
          </motion.main>
        </AnimatePresence>
        <Chatbot />
        <Footer />
        <div className="md:hidden">
            <BottomNav />
        </div>
        <ScrollToTopButton />
        <PWAInstallPrompt />
      </div>
    </div>
  );
}
