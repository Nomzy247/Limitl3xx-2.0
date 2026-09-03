import { Outlet, useLocation } from 'react-router';
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
import ConnectionStatusNotifier from './ConnectionStatusNotifier';
import { fluidSpring } from './SystemManager';
import { useAuth } from '../context/AuthContext';

export default function Layout() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col items-center">
      <ConnectionStatusNotifier />
      <LoadingScreen />
      <MouseTracker />
      <ScrollDots />
      <OnboardingModal />
      <div className="w-full flex justify-center">
        <div className="flex w-full max-w-[1920px] relative">
          {user && <Sidebar />}
          <div className="flex-1 flex flex-col min-h-screen w-full relative overflow-x-clip">
            <SmartNavbar />
            <AnimatePresence mode="wait">
              <motion.main 
                key={location.pathname}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0.9 }}
                transition={{ duration: 0.15 }}
                className={`flex-1 w-full mx-auto pt-24 ${user ? 'pb-24 md:pb-0' : ''}`}
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
      </div>
    </div>
  );
}
