import { useState, useEffect } from 'react';
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
import { db, collection, query, where, orderBy, limit, onSnapshot, handleFirestoreError, OperationType, logOut } from '../firebase';
import WalletWidget from '../components/WalletWidget';
import NewsFeed from '../components/NewsFeed';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';

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
      limit(10)
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userData?.name}</h1>
          <p className="text-secondary text-sm">Here is what's happening with your portfolio today.</p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-subtle hover:bg-subtle-hover text-muted transition-colors text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Balance Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-1 lg:col-span-2 bg-card rounded-3xl p-6 border border-border/50 relative overflow-hidden shadow-xl"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#0052ff] rounded-full blur-[100px] opacity-10 pointer-events-none" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <p className="text-secondary font-medium mb-1">Total Balance</p>
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                <AnimatedNumber value={userData?.balance || 0} prefix="$" />
              </h2>
            </div>
            <div className="p-3 bg-[#0052ff]/10 rounded-xl">
              <Wallet className="text-[#0052ff]" size={24} />
            </div>
          </div>

          <div className="flex gap-4 relative z-10">
            <button onClick={() => navigate('/deposit')} className="flex-1 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors">
              <ArrowDownRight size={18} /> Deposit
            </button>
            <button onClick={() => navigate('/withdraw')} className="flex-1 bg-subtle hover:bg-subtle-hover text-primary py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-colors border border-border">
              <ArrowUpRight size={18} /> Withdraw
            </button>
          </div>
        </motion.div>

        {/* Mining Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
        >
          <div className="flex justify-between items-center mb-4">
            <p className="text-secondary font-medium">Mining Stats</p>
            <Activity className="text-[#00f0ff]" size={20} />
          </div>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider">Total Mined</p>
              <p className="text-xl font-bold text-primary">${totalMined.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-secondary uppercase tracking-wider">Est. Daily Profit</p>
              <p className="text-xl font-bold text-emerald-400">+${dailyProfit.toFixed(2)}</p>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-secondary">Efficiency: 98.5%</p>
              <div className="w-full bg-subtle h-1 rounded-full mt-1 overflow-hidden">
                <div className="bg-[#00f0ff] h-full w-[98.5%]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Referral Program */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-6 border border-border/50 flex flex-col justify-between shadow-xl"
        >
          <div>
            <div className="flex justify-between items-center mb-4">
              <p className="text-secondary font-medium">Referral Program</p>
              <Users className="text-primary" size={20} />
            </div>
            <p className="text-xs text-secondary mb-4 leading-relaxed">
              Earn 5% from your referrals' mining profits.
            </p>
            <div className="flex items-center gap-2 p-2 bg-subtle rounded-full border border-border/50">
              <input 
                type="text" 
                readOnly 
                value={`https://mine.io/ref/${userData?.referralCode || 'USER'}`} 
                className="bg-transparent text-[10px] text-primary w-full outline-none"
              />
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(`https://mine.io/ref/${userData?.referralCode || 'USER'}`);
                  toast.success('Referral link copied!');
                }}
                className="text-[10px] bg-[#0052ff] text-white px-2 py-1 rounded-md font-bold uppercase"
              >
                Copy
              </button>
            </div>
          </div>
          <div className="mt-4 flex justify-between items-center text-[10px]">
            <span className="text-secondary">Total Referrals: {userData?.referralCount || 0}</span>
            <span className="text-emerald-400 font-bold">Earned: $0.00</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        {/* Profile Summary */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
              {userData?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <h4 className="font-bold text-primary">{userData?.name || 'User'}</h4>
              <p className="text-xs text-[#00f0ff] font-semibold">Level {currentLevel.level}: {currentLevel.name}</p>
            </div>
          </div>

          {/* Level Progress Bar */}
          <div className="mb-6 bg-surface p-3 rounded-xl border border-border/50">
            <div className="flex justify-between text-xs mb-2">
              <span className="text-secondary">Level {currentLevel.level}</span>
              {nextLevel ? (
                <span className="text-secondary">Level {nextLevel.level} ({nextLevel.threshold - totalInvestment > 0 ? `$${(nextLevel.threshold - totalInvestment).toLocaleString()} to go` : 'Ready'})</span>
              ) : (
                <span className="text-[#00f0ff]">Max Level</span>
              )}
            </div>
            <div className="w-full bg-subtle h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, delay: 0.5 }}
                className="bg-gradient-to-r from-[#0052ff] to-[#00f0ff] h-full" 
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-secondary">Total Investment</span>
              <span className="font-medium text-primary">${totalInvestment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary">Referral Code</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#00f0ff]">{userData?.referralCode || 'N/A'}</span>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(userData?.referralCode || 'N/A');
                    toast.success('Referral code copied!');
                  }}
                  className="text-[10px] bg-subtle hover:bg-subtle-hover text-primary px-2 py-0.5 rounded"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary">Referral Count</span>
              <span className="font-medium text-primary">{userData?.referralCount || 0}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary">Verification</span>
              <span className={`font-medium ${
                userData?.verificationStatus === 'verified' ? 'text-emerald-400' :
                userData?.verificationStatus === 'pending' ? 'text-yellow-400' :
                'text-red-400'
              }`}>
                {userData?.verificationStatus?.toUpperCase() || 'PENDING'}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-secondary">Member Since</span>
              <span className="text-primary">
                {userData?.joinedDate ? new Date(userData.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Jan 2024'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Security Status */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl"
        >
          <div className="flex justify-between items-center mb-6">
            <h4 className="font-bold text-primary">Security</h4>
            <Shield className="text-emerald-400" size={18} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">Email Verification</span>
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${userData?.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-yellow-500/10 text-yellow-400'}`}>
                {userData?.verificationStatus === 'verified' ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-secondary">Email Alerts</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold rounded">ACTIVE</span>
            </div>
            <div className="pt-2 border-t border-border/50">
              <button 
                onClick={() => toast.success('Mining reward of 0.005 BTC successfully added to your balance!')}
                className="w-full text-xs bg-subtle hover:bg-subtle-hover text-primary py-2 rounded-lg transition-colors border border-border"
              >
                Simulate Reward Notification
              </button>
            </div>
            <div className="pt-2 border-t border-border/50">
              <p className="text-[10px] text-secondary">Last Login IP:</p>
              <p className="text-[10px] text-primary font-mono mt-0.5">192.168.1.42 (London, UK)</p>
            </div>
          </div>
        </motion.div>

        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="col-span-1 lg:col-span-2 bg-card rounded-3xl p-6 border border-border/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Yield Performance Overview</h3>
            <select className="bg-surface border border-border rounded-full px-3 py-1 text-sm text-muted focus:outline-none focus:border-[#0052ff] transition-colors">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0052ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} dx={-10} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#ffffff20', strokeWidth: 2, strokeDasharray: '4 4' }} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#00f0ff" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  activeDot={{ r: 6, fill: '#00f0ff', stroke: '#111827', strokeWidth: 3 }}
                />
                <Area 
                  type="monotone" 
                  dataKey="hashrate" 
                  stroke="#0052ff" 
                  strokeWidth={2} 
                  fillOpacity={0} 
                  activeDot={{ r: 4, fill: '#0052ff', stroke: '#111827', strokeWidth: 2 }}
                />
                <Brush dataKey="name" height={30} stroke="#0052ff" fill="#111827" tickFormatter={() => ''} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Recent Activity</h3>
            <button className="text-sm text-[#0052ff] hover:text-[#00f0ff] transition-colors font-medium">View All</button>
          </div>
          
          <div className="space-y-3 flex-1">
            {transactions.length > 0 ? (
              transactions.map((tx: any, i: number) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  key={tx.id} 
                  className="group flex items-center justify-between p-4 rounded-2xl bg-surface border border-border/50 hover:border-border hover:bg-subtle transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                      tx.type === 'deposit' ? 'bg-emerald-500/10 text-emerald-400' :
                      tx.type === 'withdrawal' ? 'bg-rose-500/10 text-rose-400' :
                      'bg-[#00f0ff]/10 text-[#00f0ff]'
                    }`}>
                      {tx.type === 'deposit' ? <ArrowDownRight size={18} /> :
                       tx.type === 'withdrawal' ? <ArrowUpRight size={18} /> :
                       <Activity size={18} />}
                    </div>
                    <div>
                      <p className="text-sm font-semibold capitalize text-primary group-hover:text-primary transition-colors">{tx.type}</p>
                      <p className="text-xs text-muted mt-0.5">
                        {new Date(tx.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold text-sm ${
                      tx.type === 'withdrawal' ? 'text-rose-400' : 'text-emerald-400'
                    }`}>
                      {tx.type === 'withdrawal' ? '-' : '+'}${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-xs text-muted mt-0.5 capitalize">{tx.status}</p>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-muted text-sm py-8">
                <History className="mb-3 opacity-30" size={32} />
                <p>No recent transactions</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="col-span-1">
          <WalletWidget />
        </div>
        <div className="col-span-1 lg:col-span-2">
          <NewsFeed />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Active Contracts */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-1 lg:col-span-3 bg-card rounded-3xl p-6 border border-border/50"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold">Active Mining Contracts</h3>
            <button onClick={() => navigate('/buy-hashpower')} className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white text-sm font-medium transition-colors">
              <Plus size={16} /> New Contract
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border/50 text-secondary text-sm">
                  <th className="pb-4 font-medium">Contract Name</th>
                  <th className="pb-4 font-medium">Type</th>
                  <th className="pb-4 font-medium">Hashpower</th>
                  <th className="pb-4 font-medium">Price</th>
                  <th className="pb-4 font-medium">Daily ROI</th>
                  <th className="pb-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {contracts.length > 0 ? (
                  contracts.map((plan) => (
                    <tr key={plan.id} className="border-b border-border/50 last:border-0 hover:bg-subtle transition-colors">
                      <td className="py-4 font-semibold text-primary capitalize">{plan.type} Miner</td>
                      <td className="py-4 text-muted capitalize">{plan.type}</td>
                      <td className="py-4 text-muted">{plan.hashpower}</td>
                      <td className="py-4 text-muted">${plan.price.toFixed(2)}</td>
                      <td className="py-4 text-[#00f0ff] font-medium">+{plan.dailyReturn}%</td>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase ${
                          plan.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted/20 text-muted'
                        }`}>
                          {plan.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">No active contracts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
