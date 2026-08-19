import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router';
import { motion, animate, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Activity, 
  History, Plus, LogOut, TrendingUp, Users, Shield, DollarSign,
  Zap, Globe, RefreshCcw
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Brush 
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { auth, db, collection, query, where, orderBy, limit, onSnapshot, handleFirestoreError, OperationType, doc, getDoc } from '../firebase';
import WalletWidget from '../components/WalletWidget';
import NewsFeed from '../components/NewsFeed';
import MarketOverview from '../components/MarketOverview';
import CryptoTicker from '../components/CryptoTicker';
import LowPowerMiningBanner from '../components/LowPowerMiningBanner';
import BatteryStatus from '../components/BatteryStatus';
import TransactionHistoryModule from '../components/TransactionHistoryModule';
import FinancialPlanner from '../components/FinancialPlanner';
import { DashboardSkeletonLoader } from '../components/SkeletonLoaders';
import { useMarketWatch, MarketData } from '../hooks/useMarketWatch';
import { usePowerSave } from '../context/PowerSaveContext';
import { fluidSpring } from '../components/SystemManager';
import { signOut } from 'firebase/auth';
import { formatFirebaseDate } from '../utils/date';

// Lazy load TradingView widget
const TradingViewWidget = lazy(() => Promise.resolve({
  default: () => (
    <iframe 
      src="https://s.tradingview.com/widgetembed/?frameElementId=tradingview_123&symbol=BINANCE%3ABTCUSDT&interval=D&hidesidetoolbar=1&symboledit=1&saveimage=1&toolbarbg=transparent&studies=%5B%5D&theme=dark&style=1&timezone=Etc%2FUTC"
      width="100%" 
      height="100%" 
      frameBorder="0" 
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
  const { isEffectivePowerSaving, updateIntervalMs } = usePowerSave();
  const [contracts, setContracts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [liveFeed, setLiveFeed] = useState({
    performance: '99',
    hashrate: '500', 
    revenue: '45000',
    chartData: '4000, 3000, 4500, 5000, 4800, 6000'
  });
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  // Real-time market feed via WebSockets
  const market = useMarketWatch(['btcusdt', 'ethusdt', 'solusdt', 'bnbusdt']);

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
      setIsLoading(false);
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

    // Live Feed Listener
    const liveFeedRef = collection(db, 'system');
    const unsubscribeFeed = onSnapshot(query(liveFeedRef, limit(10)), (snapshot) => {
      snapshot.forEach(doc => {
        if (doc.id === 'live_feed') {
          const data = doc.data();
          setLiveFeed({
            performance: data.performance || '99',
            hashrate: data.hashrate || '500',
            revenue: data.revenue || '45000',
            chartData: data.chartData || '4000, 3000, 4500, 5000, 4800, 6000'
          });
        }
      });
    });

    // Background polling mechanism to automatically fetch latest account data (throttled in Power-Save mode)
    const pollInterval = setInterval(async () => {
      if (!user) return;
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          console.log(`[Background Poll (${updateIntervalMs}ms)] Latest account data fetched successfully:`, userSnap.data());
        }
      } catch (err) {
        console.error('[Background Poll] Error fetching latest account data:', err);
      }
    }, updateIntervalMs);

    return () => {
      unsubscribeContracts();
      unsubscribeTransactions();
      unsubscribeFeed();
      clearInterval(pollInterval);
    };
  }, [user, authLoading, navigate, updateIntervalMs]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  if (authLoading || isLoading) {
    return <DashboardSkeletonLoader />;
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
  const pendingWithdrawal = transactions.some(tx => tx.type === 'withdrawal' && tx.status === 'pending');

  return (
    <div className="relative min-h-screen bg-background text-primary p-4 md:p-8">
      {/* Global Ambient Gradients */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/5 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-[1440px] mx-auto pb-8 relative z-10 w-full">
        {pendingWithdrawal && (
          <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3 w-full">
            <Activity className="text-amber-500 shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="font-bold text-amber-500 text-sm">Withdrawal Pending</h4>
              <p className="text-amber-500/80 text-xs mt-1">Your recent withdrawal request is currently being processed by our system. You will be notified once it is completed.</p>
            </div>
          </div>
        )}

        {/* Low Battery Warning Banner During Active Mining Operations */}
        <div className="mb-6">
          <LowPowerMiningBanner 
            hasActiveMining={contracts.filter(c => c.status === 'active').length > 0 || contracts.length > 0} 
            activeMiningCount={contracts.filter(c => c.status === 'active').length || contracts.length} 
          />
        </div>

        <header className="mb-6 px-2 flex flex-col md:flex-row md:justify-between md:items-end gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tighter">Welcome back, {userData?.name}</h1>
            <p className="text-secondary mt-1 text-sm leading-relaxed">Here is the update on your crypto operations.</p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            <BatteryStatus hasActiveMining={contracts.filter(c => c.status === 'active').length > 0 || contracts.length > 0} />
          </div>
        </header>

        <div className="mb-8 -mx-4 md:-mx-8">
          <CryptoTicker />
        </div>

        {/* Top Summary Banner - Refactored into Mobile-Friendly Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 md:gap-6 mb-8 w-full">
          
          {/* Total Balance Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-4 bg-card rounded-2xl p-5 sm:p-6 border border-border/40 shadow-md relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#0052ff] rounded-full blur-[60px] opacity-15 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-secondary font-semibold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Wallet size={14} className="text-[#0052ff]" /> Total Balance
                </span>
                <span className="text-[10px] bg-[#0052ff]/10 text-[#0052ff] px-2 py-0.5 rounded-full font-semibold">
                  Available
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-primary truncate">
                <AnimatedNumber value={userData?.balance || 0} prefix="$" />
              </h2>
            </div>
          </motion.div>

          {/* Total Profit Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="lg:col-span-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500 rounded-full blur-[60px] opacity-15 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Activity size={15} /> Total Profit
                </span>
                <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Sync
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)] truncate">
                <AnimatedNumber value={(totalMined || 0) + (userData?.manual_profits || 0)} prefix="$" />
              </h2>
              {dailyProfit > 0 && (
                <p className="text-xs text-emerald-400/80 font-medium mt-1">
                  +${dailyProfit.toFixed(2)} estimated daily yield
                </p>
              )}
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-4 bg-card rounded-2xl p-5 sm:p-6 border border-border/40 shadow-md flex flex-col justify-between gap-3"
          >
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">Quick Actions</span>
            <div className="grid grid-cols-2 gap-3 w-full">
              <button 
                onClick={() => navigate('/deposit')} 
                className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm whitespace-nowrap shadow-lg shadow-[#0052ff]/20"
              >
                <ArrowDownRight size={16} /> Deposit
              </button>
              <button 
                onClick={() => navigate('/withdraw')} 
                className="bg-subtle hover:bg-subtle-hover text-primary px-4 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-border text-xs sm:text-sm whitespace-nowrap"
              >
                <ArrowUpRight size={16} /> Withdraw
              </button>
            </div>
          </motion.div>
        </div>

        {/* 12-Column Grid System */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 w-full">
          
          {/* Main Content Column (Spans 8 columns on large screens) */}
          <div className="xl:col-span-8 flex flex-col gap-6 w-full overflow-hidden">

            {/* Mining Performance & Live Network Grid Card */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-card rounded-2xl p-5 sm:p-6 border border-border/50 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full bg-[#0052ff] rounded-l-2xl" />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#0052ff]/10 rounded-xl text-[#0052ff]">
                    <Zap size={18} />
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold">Mining Performance & Live Stats</h3>
                    <p className="text-xs text-secondary">Real-time network hash output and yield metrics</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <RefreshCcw size={11} className="text-emerald-400 animate-spin-slow" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Syncing</span>
                </div>
              </div>

              {/* Grid layout for mobile & desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 bg-background border border-border/50 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Performance</span>
                    <Zap size={14} className="text-amber-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-primary flex items-baseline gap-1">
                    {liveFeed.performance}% 
                    <span className="text-xs text-emerald-500 font-bold">▲</span>
                  </p>
                  <span className="text-[10px] text-emerald-400 font-medium">Optimal Efficiency</span>
                </div>

                <div className="p-3.5 sm:p-4 bg-background border border-border/50 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Mining Hashrate</span>
                    <Activity size={14} className="text-[#0052ff]" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-[#0052ff]">
                    {totalHashrate > 0 ? totalHashrate.toFixed(2) : liveFeed.hashrate} <span className="text-xs font-bold text-secondary">TH/s</span>
                  </p>
                  <span className="text-[10px] text-secondary font-medium">{contracts.length} Active Contracts</span>
                </div>

                <div className="p-3.5 sm:p-4 bg-background border border-border/50 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Est. Daily Yield</span>
                    <TrendingUp size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-emerald-400">
                    ${dailyProfit.toFixed(2)}
                  </p>
                  <span className="text-[10px] text-emerald-400/80 font-medium">Auto Payout Active</span>
                </div>

                <div className="p-3.5 sm:p-4 bg-background border border-border/50 rounded-xl flex flex-col justify-between">
                  <div className="flex items-center justify-between text-secondary mb-1">
                    <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider">Global Pool Profit</span>
                    <DollarSign size={14} className="text-emerald-400" />
                  </div>
                  <p className="text-xl sm:text-2xl font-extrabold text-emerald-400 truncate">
                    ${Number(liveFeed.revenue).toLocaleString()}
                  </p>
                  <span className="text-[10px] text-secondary font-medium">Network 24h Yield</span>
                </div>
              </div>
            </motion.div>
            
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

            {/* Performance Chart */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-md shrink-0"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold">Growth Overview</h3>
                  <p className="text-sm text-secondary">Your estimated yield and hashrate trajectory.</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                  <RefreshCcw size={12} className="text-emerald-400 animate-spin-slow" />
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Live Feed Active</span>
                </div>
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#00f0ff" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorHashrate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0052ff" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#0052ff" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="value" stroke="#00f0ff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    <Area type="monotone" dataKey="hashrate" stroke="#0052ff" strokeWidth={3} fillOpacity={1} fill="url(#colorHashrate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Mining Stats & App Market */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
              {/* Mining Stats */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="w-full bg-card rounded-2xl p-6 border border-border/50 shadow-md flex flex-col justify-center"
              >
                <div className="flex justify-between items-center mb-4">
                  <p className="text-secondary font-semibold text-sm">Active Hashpower</p>
                  <Activity className="text-[#0052ff]" size={18} />
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-secondary uppercase tracking-wider">Total Hashrate</p>
                    <p className="text-3xl font-bold text-primary">{totalHashrate.toFixed(2)} TH/s</p>
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

            {/* NEW: Financial Plans Display Section */}
            <div id="financial-plans-display" className="shrink-0 max-w-full">
              <FinancialPlanner />
            </div>
            
            {/* Quick Hub/Profile Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button onClick={() => navigate('/hub')} className="bg-card p-6 rounded-2xl border border-border/50 hover:border-[#0052ff] transition-all text-left">
                <h3 className="font-bold">Operations Hub</h3>
                <p className="text-sm text-secondary">Manage platform features</p>
              </button>
              <button onClick={() => navigate('/profile')} className="bg-card p-6 rounded-2xl border border-border/50 hover:border-[#0052ff] transition-all text-left">
                <h3 className="font-bold">User Profile</h3>
                <p className="text-sm text-secondary">Manage your settings</p>
              </button>
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
                      <td colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-secondary text-sm mb-4">You don't have any active contracts right now.</p>
                          <button onClick={() => navigate('/buy-hashpower')} className="bg-[#0052ff] hover:bg-[#0052ff]/90 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-transform active:scale-95">
                            Buy Hashpower
                          </button>
                        </div>
                      </td>
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
                    {formatFirebaseDate(userData?.joined_date, { month: 'short', year: 'numeric' })}
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
