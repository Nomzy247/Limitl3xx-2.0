import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Server, Activity, DollarSign, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight, Bot, Settings, Sliders, ShieldAlert, ShieldCheck, ShieldX, Search, Power, Gift, Copy, Check, Eye, X, Image as ImageIcon } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { db, collection, query, where, orderBy, limit, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, runTransaction, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import { formatFirebaseDate } from '../utils/date';
import UserActionModal from '../components/UserActionModal';
import TaskManager from '../components/TaskManager';
import LiveActivityRadar from '../components/LiveActivityRadar';
import { useNavigate } from 'react-router';

const data = [
  { name: 'Mon', revenue: 4000, users: 2400 },
  { name: 'Tue', revenue: 3000, users: 1398 },
  { name: 'Wed', revenue: 2000, users: 9800 },
  { name: 'Thu', revenue: 2780, users: 3908 },
  { name: 'Fri', revenue: 1890, users: 4800 },
  { name: 'Sat', revenue: 2390, users: 3800 },
  { name: 'Sun', revenue: 3490, users: 4300 },
];

export default function AdminDashboard() {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [costings, setCostings] = useState({
    pool: 150,
    cloud: 100,
    crypto: 200
  });
  const [globalProfitMargin, setGlobalProfitMargin] = useState(15);
  const [systemStats, setSystemStats] = useState({
    tvl: '$0',
    miners: '0',
    countries: '0',
    uptime: '0%'
  });
  const [liveFeed, setLiveFeed] = useState({
    performance: '99',
    hashrate: '500',
    revenue: '45000',
    chartData: '4000, 3000, 4500, 5000, 4800, 6000'
  });
  const [logs, setLogs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<any[]>([]);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);
  const [txFilterType, setTxFilterType] = useState('all');
  const [txFilterStatus, setTxFilterStatus] = useState('pending');
  const [selectedImagePreview, setSelectedImagePreview] = useState<{ url: string; title: string } | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  const logAdminAction = async (action: string) => {
    await addDoc(collection(db, 'logs'), {
      user_id: currentUser?.uid,
      type: 'admin',
      action,
      timestamp: serverTimestamp()
    });
  };

  // Fetch Global Settings
  useEffect(() => {
    const settingsDoc = doc(db, 'settings', 'global');
    
    const unsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAiEnabled(data.ai_enabled ?? true);
        setCostings(data.costings ?? { pool: 150, cloud: 100, crypto: 200 });
        setGlobalProfitMargin(data.global_profit_margin ?? 15);
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Fetch System Stats
  useEffect(() => {
    const statsDoc = doc(db, 'system', 'stats');
    
    const unsubscribe = onSnapshot(statsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setSystemStats({
          tvl: data.tvl || '$0',
          miners: data.miners || '0',
          countries: data.countries || '0',
          uptime: data.uptime || '0%'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Live Feed
  useEffect(() => {
    const feedDoc = doc(db, 'system', 'live_feed');
    
    const unsubscribe = onSnapshot(feedDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setLiveFeed({
          performance: data.performance || '99',
          hashrate: data.hashrate || '500',
          revenue: data.revenue || '45000',
          chartData: data.chartData || '4000, 3000, 4500, 5000, 4800, 6000'
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch Transactions
  useEffect(() => {
    let transactionsQuery = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      let txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as any[];
      
      if (txFilterType !== 'all') {
        txData = txData.filter(tx => tx.type === txFilterType);
      }
      if (txFilterStatus !== 'all') {
        txData = txData.filter(tx => tx.status === txFilterStatus);
      }
      
      setTransactions(txData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, [txFilterType, txFilterStatus]);

  // Fetch Logs
  useEffect(() => {
    const logsQuery = query(
      collection(db, 'logs'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(logsQuery, (snapshot) => {
      const logsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLogs(logsData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'logs');
    });

    return () => unsubscribe();
  }, []);

  // Fetch Notifications
  useEffect(() => {
    const q = query(
      collection(db, 'notifications'),
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    const unsubscribe = onSnapshot(q, snapshot => {
      setAdminNotifications(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
    }, error => handleFirestoreError(error, OperationType.LIST, 'notifications'));
    
    return unsubscribe;
  }, []);

  // Fetch Recent Users
  useEffect(() => {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('joined_date', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRecentUsers(usersData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });

    return () => unsubscribe();
  }, []);

  // Search Users
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const searchUsers = async () => {
      setIsSearching(true);
      const term = (searchTerm || '').toLowerCase().trim();
      
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '>=', term),
        where('email', '<=', term + '\uf8ff'),
        limit(10)
      );

      try {
        const snapshot = await getDocs(usersQuery);
        const results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [searchTerm]);

  const displayedUsers = searchTerm.trim() ? searchResults : recentUsers;

  const isSuperUser = currentUser?.email === 'why.wd.ww.do@gmail.com' || currentUser?.email === 'limitl3xx.007@gmail.com';

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'admin' });
      await logAdminAction(`Promoted user ${userId} to admin`);
      toast.success('User promoted to admin successfully');
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error(error.message || 'Failed to promote user');
    }
  };

  const handleDemoteFromAdmin = async (userId: string, userEmail: string) => {
    if (userEmail === 'why.wd.ww.do@gmail.com' || userEmail === 'limitl3xx.007@gmail.com' || userEmail === currentUser?.email) {
      toast.error('Cannot demote root admins or yourself');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), { role: 'user' });
      await logAdminAction(`Revoked admin privileges from user ${userId}`);
      toast.success('Admin privileges revoked');
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast.error(error.message || 'Failed to demote user');
    }
  };

  const handlePromoteByEmail = async () => {
    if (!adminEmailInput) return;
    setIsPromoting(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', (adminEmailInput || '').toLowerCase()),
        limit(1)
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        toast.error('User not found with this email');
      } else {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });
        await logAdminAction(`Promoted user ${userDoc.id} to admin by email`);

        toast.success(`${adminEmailInput} promoted to admin`);
        setAdminEmailInput('');
      }
    } catch (error: any) {
      console.error('Error promoting user by email:', error);
      toast.error(error.message || 'Failed to promote user');
    } finally {
      setIsPromoting(false);
    }
  };

  const openUserActionModal = async (user: any) => {
    const userRef = doc(db, 'users', user.id);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setSelectedUserForAction({ id: userSnap.id, ...userSnap.data() });
    } else {
      toast.error('User not found');
    }
  };

  const filteredUsers = displayedUsers;

  const handleApproveTransaction = async (tx: any) => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', tx.user_id);
        const txRef = doc(db, 'transactions', tx.id);
        
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error('User not found');
        
        const userData = userSnap.data();
        const currentBalance = userData.balance || 0;
        
        // Deposit increases balance upon approval
        if (tx.type === 'deposit') {
          transaction.update(userRef, { balance: currentBalance + tx.amount });
        }
        // For withdrawals, balance was already deducted when created. No balance action.

        transaction.update(txRef, { 
          status: 'approved',
          approved_at: serverTimestamp(),
          approved_by: currentUser?.uid
        });
      });

      // Log action outside transaction logic
      await logAdminAction(`Approved ${tx.type} of $${tx.amount} for user ${tx.user_id}`);

      toast.success('Transaction approved');
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', tx.user_id);
        const txRef = doc(db, 'transactions', tx.id);
        
        const userSnap = await transaction.get(userRef);
        if (!userSnap.exists()) throw new Error('User not found');
        
        const userData = userSnap.data();
        const currentBalance = userData.balance || 0;

        // If reversing a withdrawal, refund the balance
        if (tx.type === 'withdrawal') {
          transaction.update(userRef, { balance: currentBalance + tx.amount });
        }
        
        transaction.update(txRef, {
          status: 'rejected',
          rejected_at: serverTimestamp(),
          rejected_by: currentUser?.uid
        });
      });

      // Log action outside transaction
      await logAdminAction(`Rejected ${tx.type} of $${tx.amount} for user ${tx.user_id}`);

      toast.info('Transaction rejected');
    } catch (error: any) {
      console.error('Rejection error:', error);
      toast.error(error.message || 'Failed to reject transaction');
    }
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ai_enabled: aiEnabled,
        costings: costings,
        global_profit_margin: globalProfitMargin,
        updated_at: serverTimestamp()
      }, { merge: true });
      
      toast.success('Global settings updated successfully!');
      
      // Log the action
      await logAdminAction(`Updated global settings: AI=${aiEnabled}, Margin=${globalProfitMargin}%`);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  const handleSaveStats = async () => {
    try {
      await setDoc(doc(db, 'system', 'stats'), {
        ...systemStats,
        updated_at: serverTimestamp()
      }, { merge: true });
      
      toast.success('Public statistics updated successfully!');
      await logAdminAction(`Updated public platform statistics.`);
    } catch (error: any) {
      console.error('Error saving stats:', error);
      toast.error('Failed to save public statistics');
    }
  };

  const handleSaveLiveFeed = async () => {
    try {
      await setDoc(doc(db, 'system', 'live_feed'), {
        ...liveFeed,
        updated_at: serverTimestamp()
      }, { merge: true });
      
      toast.success('Live feed updated successfully!');
      await logAdminAction(`Updated global live feed.`);
    } catch (error: any) {
      console.error('Error saving live feed:', error);
      toast.error('Failed to save live feed');
    }
  };

  const parsedChartData = liveFeed.chartData.split(',').map((val, index) => {
    const days = ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7', 'Day 8'];
    return {
      name: days[index % days.length],
      revenue: Number(val.trim()) || 0
    };
  });

  return (
    <div className="relative z-0 pt-32 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-5%] left-[-10%] w-[400px] h-[400px] bg-[#0052ff]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-5%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/5 rounded-full blur-[120px]" />
      </div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Admin Overview</h1>
          <p className="text-secondary mt-1">System status and user management</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => {
              document.getElementById('user-management-section')?.scrollIntoView({ behavior: 'smooth' });
              toast.info('Select a user from the list below to open their Action Panel');
            }}
            className="px-4 py-2 bg-primary text-background rounded-full font-bold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            <Settings size={16} /> User Action Panel
          </button>
          <button onClick={() => navigate('/admin/settings')} className="px-4 py-2 bg-subtle text-primary rounded-full font-medium hover:bg-subtle-hover transition-colors">
            System Settings
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-sm font-medium">
              +12.5% <ArrowUpRight size={16} />
            </span>
          </div>
          <h3 className="text-secondary text-sm font-medium mb-1">Total Users</h3>
          <p className="text-3xl font-bold">24,592</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.1 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center">
              <DollarSign className="text-emerald-500" size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-sm font-medium">
              +8.2% <ArrowUpRight size={16} />
            </span>
          </div>
          <h3 className="text-secondary text-sm font-medium mb-1">Monthly Revenue</h3>
          <p className="text-3xl font-bold">$1.2M</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.2 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
              <Server className="text-blue-500" size={24} />
            </div>
            <span className="flex items-center text-red-500 text-sm font-medium">
              -2.1% <ArrowDownRight size={16} />
            </span>
          </div>
          <h3 className="text-secondary text-sm font-medium mb-1">Active Miners</h3>
          <p className="text-3xl font-bold">8,439</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.3 }}
          className="bg-surface border border-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
              <Activity className="text-purple-500" size={24} />
            </div>
            <span className="flex items-center text-emerald-500 text-sm font-medium">
              99.99%
            </span>
          </div>
          <h3 className="text-secondary text-sm font-medium mb-1">System Health</h3>
          <p className="text-3xl font-bold">Optimal</p>
        </motion.div>
      </div>

      {/* Live Visitor & Activity Geo-Radar Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.35 }}
        className="mb-8"
      >
        <LiveActivityRadar />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.4 }}
          className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">Total Profit Generated</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={parsedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--color-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', borderRadius: '12px' }}
                  itemStyle={{ color: 'var(--color-primary)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Recent Users */}
        <motion.div 
          id="user-management-section"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.5 }}
          className="bg-surface border border-border rounded-3xl p-6 flex flex-col scroll-mt-24"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">User Management</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-background border border-border rounded-full text-sm focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2 scrollbar-thin scrollbar-thumb-border">
            {filteredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-subtle transition-colors border border-transparent hover:border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold relative">
                    {user.name?.charAt(0) || 'U'}
                    <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-surface ${user.is_blocked ? 'bg-red-500' : 'bg-emerald-500'}`} title={user.is_blocked ? 'Blocked' : 'Active'} />
                  </div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {user.name || 'Unknown User'}
                      {user.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#0052ff]/10 text-[#0052ff] text-[10px] font-bold uppercase flex items-center gap-1">
                          <ShieldCheck size={10} /> Admin
                        </span>
                      )}
                      {!user.trade_enabled && (
                        <span className="px-1.5 py-0.5 rounded-md bg-yellow-500/10 text-yellow-500 text-[10px] font-bold uppercase flex items-center gap-1">
                          <Power size={10} /> Trading Disabled
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-secondary">{user.email || user.phone || 'No contact info'}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-2">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    user.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500' :
                    user.verification_status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {user.verification_status || 'pending'}
                  </span>
                  
                  {user.id !== currentUser?.uid && (
                    <div className="flex flex-col gap-2 items-end">
                      <button
                        onClick={() => openUserActionModal(user)}
                        className="text-xs bg-primary text-background hover:opacity-90 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 font-bold shadow-md"
                      >
                        <Settings size={14} /> Action Panel
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id)}
                          className="text-[10px] text-[#00f0ff] hover:text-white hover:bg-[#00f0ff]/20 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase"
                        >
                          <ShieldAlert size={12} /> Promote
                        </button>
                      )}
                      
                      {user.role === 'admin' && user.email !== 'why.wd.ww.do@gmail.com' && user.email !== 'limitl3xx.007@gmail.com' && user.email !== currentUser?.email && (
                        <button
                          onClick={() => handleDemoteFromAdmin(user.id, user.email)}
                          className="text-[10px] text-red-400 hover:text-white hover:bg-red-400/20 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase"
                        >
                          <ShieldX size={12} /> Revoke Admin
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {filteredUsers.length === 0 && (
              <div className="text-center py-8">
                <p className="text-secondary text-sm">No users found matching "{searchTerm}"</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Notifications Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...fluidSpring, delay: 0.55 }}
        className="bg-surface border border-border rounded-3xl p-6 mb-8"
      >
        <h3 className="text-xl font-bold mb-6">Recent Activity Notifications</h3>
        <div className="space-y-4">
          {adminNotifications.map((notif: any) => (
            <div key={notif.id} className="p-4 bg-background border border-border rounded-xl flex justify-between items-center">
              <div>
                <p className="font-medium text-sm">{notif.message}</p>
                <p className="text-xs text-secondary">
                  {formatFirebaseDate(notif.timestamp, { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
                </p>
              </div>
              <button className="text-xs bg-primary text-background rounded-full px-3 py-1 font-bold">
                View
              </button>
            </div>
          ))}
          {adminNotifications.length === 0 && <p className="text-sm text-secondary">No recent notifications</p>}
        </div>
      </motion.div>
      
      {/* Admin Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

        {/* Public Stats Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.72 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <Activity className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Public Statistics</h3>
              <p className="text-sm text-secondary">Manage site-wide display statistics</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Total Value Locked</label>
              <input 
                type="text" 
                value={systemStats.tvl}
                onChange={(e) => setSystemStats({...systemStats, tvl: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Active Miners</label>
              <input 
                type="text" 
                value={systemStats.miners}
                onChange={(e) => setSystemStats({...systemStats, miners: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Countries</label>
              <input 
                type="text" 
                value={systemStats.countries}
                onChange={(e) => setSystemStats({...systemStats, countries: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Uptime</label>
              <input 
                type="text" 
                value={systemStats.uptime}
                onChange={(e) => setSystemStats({...systemStats, uptime: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveStats}
            className="w-full mt-6 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium transition-colors"
          >
            Save Statistics
          </button>
        </motion.div>

        {/* Global Live Feed Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.74 }}
          className="bg-surface border border-border rounded-3xl p-6 lg:col-span-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-fuchsia-500/10 rounded-xl">
              <Activity className="text-fuchsia-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Client Real-Time Feed</h3>
              <p className="text-sm text-secondary">Manage site-wide real time feeds</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Mining Performance (%)</label>
              <input 
                type="text" 
                value={liveFeed.performance}
                onChange={(e) => setLiveFeed({...liveFeed, performance: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Total Hashrate</label>
              <input 
                type="text" 
                value={liveFeed.hashrate}
                onChange={(e) => setLiveFeed({...liveFeed, hashrate: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Total Profit</label>
              <input 
                type="text" 
                value={liveFeed.revenue}
                onChange={(e) => setLiveFeed({...liveFeed, revenue: e.target.value})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-secondary">Chart Data (comma separated)</label>
              <input 
                type="text" 
                value={liveFeed.chartData}
                placeholder="e.g. 4000, 3000, 4500"
                onChange={(e) => setLiveFeed({...liveFeed, chartData: e.target.value})}
                className="w-full bg-background border border-border rounded-full px-3 py-2 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveLiveFeed}
            className="w-full mt-6 bg-fuchsia-600 hover:bg-fuchsia-500 text-white py-3 rounded-full font-medium transition-colors"
          >
            Broadcast to Clients
          </button>
        </motion.div>

        {/* Add Admin by Email */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.75 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShieldAlert className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Add Administrator</h3>
              <p className="text-sm text-secondary">
                Promote any user by their email address
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary mb-2">User Email Address</label>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="user@example.com"
                  value={adminEmailInput}
                  onChange={(e) => setAdminEmailInput(e.target.value)}
                  className="flex-1 bg-background border border-border rounded-full px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
                />
                <button 
                  onClick={handlePromoteByEmail}
                  disabled={isPromoting || !adminEmailInput}
                  className="px-6 bg-primary text-background rounded-full font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isPromoting ? '...' : 'Add'}
                </button>
              </div>
            </div>
            <p className="text-[10px] text-muted italic">
              Note: The user must already have an account on the platform to be promoted.
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.8 }}
        >
          <TaskManager />
        </motion.div>
      </div>

      {/* System Logs & Withdrawals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Logs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.8 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">System Activity Logs</h3>
            <div className="flex items-center gap-2">
              <button 
                onClick={async () => {
                  await addDoc(collection(db, 'logs'), {
                    type: 'ai',
                    action: 'AI: Re-balanced load across US-East nodes',
                    timestamp: serverTimestamp()
                  });
                  toast.info('AI Action Simulated');
                }}
                className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded hover:bg-primary/20 transition-colors"
              >
                Simulate AI
              </button>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>
          
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 hover:border-border transition-all">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-mono text-muted">
                    {formatFirebaseDate(log.timestamp, { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    log.type === 'ai' ? 'bg-[#0052ff]/10 text-[#0052ff]' :
                    log.type === 'admin' ? 'bg-emerald-500/10 text-emerald-500' :
                    'bg-secondary/10 text-secondary'
                  }`}>
                    {log.type}
                  </span>
                  <p className="text-sm text-primary">{log.action}</p>
                </div>
              </div>
            ))}
            {!isLoading && logs.length === 0 && (
              <div className="text-center py-12">
                <p className="text-secondary text-sm">No activity logs found</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Pending Transactions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.9 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold">Pending Transactions</h3>
            <div className="flex gap-2">
              <select value={txFilterType} onChange={(e) => setTxFilterType(e.target.value)} className="bg-background border border-border rounded-full px-3 py-1 text-xs">
                <option value="all">All Types</option>
                <option value="deposit">Deposit</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="purchase">Purchase</option>
              </select>
              <select value={txFilterStatus} onChange={(e) => setTxFilterStatus(e.target.value)} className="bg-background border border-border rounded-full px-3 py-1 text-xs">
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded">
              {transactions.length} {(txFilterStatus || '').toUpperCase()}
            </span>
          </div>

          <div className="space-y-4 max-h-[460px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((tx) => {
              const isGiftCard = tx.payment_method === 'gift_card' || !!tx.gift_card_code;

              return (
                <div key={tx.id} className="p-4 bg-background border border-border/50 rounded-2xl hover:border-border transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-primary capitalize">{tx.type}</p>
                        {isGiftCard && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                            <Gift size={10} /> {tx.gift_card_brand || 'Gift Card'}
                          </span>
                        )}
                        {tx.plan_name && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#0052ff]/15 text-[#0052ff]">
                            Plan: {tx.plan_name}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-muted font-mono mt-1">User: {tx.user_id}</p>
                      {tx.address && <p className="text-[10px] text-secondary font-mono mt-0.5">{tx.address}</p>}
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                        {tx.type === 'deposit' ? '+' : '-'}${Number(tx.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        {tx.method || tx.currency ? <span className="text-xs font-mono text-muted ml-1">({tx.method || tx.currency})</span> : ''}
                      </p>
                      <p className="text-[10px] text-muted">
                        {formatFirebaseDate(tx.timestamp)}
                      </p>
                    </div>
                  </div>

                  {/* Gift Card Details Box */}
                  {isGiftCard && (
                    <div className="mb-3 p-3 bg-card/60 border border-amber-500/20 rounded-xl space-y-2 text-xs">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-muted text-[11px]">Card Code:</span>
                          <span className="font-mono font-bold text-amber-300 tracking-wider select-all bg-background/80 px-2 py-0.5 rounded border border-border/50">
                            {tx.gift_card_code || 'N/A'}
                          </span>
                          {tx.gift_card_code && (
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(tx.gift_card_code);
                                setCopiedCodeId(`code-${tx.id}`);
                                toast.success('Gift card code copied!');
                                setTimeout(() => setCopiedCodeId(null), 2000);
                              }}
                              className="p-1 hover:bg-subtle rounded text-muted hover:text-primary transition-colors"
                              title="Copy Code"
                            >
                              {copiedCodeId === `code-${tx.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>

                        {tx.gift_card_pin && (
                          <div className="flex items-center gap-2">
                            <span className="text-muted text-[11px]">PIN / CVV:</span>
                            <span className="font-mono font-bold text-primary select-all bg-background/80 px-2 py-0.5 rounded border border-border/50">
                              {tx.gift_card_pin}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(tx.gift_card_pin);
                                setCopiedCodeId(`pin-${tx.id}`);
                                toast.success('PIN copied!');
                                setTimeout(() => setCopiedCodeId(null), 2000);
                              }}
                              className="p-1 hover:bg-subtle rounded text-muted hover:text-primary transition-colors"
                              title="Copy PIN"
                            >
                              {copiedCodeId === `pin-${tx.id}` ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                            </button>
                          </div>
                        )}
                      </div>

                      {tx.notes && (
                        <div className="text-[11px] text-muted italic bg-background/40 p-1.5 rounded">
                          " {tx.notes} "
                        </div>
                      )}

                      {/* Image Thumbnails with Lightbox Preview */}
                      {tx.gift_card_images && tx.gift_card_images.length > 0 && (
                        <div>
                          <p className="text-[10px] text-muted mb-1 flex items-center gap-1 font-medium">
                            <ImageIcon size={11} /> Attached Photos ({tx.gift_card_images.length}):
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {tx.gift_card_images.map((img: any, idx: number) => {
                              const imgUrl = typeof img === 'string' ? img : img.data;
                              const label = typeof img === 'string' ? `Photo #${idx + 1}` : img.label;
                              if (!imgUrl) return null;

                              return (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => setSelectedImagePreview({ url: imgUrl, title: `${tx.gift_card_brand || 'Gift Card'} - ${label}` })}
                                  className="group relative w-16 h-12 rounded-lg overflow-hidden border border-border hover:border-amber-400/60 transition-all cursor-zoom-in"
                                >
                                  <img 
                                    src={imgUrl} 
                                    alt={label} 
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Eye size={14} className="text-white" />
                                  </div>
                                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-center text-muted group-hover:text-white truncate px-0.5">
                                    {label}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleApproveTransaction(tx)}
                      className="flex-1 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-full text-xs font-bold transition-colors"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleRejectTransaction(tx)}
                      className="flex-1 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
            {transactions.length === 0 && (
              <div className="text-center py-12">
                <p className="text-secondary text-sm">No pending transactions</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedUserForAction && (
          <UserActionModal 
            user={selectedUserForAction} 
            onClose={() => setSelectedUserForAction(null)} 
            isSuperUser={isSuperUser}
            onUpdateUser={async (userId, data) => {
              await updateDoc(doc(db, 'users', userId), data);
            }}
            onLogAction={async (action) => {
              await addDoc(collection(db, 'logs'), {
                user_id: selectedUserForAction.id,
                type: 'admin',
                action,
                timestamp: serverTimestamp()
              });
            }}
          />
        )}

        {/* Gift Card Photo Lightbox Preview */}
        {selectedImagePreview && (
          <div 
            className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
            onClick={() => setSelectedImagePreview(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative max-w-4xl w-full bg-card border border-border rounded-3xl p-4 shadow-2xl flex flex-col max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-amber-400" />
                  <h4 className="font-bold text-sm text-primary">{selectedImagePreview.title}</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedImagePreview(null)}
                  className="p-1.5 rounded-full hover:bg-subtle text-muted hover:text-primary transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-auto flex items-center justify-center p-2 rounded-2xl bg-black/40 min-h-[300px]">
                <img
                  src={selectedImagePreview.url}
                  alt={selectedImagePreview.title}
                  className="max-h-[70vh] w-auto object-contain rounded-xl shadow-lg select-none"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="flex justify-between items-center pt-3 mt-2 border-t border-border/50 text-xs text-muted">
                <span>Click outside or press close to exit</span>
                <a
                  href={selectedImagePreview.url}
                  download="gift_card_proof.jpg"
                  className="px-3 py-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
                  target="_blank"
                  rel="noreferrer"
                >
                  Open Full Image
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
