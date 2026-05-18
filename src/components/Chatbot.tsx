import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, User, Headset, Mic, Square } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, updateDoc, doc, addDoc, serverTimestamp, setDoc, getDoc, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from './SystemManager';
import { toast } from 'sonner';
import { formatFirebaseDate } from '../utils/date';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ id?: string, sender: 'user' | 'admin'; text: string }[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { user } = useAuth();
  
  // Audio state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

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

  const [unreadCount, setUnreadCount] = useState(0);

  // Read unread count on startup
  useEffect(() => {
     if (!user) return;
     const unsub = onSnapshot(doc(db, 'support_chats', user.uid), (doc) => {
         if (doc.exists()) {
             setUnreadCount(doc.data().unreadCountClient || 0);
         }
     });
     return () => unsub();
  }, [user]);

  // Sync messages
  useEffect(() => {
    if (!user || !isOpen) return;

    // Reset client unread
    updateDoc(doc(db, 'support_chats', user.uid), { unreadCountClient: 0 }).catch(() => {});

    const q = query(
      collection(db, 'support_chats', user.uid, 'messages'),
      orderBy('timestamp', 'asc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs: any[] = [];
      snapshot.forEach(d => {
        msgs.push({ id: d.id, ...d.data() });
      });
      setMessages(msgs);
      
      if (msgs.length > 0 && msgs[msgs.length-1].sender === 'admin' && isOpen) {
         updateDoc(doc(db, 'support_chats', user.uid), { unreadCountClient: 0 }).catch(() => {});
      }
    });

    return () => unsubscribe();
  }, [user, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;

    const userText = input.trim();
    setInput('');
    
    // Optimistic push
    // setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    
    try {
      const chatRef = doc(db, 'support_chats', user.uid);
      const chatDoc = await getDoc(chatRef);
      
      if (!chatDoc.exists()) {
         await setDoc(chatRef, {
             userEmail: user.email,
             lastMessage: userText,
             lastMessageTime: serverTimestamp(),
             unreadCountAdmin: 1,
             unreadCountClient: 0,
             status: 'open'
         });
      } else {
         await updateDoc(chatRef, {
             lastMessage: userText,
             lastMessageTime: serverTimestamp(),
             status: 'open',
             unreadCountAdmin: increment(1)
         });
      }
      
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), {
        sender: 'user',
        text: userText,
        timestamp: serverTimestamp()
      });
      
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message.');
    }
  };

  const startRecording = async () => {
    // Basic fallback for recording that just types a mock message if real STT is gone
    toast.error('Voice input requires AI integration which is disabled in Live Support Mode.');
  };

  const stopRecording = () => {
      // Stub
  };

  if (!user) return null; // Only show for logged in

  return (
    <>
      {/* Chat Toggle Button */}
      <motion.button
        className="fixed bottom-20 md:bottom-6 right-6 w-14 h-14 bg-primary text-background rounded-full shadow-lg flex items-center justify-center z-50 hover:scale-105 transition-transform"
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <MessageSquare size={24} />
        {unreadCount > 0 && !isOpen && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold border-2 border-surface animate-bounce">
                {unreadCount}
            </div>
        )}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={fluidSpring}
            className="fixed bottom-20 md:bottom-24 right-6 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col h-[500px] max-h-[80vh]"
          >
            {/* Header */}
            <div className="bg-primary text-background p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Headset size={20} />
                <h3 className="font-semibold">Live Support</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setIsOpen(false)} className="hover:bg-background/20 p-1 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.length === 0 && (
                  <div className="text-center text-muted text-sm mt-4">
                      How can we help you today? Send a message to speak to a representative.
                  </div>
              )}
              {messages.map((msg, idx) => (
                <div key={msg.id || idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.sender === 'user' ? 'bg-[#0052ff] text-white rounded-tr-sm shadow-md' : 'bg-surface border border-border text-primary rounded-tl-sm shadow-sm'}`}>
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    {msg.timestamp && (
                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-white/70' : 'text-muted'}`}>
                           {formatFirebaseDate(msg.timestamp, { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface border-t border-border">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={"Type your message..."}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim()}
                  className="bg-primary text-background p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity flex-shrink-0 shadow-md"
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
