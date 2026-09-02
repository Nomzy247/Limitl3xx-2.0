import './i18n';
import React, { lazy, Suspense, ReactNode } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { PowerSaveProvider } from './context/PowerSaveContext';
import ScrollToTop from './components/ScrollToTop';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import SystemManager from './components/SystemManager';
import RouteMetaHandler from './components/RouteMetaHandler';
import PageSuspenseFallback from './components/PageSuspenseFallback';
import { useMediaQuery } from './hooks/useMediaQuery';

// Code-split dynamic page imports with React.lazy
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Locations = lazy(() => import('./pages/Locations'));
const Services = lazy(() => import('./pages/Services'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));
const FAQ = lazy(() => import('./pages/FAQ'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminSettings = lazy(() => import('./pages/AdminSettings'));
const AdminSupport = lazy(() => import('./pages/AdminSupport'));
const Deposit = lazy(() => import('./pages/Deposit'));
const Withdraw = lazy(() => import('./pages/Withdraw'));
const BuyHashpower = lazy(() => import('./pages/BuyHashpower'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Wallet = lazy(() => import('./pages/Wallet'));
const Settings = lazy(() => import('./pages/Settings'));
const Support = lazy(() => import('./pages/Support'));
const Referrals = lazy(() => import('./pages/Referrals'));
const ReferralRedirect = lazy(() => import('./pages/ReferralRedirect'));
const Profile = lazy(() => import('./pages/Profile'));
const Hub = lazy(() => import('./pages/Hub'));
const LiveTrading = lazy(() => import('./pages/LiveTrading'));
const PoolMining = lazy(() => import('./pages/PoolMining'));
const CloudMining = lazy(() => import('./pages/CloudMining'));
const CryptoTrading = lazy(() => import('./pages/CryptoTrading'));
const Marketplace = lazy(() => import('./pages/Marketplace'));
const Assets = lazy(() => import('./pages/Assets'));
const EarnOverview = lazy(() => import('./pages/overviews/EarnOverview'));
const MenuOverview = lazy(() => import('./pages/overviews/MenuOverview'));
const WalletOverview = lazy(() => import('./pages/overviews/WalletOverview'));
const EPaymentIntegration = lazy(() => import('./pages/EPaymentIntegration'));

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
      <PowerSaveProvider>
        <SystemManager>
          <AuthProvider>
            <Router basename={import.meta.env.BASE_URL}>
              <RouteMetaHandler />
              <ScrollToTop />
              <Toaster 
                theme="system" 
                position="top-center" 
                toastOptions={{
                  className: 'rounded-full border border-border/50 bg-card text-primary px-6 py-3 shadow-lg flex items-center justify-center text-sm font-semibold'
                }}
              />
              <Suspense fallback={<PageSuspenseFallback />}>
                <Routes>
                  <Route path="/admin/poolmining.cloud" element={<AdminLogin />} />
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="overview/earn" element={<EarnOverview />} />
                    <Route path="overview/menu" element={<MenuOverview />} />
                    <Route path="overview/wallet" element={<WalletOverview />} />
                    <Route path="login" element={<Login />} />
                    <Route path="signup" element={<Signup />} />
                    <Route path="ref/:referralCode" element={<ReferralRedirect />} />
                    <Route path="ref" element={<ReferralRedirect />} />
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
              </Suspense>
            </Router>
          </AuthProvider>
        </SystemManager>
      </PowerSaveProvider>
    </ThemeProvider>
  );
}
