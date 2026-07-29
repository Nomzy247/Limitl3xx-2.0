import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Headset, Mic, MicOff, Sparkles, Circle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, addDoc, serverTimestamp, setDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { toast } from 'sonner';
import { formatFirebaseDate } from '../utils/date';

// Sound chime function for incoming support messages
function playNotificationChime() {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.3);

    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
    gain2.gain.setValueAtTime(0.15, ctx.currentTime + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.5);
  } catch (e) {
    // Ignore audio errors if blocked by browser policy
  }
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id?: string, sender: 'user' | 'admin'; text: string; timestamp?: any }[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const isInitialLoadRef = useRef(true);
  
  const { user, userData } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  // Continuous real-time messages listener for user's support chat
  useEffect(() => {
    if (!user) return;
    isInitialLoadRef.current = true;

    const q = query(
      collection(db, 'support_chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      let hasNewAdminMsg = false;
      let lastAdminText = '';

      snapshot.forEach((d) => {
        msgs.push({ id: d.id, ...d.data() });
      });

      if (!isInitialLoadRef.current) {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            const data = change.doc.data();
            if (data.sender === 'admin') {
              hasNewAdminMsg = true;
              lastAdminText = data.text;
            }
          }
        });
      } else {
        isInitialLoadRef.current = false;
      }

      setMessages(msgs);

      if (hasNewAdminMsg) {
        setIsOpen(true);
        playNotificationChime();
        toast.info('💬 New message from Support', {
          description: lastAdminText.slice(0, 80) + (lastAdminText.length > 80 ? '...' : ''),
          duration: 4000
        });
      }
    });

    return () => unsubscribe();
  }, [user]);

  // Read unread count on startup & auto pop-out on admin updates
  useEffect(() => {
     if (!user) return;
     const unsub = onSnapshot(doc(db, 'support_chats', user.uid), (snapshot) => {
         if (snapshot.exists()) {
             const unread = snapshot.data().unreadCountClient || 0;
             setUnreadCount(unread);
             if (unread > 0) {
               setIsOpen(true);
               playNotificationChime();
             }
         }
     });
     return () => unsub();
  }, [user]);

  // Reset client unread when chat drawer is opened
  useEffect(() => {
    if (!user || !isOpen) return;
    setDoc(doc(db, 'support_chats', user.uid), { unreadCountClient: 0 }, { merge: true }).catch(() => {});
  }, [user, isOpen]);

  const sendTextMessage = async (textToSend: string) => {
    if (!textToSend.trim() || !user) return;

    const userEmail = user.email || userData?.email || 'client@poolmining.cloud';
    const chatRef = doc(db, 'support_chats', user.uid);
    
    try {
      await setDoc(chatRef, {
        userEmail,
        lastMessage: textToSend,
        lastMessageTime: serverTimestamp(),
        unreadCountAdmin: increment(1),
        unreadCountClient: 0,
        status: 'open'
      }, { merge: true });
      
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), {
        sender: 'user',
        text: textToSend,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message.');
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setInput('');
    sendTextMessage(userText);
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported by your browser.');
      return;
    }

    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => {
        setIsRecording(false);
        toast.error('Voice input cancelled or failed.');
      };
      recognition.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        if (transcript) {
          setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      setIsRecording(false);
      toast.error('Could not start microphone.');
    }
  };

  if (!user) return null;

  const quickPrompts = [
    'How do I deposit funds?',
    'Withdrawal processing time?',
    'What mining plans are available?'
  ];

  return (
    <>
      {/* Floating Chat Toggle Button */}
      <motion.button
        id="live-chat-toggle-btn"
        className="fixed bottom-28 md:bottom-10 right-6 w-14 h-14 bg-[#0052ff] text-white rounded-full shadow-2xl flex items-center justify-center z-[60] hover:scale-105 transition-transform"
        onClick={() => setIsOpen(!isOpen)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Open Live Support Chat"
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && !isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-surface animate-bounce">
                {unreadCount}
            </div>
        )}
      </motion.button>

      {/* Chat Drawer / Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="live-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={fluidSpring}
            className="fixed bottom-28 md:bottom-24 right-4 sm:right-6 w-[calc(100vw-2rem)] sm:w-96 bg-surface border border-border rounded-3xl shadow-2xl z-[65] overflow-hidden flex flex-col h-[520px] max-h-[75vh]"
          >
            {/* Header */}
            <div className="bg-[#0052ff] text-white p-4 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                  <Headset size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm flex items-center gap-1.5">
                    Live Support
                    <Circle size={8} className="fill-emerald-400 text-emerald-400 animate-pulse" />
                  </h3>
                  <p className="text-[11px] text-white/80">Support Agents Online 24/7</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-white/20 p-1.5 rounded-full transition-colors text-white"
                aria-label="Close Chat"
              >
                <X size={18} />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.length === 0 ? (
                <div className="text-center py-6 px-4">
                  <div className="w-12 h-12 rounded-full bg-[#0052ff]/10 text-[#0052ff] flex items-center justify-center mx-auto mb-3">
                    <Sparkles size={24} />
                  </div>
                  <h4 className="font-bold text-sm mb-1">Welcome to PoolMining Support</h4>
                  <p className="text-xs text-muted mb-4">
                    Send us a message below or tap a quick topic to speak with a specialist.
                  </p>
                  <div className="space-y-2">
                    {quickPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendTextMessage(prompt)}
                        className="w-full text-left p-2.5 rounded-xl bg-surface border border-border/60 hover:border-[#0052ff] text-xs text-primary transition-all hover:bg-[#0052ff]/5"
                      >
                        💬 {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div key={msg.id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[82%] p-3 rounded-2xl text-sm ${
                        isUser 
                          ? 'bg-[#0052ff] text-white rounded-tr-sm shadow-md' 
                          : 'bg-surface border border-border text-primary rounded-tl-sm shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                        {msg.timestamp && (
                          <p className={`text-[10px] mt-1 text-right ${isUser ? 'text-white/70' : 'text-muted'}`}>
                            {formatFirebaseDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-surface border-t border-border">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`p-2 rounded-xl border transition-colors ${
                    isRecording 
                      ? 'bg-rose-500 text-white border-rose-600 animate-pulse' 
                      : 'bg-background border-border text-muted hover:text-primary'
                  }`}
                  title="Voice input"
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isRecording ? "Listening..." : "Type your message..."}
                  className="flex-1 bg-background border border-border rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-[#0052ff] transition-colors"
                />
                
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-[#0052ff] text-white p-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition-opacity shrink-0 shadow-md shadow-[#0052ff]/20"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

