import { useState, useEffect, useRef } from 'react';
import { 
  Search, MessageSquare, Send, User as UserIcon, RefreshCw, CheckCircle2, 
  Lock, ShieldCheck, ShieldAlert, ShieldX, Wallet, Sparkles, Megaphone,
  Mail, Phone, Calendar, Award, DollarSign, ArrowUpRight, ArrowDownRight,
  Zap, Info, Check, Copy, ExternalLink, ChevronRight, Ban, CheckCircle, AlertTriangle, Radio
} from 'lucide-react';
import LiveActivityRadar from '../components/LiveActivityRadar';
import { db } from '../firebase';
import { 
  collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, 
  serverTimestamp, getDoc, setDoc, increment, getDocs, limit 
} from 'firebase/firestore';
import { toast } from 'sonner';
import { formatFirebaseDate } from '../utils/date';

interface ChatMessage {
  id: string;
  sender: 'user' | 'admin';
  text: string;
  timestamp: any;
}

interface SupportSession {
  id: string; // user id
  userEmail: string;
  lastMessage: string;
  lastMessageTime: any;
  unreadCountAdmin: number;
  unreadCountClient: number;
  status: 'open' | 'closed';
}

interface UserProfileData {
  name?: string;
  email?: string;
  phone?: string;
  balance?: number;
  balances?: {
    BTC?: number;
    ETH?: number;
    USDT?: number;
    SOL?: number;
  };
  verification_status?: 'pending' | 'verified' | 'rejected';
  role?: string;
  joined_date?: string;
  referral_code?: string;
  referred_by?: string;
  referral_count?: number;
  referral_earnings?: number;
  manual_profits?: number;
  level?: number;
  is_blocked?: boolean;
  trade_enabled?: boolean;
  last_login?: string;
}

interface UserTransaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  timestamp: any;
  tx_hash?: string;
}

export default function AdminSupport() {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const [userTransactions, setUserTransactions] = useState<UserTransaction[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'open' | 'closed'>('all');
  const [broadcastInput, setBroadcastInput] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [showRadarModal, setShowRadarModal] = useState(false);
  const [showClientDrawer, setShowClientDrawer] = useState(true);
  const [isUpdatingBalance, setIsUpdatingBalance] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentType, setAdjustmentType] = useState<'credit' | 'debit'>('credit');
  const [copiedId, setCopiedId] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Real-time listener for support chats & registered users
  useEffect(() => {
    let rawChats: Record<string, SupportSession> = {};
    let rawUsers: { id: string; email: string; name?: string }[] = [];

    const updateCombined = () => {
      const combinedMap = new Map<string, SupportSession>();

      // Add all existing support_chats
      Object.values(rawChats).forEach((chat) => {
        combinedMap.set(chat.id, chat);
      });

      // Add any registered user who does not have a support_chat doc yet
      rawUsers.forEach((u) => {
        if (!combinedMap.has(u.id)) {
          combinedMap.set(u.id, {
            id: u.id,
            userEmail: u.email || 'Client',
            lastMessage: 'Registered User - No conversation initiated yet',
            lastMessageTime: null,
            unreadCountAdmin: 0,
            unreadCountClient: 0,
            status: 'open'
          });
        }
      });

      const list = Array.from(combinedMap.values()).sort((a, b) => {
        const timeA = a.lastMessageTime?.seconds || 0;
        const timeB = b.lastMessageTime?.seconds || 0;
        return timeB - timeA;
      });

      setSessions(list);
      if (!selectedSessionId && list.length > 0) {
        setSelectedSessionId(list[0].id);
      }
    };

    const unsubChats = onSnapshot(collection(db, 'support_chats'), (snapshot) => {
      const map: Record<string, SupportSession> = {};
      snapshot.forEach((d) => {
        map[d.id] = { id: d.id, ...d.data() } as SupportSession;
      });
      rawChats = map;
      updateCombined();
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const uList: { id: string; email: string; name?: string }[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.role !== 'admin') {
          uList.push({ id: d.id, email: data.email, name: data.name });
        }
      });
      rawUsers = uList;
      updateCombined();
    });

    return () => {
      unsubChats();
      unsubUsers();
    };
  }, []);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || null;

  // Fetch messages, full user profile & recent transactions when selected session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      setSelectedUserProfile(null);
      setUserTransactions([]);
      return;
    }

    // Mark messages as read by Admin
    setDoc(doc(db, 'support_chats', selectedSessionId), { unreadCountAdmin: 0 }, { merge: true }).catch(() => {});

    // Fetch user profile from Firestore with real-time listener for live sync
    const unsubUser = onSnapshot(doc(db, 'users', selectedSessionId), (snap) => {
      if (snap.exists()) {
        setSelectedUserProfile(snap.data() as UserProfileData);
      } else {
        setSelectedUserProfile(null);
      }
    });

    // Fetch recent transactions for this client
    const txQuery = query(
      collection(db, 'transactions'),
      orderBy('timestamp', 'desc'),
      limit(25)
    );
    const unsubTx = onSnapshot(txQuery, (snap) => {
      const txs: UserTransaction[] = [];
      snap.forEach((d) => {
        const data = d.data();
        if (data.user_id === selectedSessionId || data.userId === selectedSessionId || data.email === currentSession?.userEmail) {
          txs.push({ id: d.id, ...data } as UserTransaction);
        }
      });
      setUserTransactions(txs);
    });

    // Subscribe to messages in real-time
    const q = query(
      collection(db, 'support_chats', selectedSessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubMessages = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(d => {
        msgs.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => {
      unsubUser();
      unsubTx();
      unsubMessages();
    };
  }, [selectedSessionId, currentSession?.userEmail]);

  const handleSend = async (customText?: string) => {
    const textToSend = (customText || input).trim();
    if (!textToSend || !selectedSessionId) return;
    if (!customText) setInput('');

    try {
      await addDoc(collection(db, 'support_chats', selectedSessionId, 'messages'), {
        sender: 'admin',
        text: textToSend,
        timestamp: serverTimestamp()
      });

      const userEmail = selectedUserProfile?.email || currentSession?.userEmail || 'client@poolmining.cloud';

      const chatUpdate: Record<string, any> = {
        lastMessage: textToSend,
        lastMessageTime: serverTimestamp(),
        unreadCountClient: increment(1),
        unreadCountAdmin: 0,
        status: 'open'
      };
      if (userEmail) {
        chatUpdate.userEmail = userEmail;
      }

      await setDoc(doc(db, 'support_chats', selectedSessionId), chatUpdate, { merge: true });
      toast.success('Support reply sent.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };

  const handleBroadcast = async () => {
    if (!broadcastInput.trim()) return;
    setIsBroadcasting(true);
    const textToBroadcast = `[ANNOUNCEMENT] ${broadcastInput.trim()}`;

    try {
      let count = 0;
      for (const sess of sessions) {
        await addDoc(collection(db, 'support_chats', sess.id, 'messages'), {
          sender: 'admin',
          text: textToBroadcast,
          timestamp: serverTimestamp()
        });

        const bcastEmail = sess.userEmail || 'client@poolmining.cloud';
        const bcastUpdate: Record<string, any> = {
          lastMessage: textToBroadcast,
          lastMessageTime: serverTimestamp(),
          unreadCountClient: increment(1),
          status: 'open'
        };
        if (bcastEmail) {
          bcastUpdate.userEmail = bcastEmail;
        }

        await setDoc(doc(db, 'support_chats', sess.id), bcastUpdate, { merge: true });
        count++;
      }

      toast.success(`Broadcast sent to ${count} client dashboards in real-time!`);
      setBroadcastInput('');
      setShowBroadcastModal(false);
    } catch (e) {
      console.error(e);
      toast.error('Broadcast failed for some clients.');
    } finally {
      setIsBroadcasting(false);
    }
  };
  
  const handleToggleStatus = async () => {
    if (!selectedSessionId || !currentSession) return;
    const newStatus = currentSession.status === 'open' ? 'closed' : 'open';
    try {
      await setDoc(doc(db, 'support_chats', selectedSessionId), {
        status: newStatus
      }, { merge: true });
      toast.success(newStatus === 'closed' ? "Ticket marked as closed." : "Ticket reopened.");
    } catch (e) {
      toast.error("Could not update ticket status.");
    }
  };

  const handleKYCUpdate = async (status: 'verified' | 'rejected' | 'pending') => {
    if (!selectedSessionId) return;
    try {
      await updateDoc(doc(db, 'users', selectedSessionId), {
        verification_status: status
      });
      toast.success(`Client verification status updated to ${status}.`);
    } catch (e) {
      toast.error("Failed to update verification status.");
    }
  };

  const handleToggleBlock = async () => {
    if (!selectedSessionId || !selectedUserProfile) return;
    const newBlockedState = !selectedUserProfile.is_blocked;
    try {
      await updateDoc(doc(db, 'users', selectedSessionId), {
        is_blocked: newBlockedState
      });
      toast.success(newBlockedState ? "Client account locked." : "Client account unlocked.");
    } catch (e) {
      toast.error("Failed to update account lock state.");
    }
  };

  const handleAdjustBalance = async () => {
    if (!selectedSessionId || !adjustmentAmount || isNaN(Number(adjustmentAmount))) {
      toast.error("Please enter a valid dollar amount");
      return;
    }
    const num = Number(adjustmentAmount);
    if (num <= 0) {
      toast.error("Amount must be greater than 0");
      return;
    }
    setIsUpdatingBalance(true);
    try {
      const delta = adjustmentType === 'credit' ? num : -num;
      await updateDoc(doc(db, 'users', selectedSessionId), {
        balance: increment(delta)
      });
      await addDoc(collection(db, 'transactions'), {
        user_id: selectedSessionId,
        type: adjustmentType === 'credit' ? 'admin_credit' : 'admin_debit',
        amount: num,
        currency: 'USD',
        status: 'approved',
        timestamp: serverTimestamp(),
        note: `Admin Live Support balance adjustment (${adjustmentType})`
      });
      toast.success(`Successfully ${adjustmentType === 'credit' ? 'credited' : 'debited'} $${num.toLocaleString()} for this client.`);
      setAdjustmentAmount('');
    } catch (e) {
      console.error(e);
      toast.error("Failed to adjust balance");
    } finally {
      setIsUpdatingBalance(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    toast.success('Copied Client UID to clipboard');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filteredSessions = sessions.filter(s => {
    const emailStr = (s.userEmail || '').toLowerCase();
    const searchStr = (search || '').toLowerCase();
    const msgStr = (s.lastMessage || '').toLowerCase();
    const matchesSearch = emailStr.includes(searchStr) || msgStr.includes(searchStr);
    if (!matchesSearch) return false;

    if (filter === 'unread') return s.unreadCountAdmin > 0;
    if (filter === 'open') return s.status === 'open';
    if (filter === 'closed') return s.status === 'closed';
    return true;
  });

  const quickResponses = [
    "Hello! How may I assist you with your PoolMining account today?",
    "Your deposit has been verified and credited to your available balance.",
    "Withdrawals are processed promptly within 1 to 24 hours.",
    "Please submit your KYC identification document under Settings -> Verification to increase your limits.",
    "Your active mining contracts are operating with 99.9% uptime across our European datacenters."
  ];

  return (
    <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto min-h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin Live Support & Client Operations</h1>
          <p className="text-secondary text-sm mt-1">Direct client communication, instant balance controls, and real-time account telemetry.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRadarModal(true)}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-card border border-border text-primary hover:border-[#0052ff] hover:bg-[#0052ff]/5 transition-all flex items-center gap-2"
          >
            <Radio size={15} className="text-emerald-500 animate-pulse" /> Live Activity Radar
          </button>
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="text-xs font-bold px-4 py-2.5 rounded-xl bg-[#0052ff] text-white hover:bg-[#0052ff]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#0052ff]/20"
          >
            <Megaphone size={15} /> Broadcast to All Clients
          </button>
          <span className="text-xs text-muted font-bold bg-surface border border-border px-3.5 py-2 rounded-xl">
            Total Clients: {sessions.length}
          </span>
          <span className="text-xs text-emerald-500 font-bold bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync Active
          </span>
        </div>
      </div>

      {/* Live Activity Radar Modal */}
      {showRadarModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl max-w-5xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-border flex items-center justify-between bg-card">
              <h3 className="font-extrabold text-base flex items-center gap-2 text-primary">
                <Radio className="text-emerald-500 animate-pulse" size={18} /> Live Visitor & Client Telemetry Radar
              </h3>
              <button
                onClick={() => setShowRadarModal(false)}
                className="text-muted hover:text-primary p-1.5 rounded-lg border border-border"
              >
                ✕ Close
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              <LiveActivityRadar />
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-surface border border-border rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg flex items-center gap-2 text-primary">
                <Megaphone className="text-[#0052ff]" size={20} /> Broadcast Announcement
              </h3>
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="text-muted hover:text-primary p-1 rounded-lg"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              This message will be dispatched instantly to <strong>all {sessions.length} registered client dashboards</strong>, popping open their live support modal with instant notification audio & real-time updates.
            </p>
            <textarea
              rows={4}
              value={broadcastInput}
              onChange={(e) => setBroadcastInput(e.target.value)}
              placeholder="Type announcement message (e.g. Scheduled pool optimization completed / Weekend hash bonus active!)..."
              className="w-full bg-background border border-border rounded-2xl p-3.5 text-sm focus:outline-none focus:border-[#0052ff] transition-all"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBroadcastModal(false)}
                className="px-4 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-subtle transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleBroadcast}
                disabled={!broadcastInput.trim() || isBroadcasting}
                className="px-5 py-2 rounded-xl bg-[#0052ff] text-white text-xs font-bold hover:bg-[#0052ff]/90 disabled:opacity-40 transition-colors flex items-center gap-2"
              >
                {isBroadcasting ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
                Send Broadcast
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 3-Column Main Workspace */}
      <div className="flex-1 bg-surface border border-border rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 shadow-2xl min-h-[680px]">
        {/* Column 1: Client Inbox List (3 Cols) */}
        <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-card/40">
          {/* Search & Filters */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search email or message..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-[#0052ff] transition-all"
              />
            </div>
            {/* Filter Tabs */}
            <div className="flex gap-1 bg-background p-1 rounded-xl border border-border text-xs">
              {(['all', 'unread', 'open', 'closed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`flex-1 py-1 rounded-lg font-bold capitalize transition-all ${
                    filter === tab ? 'bg-[#0052ff] text-white shadow-sm' : 'text-muted hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* List of sessions */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 max-h-[600px] lg:max-h-[calc(100vh-280px)]">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <MessageSquare className="mx-auto mb-3 opacity-40" size={32} />
                <p className="text-sm font-medium">No clients found matching filter.</p>
              </div>
            ) : (
              filteredSessions.map((session) => (
                <button 
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`w-full text-left p-4 flex items-start gap-3.5 transition-colors
                    ${selectedSessionId === session.id ? 'bg-[#0052ff]/10 border-l-4 border-l-[#0052ff]' : 'hover:bg-subtle'}
                    ${session.status === 'closed' ? 'opacity-65' : ''}
                  `}
                >
                  <div className="relative shrink-0">
                    <div className="w-10 h-10 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center font-bold text-sm">
                      {session.userEmail ? session.userEmail.charAt(0).toUpperCase() : 'C'}
                    </div>
                    {session.unreadCountAdmin > 0 && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-surface">
                        {session.unreadCountAdmin}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <p className="font-bold text-sm truncate">{session.userEmail || 'Client'}</p>
                      <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                        {formatFirebaseDate(session.lastMessageTime, { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-secondary truncate">{session.lastMessage || 'No messages yet'}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        session.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/20 text-muted'
                      }`}>
                        {session.status === 'open' ? 'Open Ticket' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Column 2: Live Chat Dialogue (5 or 6 Cols) */}
        <div className={`border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-background relative h-[550px] lg:h-auto ${showClientDrawer ? 'lg:col-span-5' : 'lg:col-span-9'}`}>
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center font-bold">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-extrabold text-base text-primary">{currentSession.userEmail}</h3>
                      <button 
                        onClick={() => copyToClipboard(currentSession.id)}
                        title="Copy Client UID"
                        className="text-muted hover:text-primary transition-colors text-xs flex items-center gap-1 bg-surface px-2 py-0.5 rounded border border-border"
                      >
                        {copiedId ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                        <span className="font-mono text-[10px]">{currentSession.id.slice(0, 8)}...</span>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-secondary mt-1">
                      <span className="flex items-center gap-1 font-semibold">
                        <span className={`w-2 h-2 rounded-full ${currentSession.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                        {currentSession.status === 'open' ? 'Active Ticket' : 'Closed Ticket'}
                      </span>
                      {selectedUserProfile && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-500 font-bold">
                            <Wallet size={12} /> ${(selectedUserProfile.balance || 0).toLocaleString()} USD
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowClientDrawer(!showClientDrawer)}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                      showClientDrawer ? 'bg-[#0052ff]/10 border-[#0052ff]/30 text-[#0052ff]' : 'bg-surface border-border text-secondary hover:text-primary'
                    }`}
                  >
                    <Info size={14} /> {showClientDrawer ? 'Hide Details' : 'View Details'}
                  </button>
                  <button 
                    onClick={handleToggleStatus} 
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                      currentSession.status === 'open' 
                        ? 'bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/20' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/20'
                    }`}
                  >
                    {currentSession.status === 'open' ? (
                      <>
                        <Lock size={14} /> Close
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} /> Reopen
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted">
                    <MessageSquare size={36} className="mb-2 opacity-30" />
                    <p className="text-sm font-medium">No messages in this ticket yet. Send a message to initiate contact.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-3.5 rounded-2xl ${
                          isAdmin 
                            ? 'bg-[#0052ff] text-white rounded-tr-sm shadow-md' 
                            : 'bg-surface border border-border text-primary rounded-tl-sm shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1.5 text-right ${isAdmin ? 'text-white/70' : 'text-muted'}`}>
                            {formatFirebaseDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Responses & Chat Input */}
              <div className="p-4 bg-card border-t border-border space-y-3">
                {/* Quick reply chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
                  <Sparkles size={14} className="text-[#0052ff] shrink-0" />
                  {quickResponses.map((qr, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(qr)}
                      className="whitespace-nowrap bg-surface border border-border/70 hover:border-[#0052ff] hover:bg-[#0052ff]/5 px-2.5 py-1 rounded-lg text-secondary hover:text-primary transition-all shrink-0 font-medium"
                    >
                      {qr.length > 35 ? `${qr.slice(0, 35)}...` : qr}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <textarea
                    rows={1}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type your response to the client (Press Enter to send)..."
                    className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0052ff] transition-all resize-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSend()}
                    disabled={!input.trim()}
                    className="bg-[#0052ff] text-white p-3 rounded-xl hover:bg-[#0052ff]/90 disabled:opacity-40 transition-colors shrink-0 shadow-lg shadow-[#0052ff]/20"
                  >
                    <Send size={20} />
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageSquare size={48} className="mb-4 opacity-20 text-[#0052ff]" />
              <p className="text-sm font-medium">Select a client chat session from the left list.</p>
            </div>
          )}
        </div>

        {/* Column 3: Live Client Details & Telemetry (4 Cols) */}
        {showClientDrawer && (
          <div className="lg:col-span-4 bg-card/60 flex flex-col overflow-y-auto max-h-[600px] lg:max-h-[calc(100vh-220px)] divide-y divide-border/60">
            {selectedUserProfile ? (
              <>
                {/* Client Profile Header */}
                <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted">Client Overview</span>
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-extrabold capitalize ${
                      selectedUserProfile.verification_status === 'verified' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                      selectedUserProfile.verification_status === 'rejected' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' :
                      'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                    }`}>
                      KYC: {selectedUserProfile.verification_status || 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#0052ff]/10 text-[#0052ff] font-extrabold flex items-center justify-center text-lg shadow-inner">
                      {selectedUserProfile.name ? selectedUserProfile.name.charAt(0).toUpperCase() : selectedUserProfile.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-extrabold text-base truncate text-primary">{selectedUserProfile.name || 'Anonymous Client'}</h4>
                      <p className="text-xs text-secondary truncate">{selectedUserProfile.email}</p>
                      {selectedUserProfile.phone && (
                        <p className="text-xs text-muted flex items-center gap-1 mt-0.5">
                          <Phone size={11} /> {selectedUserProfile.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Financial Balance Summary Card */}
                  <div className="bg-surface border border-border rounded-2xl p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs text-secondary font-semibold">
                      <span>Total Account Balance</span>
                      <span className="text-[#0052ff] font-bold">Tier {selectedUserProfile.level || 1} VIP</span>
                    </div>
                    <div className="text-2xl font-black text-primary flex items-baseline gap-1">
                      ${(selectedUserProfile.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      <span className="text-xs text-emerald-500 font-bold ml-1">USD</span>
                    </div>

                    {selectedUserProfile.balances && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 text-[11px]">
                        <div className="flex justify-between">
                          <span className="text-muted">BTC:</span>
                          <span className="font-mono font-bold text-amber-500">{selectedUserProfile.balances.BTC || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">ETH:</span>
                          <span className="font-mono font-bold text-blue-400">{selectedUserProfile.balances.ETH || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">USDT:</span>
                          <span className="font-mono font-bold text-emerald-400">{selectedUserProfile.balances.USDT || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted">SOL:</span>
                          <span className="font-mono font-bold text-purple-400">{selectedUserProfile.balances.SOL || 0}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Account Details & Metadata */}
                <div className="p-5 space-y-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted">Account Telemetry</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-secondary flex items-center gap-1.5"><Calendar size={13} /> Joined Date</span>
                      <span className="font-bold text-primary">{selectedUserProfile.joined_date || 'Recent'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-secondary flex items-center gap-1.5"><Award size={13} /> Referral Code</span>
                      <span className="font-mono font-bold text-[#0052ff]">{selectedUserProfile.referral_code || 'None'}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-border/40">
                      <span className="text-secondary flex items-center gap-1.5"><DollarSign size={13} /> Referral Earnings</span>
                      <span className="font-bold text-emerald-500">${(selectedUserProfile.referral_earnings || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-secondary flex items-center gap-1.5"><Zap size={13} /> Account Status</span>
                      <span className={`font-bold ${selectedUserProfile.is_blocked ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {selectedUserProfile.is_blocked ? 'Locked / Suspended' : 'Active & Trading'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Instant Administrative Controls */}
                <div className="p-5 space-y-4">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-muted">Direct Administrative Actions</span>

                  {/* KYC Toggle */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-secondary">Set KYC Verification</label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        onClick={() => handleKYCUpdate('verified')}
                        className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                          selectedUserProfile.verification_status === 'verified'
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                            : 'bg-surface border-border text-emerald-500 hover:bg-emerald-500/10'
                        }`}
                      >
                        <ShieldCheck size={13} /> Verify
                      </button>
                      <button
                        onClick={() => handleKYCUpdate('pending')}
                        className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                          selectedUserProfile.verification_status === 'pending'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                            : 'bg-surface border-border text-amber-500 hover:bg-amber-500/10'
                        }`}
                      >
                        <ShieldAlert size={13} /> Pending
                      </button>
                      <button
                        onClick={() => handleKYCUpdate('rejected')}
                        className={`py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors ${
                          selectedUserProfile.verification_status === 'rejected'
                            ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                            : 'bg-surface border-border text-rose-500 hover:bg-rose-500/10'
                        }`}
                      >
                        <ShieldX size={13} /> Reject
                      </button>
                    </div>
                  </div>

                  {/* Balance Adjustment Widget */}
                  <div className="bg-surface border border-border rounded-2xl p-3.5 space-y-2.5">
                    <label className="text-xs font-bold text-secondary flex items-center justify-between">
                      <span>Live Balance Adjustment</span>
                      <span className="text-[10px] text-muted">USD Credit/Debit</span>
                    </label>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setAdjustmentType('credit')}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          adjustmentType === 'credit' ? 'bg-emerald-500 text-white shadow-sm' : 'bg-card border border-border text-secondary'
                        }`}
                      >
                        + Credit (Add)
                      </button>
                      <button
                        onClick={() => setAdjustmentType('debit')}
                        className={`flex-1 py-1 rounded-lg text-xs font-bold transition-all ${
                          adjustmentType === 'debit' ? 'bg-rose-500 text-white shadow-sm' : 'bg-card border border-border text-secondary'
                        }`}
                      >
                        - Debit (Deduct)
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Amount ($)"
                        value={adjustmentAmount}
                        onChange={(e) => setAdjustmentAmount(e.target.value)}
                        className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-[#0052ff]"
                      />
                      <button
                        onClick={handleAdjustBalance}
                        disabled={isUpdatingBalance || !adjustmentAmount}
                        className="px-3 py-1.5 rounded-xl bg-[#0052ff] text-white text-xs font-bold hover:bg-[#0052ff]/90 disabled:opacity-40 transition-colors shrink-0 flex items-center gap-1"
                      >
                        {isUpdatingBalance ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                        Apply
                      </button>
                    </div>
                  </div>

                  {/* Account Lock Toggle */}
                  <button
                    onClick={handleToggleBlock}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center justify-center gap-2 ${
                      selectedUserProfile.is_blocked
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/20'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-500 hover:bg-rose-500/20'
                    }`}
                  >
                    {selectedUserProfile.is_blocked ? (
                      <>
                        <CheckCircle size={14} /> Unlock Client Account
                      </>
                    ) : (
                      <>
                        <Ban size={14} /> Lock & Suspend Account
                      </>
                    )}
                  </button>
                </div>

                {/* Client Transaction History */}
                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-muted">Recent Transactions</span>
                    <span className="text-[11px] text-muted font-bold">{userTransactions.length} Total</span>
                  </div>

                  {userTransactions.length === 0 ? (
                    <div className="p-4 bg-surface rounded-xl border border-border text-center text-xs text-muted">
                      No deposits or withdrawals logged yet for this client.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {userTransactions.slice(0, 6).map((tx) => (
                        <div key={tx.id} className="p-2.5 bg-surface border border-border rounded-xl text-xs flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className={`p-1.5 rounded-lg ${
                              tx.type?.includes('deposit') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                            }`}>
                              {tx.type?.includes('deposit') ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                            </div>
                            <div>
                              <p className="font-bold text-primary capitalize">{tx.type?.replace('_', ' ') || 'Transaction'}</p>
                              <p className="text-[10px] text-muted">{formatFirebaseDate(tx.timestamp, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-mono font-bold text-primary">{tx.amount} {tx.currency || 'USD'}</p>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                              tx.status === 'approved' || tx.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-500' :
                              tx.status === 'rejected' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
                            }`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="p-8 text-center text-muted">
                <UserIcon className="mx-auto mb-2 opacity-30" size={36} />
                <p className="text-xs font-semibold">Select a client session to inspect live profile telemetry.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
