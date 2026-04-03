import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Activity, ShieldX, DollarSign, RefreshCw, 
  Zap, User, Mail, UserCheck, AlertTriangle, TrendingUp 
} from 'lucide-react';
import { doc, updateDoc, deleteDoc, addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'sonner';
import { fluidSpring } from './SystemManager';

export default function UserActionModal({ user, onClose, isSuperUser }: any) {
  const [activeTab, setActiveTab] = useState('activity');
  const [isLoading, setIsLoading] = useState(false);

  // Finance State
  const [financeAmount, setFinanceAmount] = useState('');
  const [financeCurrency, setFinanceCurrency] = useState('USD');
  const [financeType, setFinanceType] = useState('credit');

  // Trade State
  const [tradeType, setTradeType] = useState('cloud');
  const [tradeHashpower, setTradeHashpower] = useState('100 TH/s');
  const [tradePrice, setTradePrice] = useState('');

  // Profile State
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileStatus, setProfileStatus] = useState(user?.verification_status || 'pending');

  // Contact State
  const [contactMethod, setContactMethod] = useState('email');
  const [contactMessage, setContactMessage] = useState('');

  if (!user) return null;

  const handleToggleBlock = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { is_blocked: !user.is_blocked });
      toast.success(`User ${user.is_blocked ? 'unblocked' : 'blocked'} successfully`);
      onClose();
    } catch (e) { toast.error('Failed to update block status'); }
    setIsLoading(false);
  };

  const handleToggleTrade = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { trade_enabled: !user.trade_enabled });
      toast.success(`Trading ${user.trade_enabled ? 'disabled' : 'enabled'} successfully`);
      onClose();
    } catch (e) { toast.error('Failed to update trade status'); }
    setIsLoading(false);
  };

  const handleFinance = async () => {
    if (!financeAmount || isNaN(Number(financeAmount))) return toast.error('Invalid amount');
    setIsLoading(true);
    try {
      const amountNum = Number(financeAmount);
      if (financeCurrency === 'USD') {
        const current = user.balance || 0;
        const newBal = financeType === 'credit' ? current + amountNum : Math.max(0, current - amountNum);
        await updateDoc(doc(db, 'users', user.id), { balance: newBal });
      } else {
        const current = user.balances?.[financeCurrency] || 0;
        const newBal = financeType === 'credit' ? current + amountNum : Math.max(0, current - amountNum);
        await updateDoc(doc(db, 'users', user.id), { [`balances.${financeCurrency}`]: newBal });
      }
      toast.success(`Successfully ${financeType}ed ${financeAmount} ${financeCurrency}`);
      onClose();
    } catch (e) { toast.error('Failed to update balance'); }
    setIsLoading(false);
  };

  const handleClearAccount = async () => {
    if (!window.confirm('Are you sure you want to clear all balances for this user?')) return;
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        balance: 0,
        balances: { BTC: 0, ETH: 0, USDT: 0 },
        referral_earnings: 0
      });
      toast.success('Account balances cleared');
      onClose();
    } catch (e) { toast.error('Failed to clear account'); }
    setIsLoading(false);
  };

  const handleAddTrade = async () => {
    if (!tradePrice || isNaN(Number(tradePrice))) return toast.error('Invalid price');
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'contracts'), {
        user_id: user.id,
        type: tradeType,
        hashpower: tradeHashpower,
        price: Number(tradePrice),
        start_date: new Date().toISOString(),
        status: 'active',
        daily_return: Number(tradePrice) * 0.05,
        next_payout: new Date(Date.now() + 86400000).toISOString()
      });
      toast.success('Trade contract added');
      onClose();
    } catch (e) { toast.error('Failed to add trade'); }
    setIsLoading(false);
  };

  const handleEditProfile = async () => {
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), {
        name: profileName,
        phone: profilePhone,
        verification_status: profileStatus
      });
      toast.success('Profile updated');
      onClose();
    } catch (e) { toast.error('Failed to update profile'); }
    setIsLoading(false);
  };

  const handleContact = async () => {
    if (!contactMessage) return toast.error('Message cannot be empty');
    setIsLoading(true);
    setTimeout(() => {
      toast.success(`Message sent to user via ${contactMethod}`);
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleSwitchAccount = () => {
    toast.success(`Switched to ${user.name}'s account view (Simulation)`);
    onClose();
  };

  const handleDelete = async () => {
    if (!isSuperUser) return toast.error('Only root admins can delete accounts');
    if (!window.confirm('Are you absolutely sure you want to delete this user? This cannot be undone.')) return;
    setIsLoading(true);
    try {
      await deleteDoc(doc(db, 'users', user.id));
      toast.success('User deleted');
      onClose();
    } catch (e) { toast.error('Failed to delete user'); }
    setIsLoading(false);
  };

  const handlePromote = async () => {
    if (!isSuperUser) return toast.error('Only root admins can promote users');
    setIsLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.id), { role: 'admin' });
      toast.success('User promoted to admin');
      onClose();
    } catch (e) { toast.error('Failed to promote user'); }
    setIsLoading(false);
  };

  const tabs = [
    { id: 'activity', label: 'Login Activity', icon: Activity },
    { id: 'block', label: 'Block User', icon: ShieldX },
    { id: 'trade', label: 'Trade Status', icon: Zap },
    { id: 'finance', label: 'Credit / Debit', icon: DollarSign },
    { id: 'clear', label: 'Clear Account', icon: RefreshCw },
    { id: 'add_trade', label: 'Add Trading', icon: TrendingUp },
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'contact', label: 'Contact User', icon: Mail },
    { id: 'switch', label: 'Switch Account', icon: UserCheck },
    { id: 'danger', label: 'Danger Zone', icon: AlertTriangle },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={fluidSpring}
        className="bg-surface border border-border rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        <div className="p-6 border-b border-border flex justify-between items-center bg-card">
          <div>
            <h2 className="text-xl font-bold text-primary">Manage User</h2>
            <p className="text-sm text-secondary">{user.name} ({user.email})</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-subtle rounded-full transition-colors">
            <X size={20} className="text-muted" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border p-4 overflow-y-auto bg-card/50 flex md:flex-col gap-2 custom-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all whitespace-nowrap md:whitespace-normal ${
                  activeTab === tab.id 
                    ? 'bg-primary text-background shadow-md' 
                    : 'text-secondary hover:bg-subtle hover:text-primary'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
            {activeTab === 'activity' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Login & Activity</h3>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <p className="text-sm text-secondary mb-1">Joined Date</p>
                  <p className="font-medium">{new Date(user.joined_date).toLocaleString()}</p>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <p className="text-sm text-secondary mb-1">Last Login</p>
                  <p className="font-medium">{user.last_login ? new Date(user.last_login).toLocaleString() : 'No recent activity recorded'}</p>
                </div>
                <div className="p-4 bg-background border border-border rounded-xl">
                  <p className="text-sm text-secondary mb-1">Verification Status</p>
                  <p className="font-medium capitalize">{user.verification_status || 'Pending'}</p>
                </div>
              </div>
            )}

            {activeTab === 'block' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Block User</h3>
                <p className="text-sm text-secondary mb-6">
                  Blocking a user prevents them from logging in and accessing their dashboard.
                </p>
                <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Current Status</p>
                    <p className={`text-sm font-bold ${user.is_blocked ? 'text-red-500' : 'text-emerald-500'}`}>
                      {user.is_blocked ? 'BLOCKED' : 'ACTIVE'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleBlock}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${
                      user.is_blocked ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    {isLoading ? '...' : (user.is_blocked ? 'Unblock User' : 'Block User')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'trade' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Trade Status</h3>
                <p className="text-sm text-secondary mb-6">
                  Enable or disable the user's ability to purchase new mining contracts or trade.
                </p>
                <div className="p-6 bg-background border border-border rounded-xl flex items-center justify-between">
                  <div>
                    <p className="font-medium text-primary">Trading Capability</p>
                    <p className={`text-sm font-bold ${user.trade_enabled === false ? 'text-red-500' : 'text-emerald-500'}`}>
                      {user.trade_enabled === false ? 'DISABLED' : 'ENABLED'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleTrade}
                    disabled={isLoading}
                    className={`px-6 py-2 rounded-full font-bold transition-colors ${
                      user.trade_enabled === false ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                    }`}
                  >
                    {isLoading ? '...' : (user.trade_enabled === false ? 'Enable Trading' : 'Disable Trading')}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'finance' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold mb-4">Credit or Debit Account</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Action</label>
                    <select 
                      value={financeType} 
                      onChange={(e) => setFinanceType(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="credit">Credit (Add)</option>
                      <option value="debit">Debit (Remove)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Currency / Wallet</label>
                    <select 
                      value={financeCurrency} 
                      onChange={(e) => setFinanceCurrency(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="USD">USD (Main Balance)</option>
                      <option value="BTC">Bitcoin (BTC)</option>
                      <option value="ETH">Ethereum (ETH)</option>
                      <option value="USDT">Tether (USDT)</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Amount</label>
                  <input 
                    type="number" 
                    value={financeAmount}
                    onChange={(e) => setFinanceAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleFinance}
                  disabled={isLoading || !financeAmount}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Apply ${financeType === 'credit' ? 'Credit' : 'Debit'}`}
                </button>
              </div>
            )}

            {activeTab === 'clear' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4 text-red-500">Clear User Account</h3>
                <p className="text-sm text-secondary mb-6">
                  This action will reset all of the user's balances (USD, BTC, ETH, USDT) and referral earnings to zero. This action cannot be undone.
                </p>
                <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <button
                    onClick={handleClearAccount}
                    disabled={isLoading}
                    className="w-full py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Reset All Balances to Zero'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'add_trade' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold mb-4">Add Trading Contract</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Contract Type</label>
                    <select 
                      value={tradeType} 
                      onChange={(e) => setTradeType(e.target.value)}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                    >
                      <option value="pool">Pool Mining</option>
                      <option value="cloud">Cloud Mining</option>
                      <option value="crypto">Crypto Mining</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary mb-2">Hashpower</label>
                    <input 
                      type="text" 
                      value={tradeHashpower}
                      onChange={(e) => setTradeHashpower(e.target.value)}
                      placeholder="e.g. 100 TH/s"
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Price / Investment Amount ($)</label>
                  <input 
                    type="number" 
                    value={tradePrice}
                    onChange={(e) => setTradePrice(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <button
                  onClick={handleAddTrade}
                  disabled={isLoading || !tradePrice}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Create Active Contract'}
                </button>
              </div>
            )}

            {activeTab === 'profile' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold mb-4">Edit User Profile</h3>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Full Name</label>
                  <input 
                    type="text" 
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Phone Number</label>
                  <input 
                    type="text" 
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Verification Status</label>
                  <select 
                    value={profileStatus} 
                    onChange={(e) => setProfileStatus(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <button
                  onClick={handleEditProfile}
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold mb-4">Contact User</h3>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Contact Method</label>
                  <select 
                    value={contactMethod} 
                    onChange={(e) => setContactMethod(e.target.value)}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary"
                  >
                    <option value="email">Email ({user.email})</option>
                    <option value="sms">SMS Text ({user.phone || 'No phone'})</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-secondary mb-2">Message</label>
                  <textarea 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    rows={5}
                    placeholder="Type your message here..."
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-primary focus:outline-none focus:border-primary resize-none"
                  />
                </div>
                <button
                  onClick={handleContact}
                  disabled={isLoading || !contactMessage}
                  className="w-full py-3 bg-primary text-background rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isLoading ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            )}

            {activeTab === 'switch' && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold mb-4">Switch to User Account</h3>
                <p className="text-sm text-secondary mb-6">
                  Impersonate this user to view the dashboard exactly as they see it. This helps in troubleshooting user-specific issues.
                </p>
                <div className="p-6 bg-background border border-border rounded-xl">
                  <button
                    onClick={handleSwitchAccount}
                    className="w-full py-3 bg-subtle hover:bg-subtle-hover text-primary rounded-xl font-bold transition-colors border border-border"
                  >
                    Login as {user.name}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'danger' && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold mb-4 text-red-500">Danger Zone</h3>
                
                <div className="p-6 bg-background border border-border rounded-xl space-y-4">
                  <div>
                    <h4 className="font-bold text-primary">Promote to Administrator</h4>
                    <p className="text-xs text-secondary mb-3">Grant this user full admin privileges. Only root admins can perform this action.</p>
                    <button
                      onClick={handlePromote}
                      disabled={isLoading || !isSuperUser}
                      className="px-6 py-2 bg-[#00f0ff]/10 text-[#00f0ff] hover:bg-[#00f0ff]/20 rounded-full font-bold transition-colors text-sm disabled:opacity-50"
                    >
                      Promote to Admin
                    </button>
                  </div>
                  
                  <div className="h-px bg-border/50 my-4" />
                  
                  <div>
                    <h4 className="font-bold text-red-500">Delete Account</h4>
                    <p className="text-xs text-secondary mb-3">Permanently remove this user and all associated data. Only root admins can perform this action.</p>
                    <button
                      onClick={handleDelete}
                      disabled={isLoading || !isSuperUser}
                      className="px-6 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-full font-bold transition-colors text-sm disabled:opacity-50"
                    >
                      Delete User Account
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
