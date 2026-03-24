import { Outlet } from 'react-router';
import { Toaster } from 'sonner';
import SmartNavbar from './SmartNavbar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import Chatbot from './Chatbot';
import MouseTracker from './MouseTracker';
import LoadingScreen from './LoadingScreen';
import ScrollDots from './ScrollDots';
import ScrollToTopButton from './ScrollToTopButton';

export default function Layout() {
  return (
    <div className="min-h-screen bg-surface text-primary flex flex-col">
      <LoadingScreen />
      <MouseTracker />
      <ScrollDots />
      <Toaster theme="system" position="top-right" />
      <SmartNavbar />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Chatbot />
      <Footer />
      <BottomNav />
      <ScrollToTopButton />
    </div>
  );
}
