import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X, Send, Bot, User, Trash2, Mic, Square } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { fluidSpring } from './SystemManager';
import { toast } from 'sonner';

// @ts-ignore
const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'dummy-key';
const ai = new GoogleGenAI({ apiKey });

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: 'Hello! I am your PoolMining.cloud AI assistant. How can I help you today?' },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('open-chat', handleOpenChat);
    return () => window.removeEventListener('open-chat', handleOpenChat);
  }, []);

  const handleClearHistory = () => {
    setMessages([{ role: 'model', text: 'Hello! I am your PoolMining.cloud AI assistant. How can I help you today?' }]);
    chatRef.current = null;
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    setMessages((prev) => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        chatRef.current = ai.chats.create({
          model: 'gemini-3.1-pro-preview',
          config: {
            systemInstruction: 'You are a helpful customer support AI for PoolMining.cloud, a cryptocurrency cloud mining and pool mining platform. Be concise, professional, and helpful. We have 4 main mining locations: Iceland, Texas, Kazakhstan, and Norway. We offer Cloud Mining, Pool Mining, and Crypto Mining features. Keep responses under 3 sentences if possible.',
          },
        });
      }

      const response = await chatRef.current.sendMessage({ message: userText });
      
      setMessages((prev) => [...prev, { role: 'model', text: response.text || 'I am sorry, I could not process that.' }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [...prev, { role: 'model', text: 'Sorry, I am having trouble connecting right now. Please try again later.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    setIsLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'Transcribe this audio accurately. Only output the transcription, nothing else.' },
                { inlineData: { data: base64data, mimeType: audioBlob.type } }
              ]
            }
          ]
        });
        
        const transcribedText = response.text?.trim() || '';
        if (transcribedText) {
          setInput(prev => prev + (prev ? ' ' : '') + transcribedText);
        }
        setIsLoading(false);
      };
    } catch (error) {
      console.error('Transcription error:', error);
      toast.error('Failed to transcribe audio');
      setIsLoading(false);
    }
  };

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
                <Bot size={20} />
                <h3 className="font-semibold">AI Support</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={handleClearHistory} className="hover:bg-background/20 p-1 rounded-full transition-colors" title="Clear History">
                  <Trash2 size={18} />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-background/20 p-1 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-background rounded-tr-sm' : 'bg-surface border border-border rounded-tl-sm'}`}>
                    <p className="text-sm">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-surface border border-border p-3 rounded-2xl rounded-tl-sm flex items-center gap-2">
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-2 h-2 bg-primary/50 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </div>
                </div>
              )}
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
                  placeholder={isRecording ? "Listening..." : "Type your message..."}
                  disabled={isRecording}
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors disabled:opacity-50"
                />
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2 rounded-full transition-colors ${isRecording ? 'bg-rose-500 text-white animate-pulse' : 'bg-surface border border-border text-muted hover:text-primary'}`}
                  title={isRecording ? "Stop Recording" : "Voice Input"}
                >
                  {isRecording ? <Square size={18} fill="currentColor" /> : <Mic size={18} />}
                </button>
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim() || isRecording}
                  className="bg-primary text-background p-2 rounded-full hover:opacity-90 disabled:opacity-50 transition-opacity"
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
