import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router';
import { motion, animate } from 'motion/react';
import { toast } from 'sonner';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Activity, 
  History, Plus, LogOut, TrendingUp, Users, Shield, DollarSign
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { auth, db, collection, query, where, orderBy, limit, onSnapshot, handleFirestoreError, OperationType } from '../firebase';
import WalletWidget from '../components/WalletWidget';
import NewsFeed from '../components/NewsFeed';
import MarketOverview from '../components/MarketOverview';
import TransactionHistoryModule from '../components/TransactionHistoryModule';
import { fluidSpring } from '../components/SystemManager';
import { signOut } from 'firebase/auth';

// Lazy load TradingView widget
const TradingViewWidget = lazy(() => Promise.resolve({
  default: () => (
    <iframe 
      src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=transparent&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC"
      width="100%" 
      height="100%" 
      frameBorder="0" 
      allowTransparency={true} 
      scrolling="no" 
      allowFullScreen
    ></iframe>
  )
}));

const mockChartData = [
  { name: 'Mon', value: 4000, hashrate: 120 },
  { name: 'Tue', value: 4200, hashrate: 125 },
  { name: 'Wed', value: 4100, hashrate: 122 },
  { name: 'Thu', value: 4600, hashrate: 130 },
  { name: 'Fri', value: 4800, hashrate: 135 },
  { name: 'Sat', value: 5100, hashrate: 140 },
  { name: 'Sun', value: 5400, hashrate: 145 },
];

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 2 }: { value: number, prefix?: string, suffix?: string, decimals?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 1.5,
      ease: "easeOut",
      onUpdate: (v) => setDisplayValue(v)
    });
    return controls.stop;
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const yieldData = payload.find((p: any) => p.dataKey === 'value');
    const hashrateData = payload.find((p: any) => p.dataKey === 'hashrate');
    
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-4 rounded-xl shadow-2xl">
        <p className="text-secondary text-sm mb-2">{label}</p>
        {yieldData && (
          <p className="text-xl font-bold text-[#00f0ff]">
            Yield: ${yieldData.value.toLocaleString()}
          </p>
        )}
        {hashrateData && (
          <p className="text-lg font-semibold text-[#0052ff]">
            Hashrate: {hashrateData.value} TH/s
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user, userData, loading: authLoading } = useAuth();
  const [contracts, setContracts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }

    // Contracts real-time listener
    const contractsQuery = query(
      collection(db, 'contracts'),
      where('user_id', '==', user.uid),
      orderBy('start_date', 'desc')
    );

    const unsubscribeContracts = onSnapshot(contractsQuery, (snapshot) => {
      const contractsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContracts(contractsData);
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'contracts');
    });

    // Transactions real-time listener
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('user_id', '==', user.uid),
      orderBy('timestamp', 'desc'),
      limit(5)
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
      const transactionsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(transactionsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => {
      unsubscribeContracts();
      unsubscribeTransactions();
    };
  }, [user, authLoading, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="w-8 h-8 border-4 border-[#0052ff] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const totalMined = contracts.reduce((acc, curr) => acc + (curr.mined || 0), 0);
  const dailyProfit = contracts.reduce((acc, curr) => acc + (curr.dailyReturn || 0), 0);
  const totalHashrate = contracts.reduce((acc, curr) => acc + parseFloat(curr.hashpower || '0'), 0);
  const totalInvestment = contracts.reduce((acc, curr) => acc + (curr.price || 0), 0);

  const getLevelInfo = (investment: number) => {
    const levels = [
      { level: 1, threshold: 0, name: 'Novice Miner' },
      { level: 2, threshold: 500, name: 'Apprentice Miner' },
      { level: 3, threshold: 2500, name: 'Journeyman Miner' },
      { level: 4, threshold: 10000, name: 'Expert Miner' },
      { level: 5, threshold: 50000, name: 'Master Miner' },
      { level: 6, threshold: 100000, name: 'Grandmaster Miner' },
    ];
    
    let currentLevel = levels[0];
    let nextLevel = levels[1];
    
    for (let i = 0; i < levels.length; i++) {
      if (investment >= levels[i].threshold) {
        currentLevel = levels[i];
        nextLevel = levels[i + 1] || null;
      } else {
        break;
      }
    }
    
    const progress = nextLevel 
      ? Math.min(100, Math.max(0, ((investment - currentLevel.threshold) / (nextLevel.threshold - currentLevel.threshold)) * 100))
      : 100;
      
    return { currentLevel, nextLevel, progress };
  };

  const { currentLevel, nextLevel, progress } = getLevelInfo(totalInvestment);

  return (
    <div className="relative min-h-screen bg-background text-primary p-4 md:p-8">
      {/* Global Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto pt-8 pb-8 relative z-10 w-full">
        <header className="mb-6 px-2 flex justify-between items-end">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Welcome back, {userData?.name}</h1>
            <p className="text-secondary mt-1 text-sm leading-relaxed">Here is the update on your crypto operations.</p>
          </div>
          <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted">
          </div>
        </header>

        {/* Quick Actions / Balance (Moved to Top) */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-card rounded-2xl p-4 sm:p-6 md:p-8 border border-border/30 shadow-md relative overflow-hidden shrink-0 mb-6"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052ff] rounded-full blur-[60px] opacity-10 pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-6 relative z-10">
            <div>
              <p className="text-secondary font-semibold text-xs uppercase tracking-widest mb-1">Total Balance</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tighter">
                <AnimatedNumber value={userData?.balance || 0} prefix="$" />
              </h2>
            </div>
            
            {/* Quick Action Bar */}
            <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">
              <button 
                onClick={() => navigate('/deposit')} 
                className="flex-1 lg:flex-none bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <ArrowDownRight size={18} /> Deposit
              </button>
              <button 
                onClick={() => navigate('/withdraw')} 
                className="flex-1 lg:flex-none bg-subtle hover:bg-subtle-hover text-primary px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 border border-border text-sm whitespace-nowrap"
              >
                <ArrowUpRight size={18} /> Withdraw
              </button>
              <button 
                onClick={() => navigate('/buy-hashpower')} 
                className="flex-1 lg:flex-none bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 px-4 md:px-8 py-3 md:py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm whitespace-nowrap"
              >
                <Plus size={18} /> Mining
              </button>
            </div>
          </div>
        </motion.div>

        {/* 12-Column Grid System */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
          
          {/* Main Content Column (Spans 8 columns on large screens) */}
          <div className="xl:col-span-8 flex flex-col gap-6 w-full overflow-hidden">
            
            {/* TradingView Widget */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full h-[400px] rounded-2xl overflow-hidden border border-border/30 shadow-md bg-card shrink-0"
            >
              <Suspense fallback={
                <div className="w-full h-full flex items-center justify-center bg-background/50 animate-pulse">
                  <Activity className="text-secondary opacity-50" size={32} />
                </div>
              }>
                <TradingViewWidget />
              </Suspense>
            </motion.div>

            {/* Mining Stats & App Market */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
               {/* Mining Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-md"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-secondary font-semibold text-sm">Mining Performance</p>
                  <Activity className="text-[#00f0ff]" size={18} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Total Hashrate</p>
                    <p className="text-lg font-bold text-primary">{totalHashrate.toFixed(2)} TH/s</p>
                  </div>
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Total Revenue</p>
                    <p className="text-lg font-bold text-emerald-400">${totalMined.toFixed(2)}</p>
                  </div>
                </div>
              </motion.div>

              {/* Referral Program */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="w-full bg-card rounded-2xl p-6 border border-border/50 flex flex-col justify-between shadow-md"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <p className="text-secondary font-semibold text-sm">Referral Network</p>
                    <Users className="text-primary" size={18} />
                  </div>
                  <p className="text-xs text-secondary mb-4 leading-relaxed">
                    Earn 5% from referrals. Total Network: {userData?.referral_count || 0}
                  </p>
                  <div className="flex items-center gap-2 p-2 bg-subtle rounded-xl border border-border/50">
                    <input 
                      type="text" 
                      readOnly 
                      value={`${window.location.origin}/signup?ref=${userData?.referral_code || 'USER'}`} 
                      className="bg-transparent text-[10px] text-primary w-full outline-none"
                    />
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        navigator.clipboard.writeText(`${window.location.origin}/signup?ref=${userData?.referral_code || 'USER'}`);
                        toast.success('Referral link copied!');
                      }}
                      className="text-[10px] bg-[#0052ff] text-white px-3 py-1.5 rounded-lg font-bold uppercase whitespace-nowrap"
                    >
                      Copy
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Financial Dashboard Module (Stock & Crypto) */}
            <div className="shrink-0 max-w-full overflow-hidden">
               <MarketOverview />
            </div>
            
            {/* Active Contracts Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-md shrink-0 overflow-x-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-semibold text-secondary">Active Contracts Overview</h3>
              </div>
              <table className="w-full text-left text-sm border-collapse min-w-[500px]">
                <thead>
                  <tr className="border-b border-border/50 text-secondary text-xs uppercase tracking-wider">
                    <th className="pb-3 font-semibold">Type</th>
                    <th className="pb-3 font-semibold">Power</th>
                    <th className="pb-3 font-semibold">Earnings</th>
                    <th className="pb-3 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length > 0 ? (
                    contracts.slice(0, 5).map((plan) => (
                      <tr key={plan.id} className="border-b border-border/50 last:border-0 hover:bg-subtle transition-colors">
                        <td className="py-3 font-medium text-primary capitalize">{plan.type}</td>
                        <td className="py-3 text-muted">{plan.hashpower}</td>
                        <td className="py-3 text-[#00f0ff] font-medium">+${plan.mined?.toFixed(2) || '0.00'}</td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/20 text-muted'
                          }`}>
                            {plan.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-muted text-xs">No active contracts found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </motion.div>
          </div>

          {/* Right Side Activity/Context Panel (Spans 4 columns on large screens) */}
          <div className="xl:col-span-4 flex flex-col gap-6 w-full">
            
            {/* Wallet Quick View */}
            <div className="shrink-0">
               <WalletWidget />
            </div>

            {/* Profile Summary */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-md shrink-0"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                  {userData?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-primary">{userData?.name || 'User'}</h4>
                  <p className="text-[10px] text-[#00f0ff] font-semibold uppercase tracking-wider">Level {currentLevel.level}</p>
                </div>
              </div>

              {/* Level Progress */}
              <div className="bg-surface p-3 rounded-xl border border-border/50 mb-4">
                <div className="flex justify-between text-[10px] mb-2 uppercase tracking-wider">
                  <span className="text-secondary">Progress</span>
                  <span className="text-[#00f0ff] font-semibold">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-subtle h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className="bg-gradient-to-r from-[#0052ff] to-[#00f0ff] h-full" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                 <div className="flex justify-between text-xs border-b border-border/30 pb-2">
                  <span className="text-secondary">ID Status</span>
                  <span className={`font-semibold ${
                    userData?.verification_status === 'verified' ? 'text-emerald-400' : 'text-yellow-400'
                  }`}>
                    {userData?.verification_status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                 <div className="flex justify-between text-xs pt-2">
                  <span className="text-secondary">Member Since</span>
                  <span className="text-primary">
                    {userData?.joined_date ? new Date(userData.joined_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '2024'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Transaction Activity Feed */}
            <div className="w-full shrink-0 flex-1 min-h-[300px]">
              <TransactionHistoryModule transactions={transactions} miningRevenue={totalMined} />
            </div>

            {/* Security Alerts / News */}
            <div className="shrink-0 w-full overflow-hidden">
              <NewsFeed />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
