import './i18n';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import LoadingScreen from './components/LoadingScreen';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Locations from './pages/Locations';
import Services from './pages/Services';
import Contact from './pages/Contact';
import About from './pages/About';
import FAQ from './pages/FAQ';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminSettings from './pages/AdminSettings';
import AdminSupport from './pages/AdminSupport';
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import BuyHashpower from './pages/BuyHashpower';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';
import Hub from './pages/Hub';
import LiveTrading from './pages/LiveTrading';
import PoolMining from './pages/PoolMining';
import CloudMining from './pages/CloudMining';
import CryptoTrading from './pages/CryptoTrading';
import Marketplace from './pages/Marketplace';
import Assets from './pages/Assets';
import EarnOverview from './pages/overviews/EarnOverview';
import MenuOverview from './pages/overviews/MenuOverview';
import WalletOverview from './pages/overviews/WalletOverview';
import SystemManager from './components/SystemManager';
import { useMediaQuery } from './hooks/useMediaQuery';
import { ReactNode } from 'react';
import EPaymentIntegration from './pages/EPaymentIntegration';

function MobileRedirect({ children }: { children: ReactNode }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const location = useLocation();
  
  if (isMobile && location.pathname === '/dashboard') {
    return <Navigate to="/hub" replace />;
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <SystemManager>
        <AuthProvider>
          <Router>
            <ScrollToTop/>
            <Toaster 
              theme="system" 
              position="top-center" 
              toastOptions={{
                className: 'rounded-full border border-border/50 bg-card text-primary px-6 py-3 shadow-lg flex items-center justify-center text-sm font-semibold'
              }}
            />
            <Routes>
              <Route path="/admin/poolmining.cloud" element={<AdminLogin />} />
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="overview/earn" element={<EarnOverview />} />
              <Route path="overview/menu" element={<MenuOverview />} />
              <Route path="overview/wallet" element={<WalletOverview />} />
              <Route path="login" element={<Login />} />
              <Route path="signup" element={<Signup />} />
              <Route path="dashboard" element={<ProtectedRoute><MobileRedirect><Dashboard /></MobileRedirect></ProtectedRoute>} />
              <Route path="deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
              <Route path="withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
              <Route path="buy-hashpower" element={<ProtectedRoute><BuyHashpower /></ProtectedRoute>} />
              <Route path="transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
              <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
              <Route path="pool-mining" element={<ProtectedRoute><PoolMining /></ProtectedRoute>} />
              <Route path="cloud-mining" element={<ProtectedRoute><CloudMining /></ProtectedRoute>} />
              <Route path="live-trading" element={<ProtectedRoute><LiveTrading /></ProtectedRoute>} />
              <Route path="crypto-trading" element={<ProtectedRoute><CryptoTrading /></ProtectedRoute>} />
              <Route path="assets" element={<ProtectedRoute><Assets /></ProtectedRoute>} />
              <Route path="marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
              <Route path="referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
              <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="hub" element={<ProtectedRoute><Hub /></ProtectedRoute>} />
              <Route path="integration/e-payment" element={<ProtectedRoute><EPaymentIntegration /></ProtectedRoute>} />
              <Route path="locations" element={<Locations />} />
              <Route path="services" element={<Services />} />
              <Route path="about" element={<About />} />
              <Route path="faq" element={<FAQ />} />
              <Route path="contact" element={<Contact />} />
              <Route path="admin" element={<Navigate to="/admin/poolmining.cloud" replace />} />
              <Route path="admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
              <Route path="admin/support" element={<ProtectedRoute requireAdmin><AdminSupport /></ProtectedRoute>} />
              <Route path="admin/settings" element={<ProtectedRoute requireAdmin><AdminSettings /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      </SystemManager>
    </ThemeProvider>
  );
}
