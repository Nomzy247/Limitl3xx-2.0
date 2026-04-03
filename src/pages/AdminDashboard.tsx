import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Server, Activity, DollarSign, AlertCircle, CheckCircle2, ArrowUpRight, ArrowDownRight, Bot, Settings, Sliders, ShieldAlert, ShieldCheck, ShieldX, Search } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { db, collection, query, where, orderBy, limit, onSnapshot, doc, getDoc, getDocs, setDoc, updateDoc, addDoc, runTransaction, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import UserActionModal from '../components/UserActionModal';

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
  const [logs, setLogs] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [adminEmailInput, setAdminEmailInput] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [selectedUserForAction, setSelectedUserForAction] = useState<any>(null);

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

  // Fetch Transactions
  useEffect(() => {
    const transactionsQuery = query(
      collection(db, 'transactions'),
      where('status', '==', 'pending'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(transactionsQuery, (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTransactions(txData);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'transactions');
    });

    return () => unsubscribe();
  }, []);

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
      const term = searchTerm.toLowerCase().trim();
      
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
    if (!isSuperUser) {
      toast.error('Only the Super User can allocate administrator roles.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', userId), { role: 'admin' });
      toast.success('User promoted to admin successfully');
    } catch (error: any) {
      console.error('Error promoting user:', error);
      toast.error('Failed to promote user');
    }
  };

  const handleDemoteFromAdmin = async (userId: string, userEmail: string) => {
    if (!isSuperUser) {
      toast.error('Only the Super User can revoke administrator roles.');
      return;
    }
    if (userEmail === 'why.wd.ww.do@gmail.com' || userEmail === 'limitl3xx.007@gmail.com') {
      toast.error('Root admin cannot be demoted');
      return;
    }

    try {
      await updateDoc(doc(db, 'users', userId), { role: 'user' });
      toast.success('Admin privileges revoked');
    } catch (error: any) {
      console.error('Error demoting user:', error);
      toast.error('Failed to demote user');
    }
  };

  const handlePromoteByEmail = async () => {
    if (!isSuperUser) {
      toast.error('Only the Super User can allocate administrator roles.');
      return;
    }
    if (!adminEmailInput) return;
    setIsPromoting(true);
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', adminEmailInput.toLowerCase()),
        limit(1)
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        toast.error('User not found with this email');
      } else {
        const userDoc = snapshot.docs[0];
        await updateDoc(doc(db, 'users', userDoc.id), { role: 'admin' });

        toast.success(`${adminEmailInput} promoted to admin`);
        setAdminEmailInput('');
      }
    } catch (error: any) {
      console.error('Error promoting user by email:', error);
      toast.error('Failed to promote user');
    } finally {
      setIsPromoting(false);
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
        const newBalance = tx.type === 'deposit' 
          ? currentBalance + tx.amount 
          : currentBalance - tx.amount;

        if (newBalance < 0) throw new Error('Insufficient user balance');

        transaction.update(txRef, { 
          status: 'approved',
          approved_at: serverTimestamp(),
          approved_by: currentUser?.uid
        });

        transaction.update(userRef, { balance: newBalance });

        // Log action
        const logRef = doc(collection(db, 'logs'));
        transaction.set(logRef, {
          user_id: currentUser?.uid,
          type: 'admin',
          action: `Approved ${tx.type} of ${tx.amount} BTC for user ${tx.user_id}`,
          timestamp: serverTimestamp()
        });
      });

      toast.success('Transaction approved');
    } catch (error: any) {
      console.error('Approval error:', error);
      toast.error(error.message || 'Failed to approve transaction');
    }
  };

  const handleRejectTransaction = async (tx: any) => {
    try {
      await updateDoc(doc(db, 'transactions', tx.id), {
        status: 'rejected',
        rejected_at: serverTimestamp(),
        rejected_by: currentUser?.uid
      });

      toast.info('Transaction rejected');

      // Log action
      await addDoc(collection(db, 'logs'), {
        user_id: currentUser?.uid,
        type: 'admin',
        action: `Rejected ${tx.type} of ${tx.amount} BTC for user ${tx.user_id}`,
        timestamp: serverTimestamp()
      });
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
      await addDoc(collection(db, 'logs'), {
        type: 'admin',
        action: `Updated global settings: AI=${aiEnabled}, Margin=${globalProfitMargin}%`,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
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
          <button className="px-4 py-2 bg-subtle text-primary rounded-full font-medium hover:bg-subtle-hover transition-colors">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.4 }}
          className="lg:col-span-2 bg-surface border border-border rounded-3xl p-6"
        >
          <h3 className="text-xl font-bold mb-6">Revenue & User Growth</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-sm flex items-center gap-2">
                      {user.name || 'Unknown User'}
                      {user.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#0052ff]/10 text-[#0052ff] text-[10px] font-bold uppercase flex items-center gap-1">
                          <ShieldCheck size={10} /> Admin
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
                        onClick={() => setSelectedUserForAction(user)}
                        className="text-xs bg-primary text-background hover:opacity-90 px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 font-bold shadow-md"
                      >
                        <Settings size={14} /> Action Panel
                      </button>
                      
                      {isSuperUser && user.role !== 'admin' && (
                        <button
                          onClick={() => handlePromoteToAdmin(user.id)}
                          className="text-[10px] text-[#00f0ff] hover:text-white hover:bg-[#00f0ff]/20 px-2 py-1 rounded transition-colors flex items-center gap-1 font-bold uppercase"
                        >
                          <ShieldAlert size={12} /> Promote
                        </button>
                      )}
                      
                      {isSuperUser && user.role === 'admin' && user.email !== 'why.wd.ww.do@gmail.com' && user.email !== 'limitl3xx.007@gmail.com' && (
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

      {/* Admin Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* AI & Profit Control */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.6 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-[#0052ff]/10 rounded-xl">
              <Bot className="text-[#0052ff]" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">AI & Profit Management</h3>
              <p className="text-sm text-secondary">Control client profits and AI automation</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
              <div>
                <h4 className="font-semibold text-primary">AI Auto-Management</h4>
                <p className="text-xs text-secondary mt-1">AI takes over client profit distribution when admin is offline.</p>
              </div>
              <button 
                onClick={() => setAiEnabled(!aiEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-[#0052ff]' : 'bg-muted'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary mb-2">Global Client Profit Margin (%)</label>
              <div className="flex items-center gap-4">
                <input 
                  type="range" 
                  min="1" 
                  max="50" 
                  value={globalProfitMargin}
                  onChange={(e) => setGlobalProfitMargin(Number(e.target.value))}
                  className="w-full accent-[#0052ff]"
                />
                <span className="font-mono text-primary font-bold w-12 text-right">{globalProfitMargin}%</span>
              </div>
              <p className="text-xs text-muted mt-2">Adjusting this affects all active client mining contracts.</p>
            </div>
          </div>
        </motion.div>

        {/* Costings Management */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.7 }}
          className="bg-surface border border-border rounded-3xl p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Sliders className="text-emerald-500" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Section Costings</h3>
              <p className="text-sm text-secondary">Set base prices for mining sections</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Pool Mining Base Cost ($)</label>
              <input 
                type="number" 
                value={costings.pool}
                onChange={(e) => setCostings({...costings, pool: Number(e.target.value)})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Cloud Mining Base Cost ($)</label>
              <input 
                type="number" 
                value={costings.cloud}
                onChange={(e) => setCostings({...costings, cloud: Number(e.target.value)})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary">Crypto Mining Base Cost ($)</label>
              <input 
                type="number" 
                value={costings.crypto}
                onChange={(e) => setCostings({...costings, crypto: Number(e.target.value)})}
                className="w-32 bg-background border border-border rounded-full px-3 py-2 text-primary text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
              />
            </div>
          </div>

          <button 
            onClick={handleSaveSettings}
            className="w-full mt-6 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium transition-colors"
          >
            Save All Changes
          </button>
        </motion.div>

        {/* Add Admin by Email (Super User Only) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.75 }}
          className={`bg-surface border border-border rounded-3xl p-6 ${!isSuperUser ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-primary/10 rounded-xl">
              <ShieldAlert className="text-primary" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Add Administrator</h3>
              <p className="text-sm text-secondary">
                {isSuperUser ? 'Promote any user by their email address' : 'Super User access required'}
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
                    {log.timestamp ? new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '00:00'}
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
            <span className="px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[10px] font-bold rounded">
              {transactions.length} PENDING
            </span>
          </div>

          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {transactions.map((tx) => (
              <div key={tx.id} className="p-4 bg-background border border-border/50 rounded-2xl hover:border-border transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-primary capitalize">{tx.type}</p>
                    <p className="text-[10px] text-muted font-mono mt-1">{tx.user_id}</p>
                    {tx.address && <p className="text-[10px] text-secondary font-mono mt-0.5">{tx.address}</p>}
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${tx.type === 'deposit' ? 'text-emerald-500' : 'text-red-500'}`}>
                      {tx.type === 'deposit' ? '+' : '-'}{tx.amount.toFixed(8)} BTC
                    </p>
                    <p className="text-[10px] text-muted">
                      {tx.timestamp ? new Date(tx.timestamp).toLocaleDateString() : 'Unknown Date'}
                    </p>
                  </div>
                </div>
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
            ))}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
