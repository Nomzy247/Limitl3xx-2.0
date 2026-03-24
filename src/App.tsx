import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider } from './context/AuthContext';
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
import Deposit from './pages/Deposit';
import Withdraw from './pages/Withdraw';
import BuyHashpower from './pages/BuyHashpower';
import Transactions from './pages/Transactions';
import Wallet from './pages/Wallet';
import Settings from './pages/Settings';
import Support from './pages/Support';
import Referrals from './pages/Referrals';
import Profile from './pages/Profile';

export default function App() {
  return (
    <AuthProvider>
      <LoadingScreen />
      <Router>
        <Toaster position="top-right" richColors />
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="signup" element={<Signup />} />
            <Route path="dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="deposit" element={<ProtectedRoute><Deposit /></ProtectedRoute>} />
            <Route path="withdraw" element={<ProtectedRoute><Withdraw /></ProtectedRoute>} />
            <Route path="buy-hashpower" element={<ProtectedRoute><BuyHashpower /></ProtectedRoute>} />
            <Route path="transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
            <Route path="wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
            <Route path="settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="support" element={<ProtectedRoute><Support /></ProtectedRoute>} />
            <Route path="referrals" element={<ProtectedRoute><Referrals /></ProtectedRoute>} />
            <Route path="profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="locations" element={<Locations />} />
            <Route path="services" element={<Services />} />
            <Route path="about" element={<About />} />
            <Route path="faq" element={<FAQ />} />
            <Route path="contact" element={<Contact />} />
            <Route path="admin" element={<Navigate to="/admin/poolmining.cloud" replace />} />
            <Route path="admin/poolmining.cloud" element={<AdminLogin />} />
            <Route path="admin/dashboard" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}
