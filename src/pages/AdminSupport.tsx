import { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Send, User as UserIcon, RefreshCw, CheckCircle2, Lock, ShieldCheck, Wallet, Sparkles } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, getDoc, increment } from 'firebase/firestore';
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
  balance?: number;
  verification_status?: string;
  role?: string;
  joined_date?: string;
}

export default function AdminSupport() {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserProfileData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'open' | 'closed'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Subscribe to all support chats sorted by last message time
  useEffect(() => {
    const q = query(collection(db, 'support_chats'), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess: SupportSession[] = [];
      snapshot.forEach((d) => {
        sess.push({ id: d.id, ...d.data() } as SupportSession);
      });
      setSessions(sess);
      
      // Auto-select first chat if none selected yet
      if (sess.length > 0 && !selectedSessionId) {
        setSelectedSessionId(sess[0].id);
      }
    });
    return () => unsubscribe();
  }, []);

  const currentSession = sessions.find(s => s.id === selectedSessionId) || null;

  // Fetch messages and user profile when selected session changes
  useEffect(() => {
    if (!selectedSessionId) {
      setMessages([]);
      setSelectedUserProfile(null);
      return;
    }

    // Mark messages as read by Admin
    updateDoc(doc(db, 'support_chats', selectedSessionId), { unreadCountAdmin: 0 }).catch(() => {});

    // Fetch user profile from Firestore
    getDoc(doc(db, 'users', selectedSessionId)).then((snap) => {
      if (snap.exists()) {
        setSelectedUserProfile(snap.data() as UserProfileData);
      } else {
        setSelectedUserProfile(null);
      }
    }).catch(() => {});

    // Subscribe to messages in real-time
    const q = query(
      collection(db, 'support_chats', selectedSessionId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach(d => {
        msgs.push({ id: d.id, ...d.data() } as ChatMessage);
      });
      setMessages(msgs);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [selectedSessionId]);

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

      await updateDoc(doc(db, 'support_chats', selectedSessionId), {
        lastMessage: textToSend,
        lastMessageTime: serverTimestamp(),
        unreadCountClient: increment(1),
        status: 'open'
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };
  
  const handleToggleStatus = async () => {
    if (!selectedSessionId || !currentSession) return;
    const newStatus = currentSession.status === 'open' ? 'closed' : 'open';
    try {
      await updateDoc(doc(db, 'support_chats', selectedSessionId), {
        status: newStatus
      });
      toast.success(newStatus === 'closed' ? "Ticket marked as closed." : "Ticket reopened.");
    } catch (e) {
      toast.error("Could not update ticket status.");
    }
  };

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.userEmail.toLowerCase().includes(search.toLowerCase()) || 
                          (s.lastMessage && s.lastMessage.toLowerCase().includes(search.toLowerCase()));
    if (!matchesSearch) return false;

    if (filter === 'unread') return s.unreadCountAdmin > 0;
    if (filter === 'open') return s.status === 'open';
    if (filter === 'closed') return s.status === 'closed';
    return true;
  });

  const quickResponses = [
    "Hello! How may I assist you with your PoolMining account today?",
    "Your deposit has been logged and is awaiting blockchain confirmation.",
    "Withdrawals are processed within 1 to 24 hours depending on network load.",
    "Please verify your identity documents under Settings -> KYC to raise limits."
  ];

  return (
    <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Support & Live Chat Admin</h1>
          <p className="text-secondary text-sm mt-1">Provide real-time client assistance and manage support tickets.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted font-medium bg-surface border border-border px-3 py-1.5 rounded-xl">
            Total Chats: {sessions.length}
          </span>
          <span className="text-xs text-emerald-500 font-medium bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>
      </div>
      
      <div className="flex-1 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl">
        {/* Sidebar - Chat List */}
        <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-border flex flex-col bg-card/40">
          {/* Search & Filters */}
          <div className="p-4 border-b border-border space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search by email or message..." 
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
                  className={`flex-1 py-1 rounded-lg font-medium capitalize transition-all ${
                    filter === tab ? 'bg-[#0052ff] text-white shadow-sm' : 'text-muted hover:text-primary'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
          
          {/* List of sessions */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-muted">
                <MessageSquare className="mx-auto mb-3 opacity-40" size={32} />
                <p className="text-sm font-medium">No support chats found.</p>
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                        session.status === 'open' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted/20 text-muted'
                      }`}>
                        {session.status === 'open' ? 'Open' : 'Closed'}
                      </span>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Main Area */}
        <div className="flex-1 flex flex-col bg-background relative h-[550px] md:h-auto">
          {currentSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center font-bold">
                    <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-base">{currentSession.userEmail}</h3>
                    <div className="flex items-center gap-3 text-xs text-secondary mt-0.5">
                      <span className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${currentSession.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`} />
                        {currentSession.status === 'open' ? 'Active Ticket' : 'Closed Ticket'}
                      </span>
                      {selectedUserProfile && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-emerald-500 font-semibold">
                            <Wallet size={12} /> ${selectedUserProfile.balance?.toLocaleString() ?? 0}
                          </span>
                          <span>•</span>
                          <span className="capitalize">{selectedUserProfile.verification_status || 'unverified'}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
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
                        <Lock size={14} /> Close Ticket
                      </>
                    ) : (
                      <>
                        <RefreshCw size={14} /> Reopen Ticket
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
                    <p className="text-sm">No messages in this conversation yet.</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[75%] p-3.5 rounded-2xl ${
                          isAdmin 
                            ? 'bg-[#0052ff] text-white rounded-tr-sm shadow-md' 
                            : 'bg-surface border border-border text-primary rounded-tl-sm shadow-sm'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                          <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-white/70' : 'text-muted'}`}>
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
                      className="whitespace-nowrap bg-surface border border-border/70 hover:border-[#0052ff] hover:bg-[#0052ff]/5 px-2.5 py-1 rounded-lg text-secondary hover:text-primary transition-all shrink-0"
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
              <p className="text-sm font-medium">Select a support chat session to view details and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

