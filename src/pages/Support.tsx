import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Phone, HelpCircle, Search, Send, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router';
import { fluidSpring } from '../components/SystemManager';
import DiscordIcon from '../components/DiscordIcon';
import { db } from '../firebase';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, serverTimestamp, increment } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

export default function Support() {
  const [subject, setSubject] = useState('General Inquiry');
  const [priority, setPriority] = useState('Medium');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    { q: 'How do I start mining?', a: 'To start mining, simply create an account, deposit funds into your wallet, and purchase a mining contract from our "Buy Hashpower" section.' },
    { q: 'What are the withdrawal limits?', a: 'Minimum withdrawal is 0.001 BTC. There are no maximum limits for verified accounts.' },
    { q: 'Is my investment safe?', a: 'Yes, all investments are protected by our multi-signature security protocol and 100% insurance coverage.' },
    { q: 'How long do contracts last?', a: 'Mining contracts typically last for 12 months, but we also offer flexible short-term options.' },
  ];

  const { user, userData } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !user) return;
    
    setIsSubmitting(true);
    try {
      const userEmail = user.email || userData?.email || 'client@poolmining.cloud';
      const ticketText = `[${priority.toUpperCase()} TICKET - ${subject}]\n${message.trim()}`;
      const chatRef = doc(db, 'support_chats', user.uid);
      
      await setDoc(chatRef, {
        userEmail,
        lastMessage: ticketText,
        lastMessageTime: serverTimestamp(),
        unreadCountAdmin: increment(1),
        unreadCountClient: 0,
        status: 'open'
      }, { merge: true });
      
      await addDoc(collection(db, 'support_chats', user.uid, 'messages'), {
        sender: 'user',
        text: ticketText,
        timestamp: serverTimestamp()
      });

      setMessage('');
      toast.success('Support ticket submitted! Opening Live Support...');
      window.dispatchEvent(new Event('open-chat'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to create ticket.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">How can we help you?</h1>
        <p className="text-secondary max-w-2xl mx-auto leading-relaxed">
          Our dedicated support team is available 24/7 to assist you with any questions or technical issues you may encounter.
        </p>
        <div className="mt-8 max-w-xl mx-auto relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
          <input 
            type="text" 
            placeholder="Search for help articles..."
            className="w-full pl-12 pr-4 py-4 bg-card border border-border rounded-full text-lg focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all shadow-xl"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={fluidSpring}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl text-center flex flex-col items-center justify-between"
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-[#0052ff]/10 rounded-2xl mb-4">
              <MessageCircle className="text-[#0052ff]" size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Live Chat</h3>
            <p className="text-secondary text-xs mb-6 leading-relaxed">Speak directly with our support agents in real-time.</p>
          </div>
          <motion.button 
            onClick={() => window.dispatchEvent(new Event('open-chat'))}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            className="w-full py-2.5 bg-[#0052ff] text-white rounded-full font-bold text-xs hover:bg-[#0052ff]/90 transition-colors"
          >
            Start Chat
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ ...fluidSpring, delay: 0.08 }}
          className="bg-card rounded-3xl p-6 border border-[#5865F2]/30 shadow-xl text-center flex flex-col items-center justify-between relative overflow-hidden"
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-[#5865F2]/10 rounded-2xl mb-4 text-[#5865F2]">
              <DiscordIcon size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Discord Group</h3>
            <p className="text-secondary text-xs mb-6 leading-relaxed">Join 14,000+ miners for live discussions and community help.</p>
          </div>
          <motion.a 
            href="https://discord.gg/p5XRG4bG8"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            className="w-full py-2.5 bg-[#5865F2] text-white rounded-full font-bold text-xs hover:bg-[#4752C4] transition-colors flex items-center justify-center gap-1.5"
          >
            <DiscordIcon size={14} /> Join Discord
          </motion.a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ ...fluidSpring, delay: 0.16 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl text-center flex flex-col items-center justify-between"
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-emerald-500/10 rounded-2xl mb-4">
              <Mail className="text-emerald-500" size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Email Support</h3>
            <p className="text-secondary text-xs mb-6 leading-relaxed">Send us a detailed message and we'll reply via email.</p>
          </div>
          <motion.a 
            href="mailto:poolmining@poolmining.cloud"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            className="w-full py-2.5 bg-emerald-500 text-white rounded-full font-bold text-xs hover:bg-emerald-600 transition-colors block text-center"
          >
            Send Email
          </motion.a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -5, scale: 1.02 }}
          transition={{ ...fluidSpring, delay: 0.24 }}
          className="bg-card rounded-3xl p-6 border border-border/50 shadow-xl text-center flex flex-col items-center justify-between"
        >
          <div className="flex flex-col items-center">
            <div className="p-4 bg-purple-500/10 rounded-2xl mb-4">
              <Phone className="text-purple-500" size={28} />
            </div>
            <h3 className="text-lg font-bold mb-2">Phone Support</h3>
            <p className="text-secondary text-xs mb-6 leading-relaxed">Call our international support line for urgent matters.</p>
          </div>
          <motion.a 
            href="tel:+18001234567"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={fluidSpring}
            className="w-full py-2.5 bg-purple-500 text-white rounded-full font-bold text-xs hover:bg-purple-600 transition-colors block text-center"
          >
            Call Now
          </motion.a>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <HelpCircle size={24} className="text-[#00f0ff]" />
              Frequently Asked Questions
            </h2>
            <Link 
              to="/faq" 
              className="text-xs font-bold text-[#0052ff] dark:text-[#00f0ff] hover:underline flex items-center gap-1"
            >
              <span>View All FAQs</span>
              <ExternalLink size={12} />
            </Link>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.02)' }}
                transition={{ ...fluidSpring, delay: i * 0.1 }}
                className="p-6 bg-card rounded-2xl border border-border/50 hover:border-border transition-all cursor-pointer group"
              >
                <h4 className="font-bold text-primary group-hover:text-[#0052ff] transition-colors mb-2">{faq.q}</h4>
                <p className="text-secondary text-sm leading-relaxed">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Send size={24} className="text-[#0052ff]" />
            Submit a Ticket
          </h2>
          <form onSubmit={handleSubmit} className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Subject</label>
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                >
                  <option>General Inquiry</option>
                  <option>Technical Issue</option>
                  <option>Billing & Payments</option>
                  <option>Account Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Priority</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Urgent</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-2">Message</label>
              <textarea 
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your issue in detail..."
                className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
              />
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={fluidSpring}
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#0052ff] text-white rounded-full font-bold hover:bg-[#0052ff]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={18} /> Submit Ticket
                </>
              )}
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
}
