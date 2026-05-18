import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Send, Search, MessageSquare, AlertCircle, Phone, Mail, User as UserIcon } from 'lucide-react';
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

export default function AdminSupport() {
  const [sessions, setSessions] = useState<SupportSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<SupportSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'support_chats'), orderBy('lastMessageTime', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const sess: SupportSession[] = [];
      snapshot.forEach((d) => {
        sess.push({ id: d.id, ...d.data() } as SupportSession);
      });
      setSessions(sess);
      
      // Update selectedSession if it was changed
      if (selectedSession) {
        const updated = sess.find(s => s.id === selectedSession.id);
        if (updated) setSelectedSession(updated);
      }
    });
    return () => unsubscribe();
  }, [selectedSession?.id]);

  useEffect(() => {
    if (!selectedSession) return;
    
    // Mark messages as read by Admin
    if (selectedSession.unreadCountAdmin > 0) {
       updateDoc(doc(db, 'support_chats', selectedSession.id), { unreadCountAdmin: 0 }).catch(console.error);
    }

    const q = query(
      collection(db, 'support_chats', selectedSession.id, 'messages'),
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
  }, [selectedSession?.id]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSession) return;
    const text = input.trim();
    setInput('');

    try {
      await addDoc(collection(db, 'support_chats', selectedSession.id, 'messages'), {
        sender: 'admin',
        text,
        timestamp: serverTimestamp()
      });

      await updateDoc(doc(db, 'support_chats', selectedSession.id), {
        lastMessage: text,
        lastMessageTime: serverTimestamp(),
        unreadCountClient: increment(1)
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };
  
  const handleCloseTicket = async () => {
      if (!selectedSession) return;
      try {
          await updateDoc(doc(db, 'support_chats', selectedSession.id), {
              status: 'closed'
          });
          toast.success("Ticket closed.");
      } catch (e) {
          toast.error("Could not close ticket.");
      }
  }

  const filteredSessions = sessions.filter(s => s.userEmail.toLowerCase().includes(search.toLowerCase()) || s.lastMessage.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-24 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto h-screen flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Support & Live Chat</h1>
          <p className="text-secondary mt-2">Manage client queries and provide real-time assistance.</p>
        </div>
      </div>
      
      <div className="flex-1 bg-surface border border-border rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl">
        {/* Sidebar - Chat List */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-border flex flex-col bg-card/50">
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
              <input 
                type="text" 
                placeholder="Search chats..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filteredSessions.length === 0 ? (
              <div className="p-8 text-center text-muted">
                 <MessageSquare className="mx-auto mb-4 opacity-50" size={32} />
                 <p>No active support sessions.</p>
              </div>
            ) : (
                filteredSessions.map((session) => (
                  <button 
                    key={session.id}
                    onClick={() => setSelectedSession(session)}
                    className={`w-full text-left p-4 flex items-start gap-4 transition-colors border-b border-border/50
                      ${selectedSession?.id === session.id ? 'bg-[#0052ff]/10' : 'hover:bg-subtle'}
                      ${session.status === 'closed' ? 'opacity-60' : ''}
                    `}
                  >
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {session.userEmail.charAt(0).toUpperCase()}
                      </div>
                      {session.unreadCountAdmin > 0 && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-surface">
                          {session.unreadCountAdmin}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className="font-semibold text-sm truncate">{session.userEmail}</p>
                        <span className="text-[10px] text-muted whitespace-nowrap ml-2">
                          {formatFirebaseDate(session.lastMessageTime, { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-secondary truncate">{session.lastMessage || 'No messages yet'}</p>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-background relative h-[600px] md:h-auto">
          {selectedSession ? (
            <>
              {/* Chat Header */}
              <div className="p-4 bg-card border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                     <UserIcon size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold">{selectedSession.userEmail}</h3>
                    <p className="text-xs text-secondary flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${selectedSession.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-muted'}`}></span>
                        {selectedSession.status === 'open' ? 'Active Session' : 'Closed Session'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleCloseTicket} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-surface border border-border hover:bg-subtle transition-colors text-secondary">
                    Close Ticket
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted">
                        No messages in this conversation.
                    </div>
                ) : null}
                {messages.map((msg, idx) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={msg.id || idx} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] p-3 rounded-2xl ${
                        isAdmin 
                          ? 'bg-[#0052ff] text-white rounded-tr-sm shadow-md' 
                          : 'bg-surface border border-border text-primary rounded-tl-sm shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p className={`text-[10px] mt-1 text-right ${isAdmin ? 'text-white/70' : 'text-muted'}`}>
                           {formatFirebaseDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              {selectedSession.status === 'open' ? (
                  <div className="p-4 bg-card border-t border-border">
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
                        placeholder="Type a message to the client..."
                        className="flex-1 bg-surface border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all resize-none"
                      />
                      <button
                        onClick={handleSend}
                        disabled={!input.trim()}
                        className="bg-[#0052ff] text-white p-3 rounded-xl hover:bg-[#0052ff]/90 disabled:opacity-50 transition-colors shrink-0 shadow-lg shadow-[#0052ff]/20"
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    <p className="text-[10px] text-muted text-center mt-2">Press Enter to send, Shift+Enter for new line.</p>
                  </div>
              ) : (
                  <div className="p-4 bg-card border-t border-border text-center text-muted text-sm">
                      This ticket has been closed. Client cannot send more messages until reopening.
                  </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted">
              <MessageSquare size={48} className="mb-4 opacity-20" />
              <p>Select a chat session to view history and reply.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
