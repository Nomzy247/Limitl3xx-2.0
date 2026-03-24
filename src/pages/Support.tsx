import React, { useState } from 'react';
import { motion } from 'motion/react';
import { MessageCircle, Mail, Phone, HelpCircle, Search, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Support() {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    { q: 'How do I start mining?', a: 'To start mining, simply create an account, deposit funds into your wallet, and purchase a mining contract from our "Buy Hashpower" section.' },
    { q: 'What are the withdrawal limits?', a: 'Minimum withdrawal is 0.001 BTC. There are no maximum limits for verified accounts.' },
    { q: 'Is my investment safe?', a: 'Yes, all investments are protected by our multi-signature security protocol and 100% insurance coverage.' },
    { q: 'How long do contracts last?', a: 'Mining contracts typically last for 12 months, but we also offer flexible short-term options.' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setMessage('');
      toast.success('Support ticket created! We will get back to you within 24 hours.');
    }, 1500);
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl text-center flex flex-col items-center"
        >
          <div className="p-4 bg-[#0052ff]/10 rounded-2xl mb-6">
            <MessageCircle className="text-[#0052ff]" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Live Chat</h3>
          <p className="text-secondary text-sm mb-6 leading-relaxed">Speak directly with our support agents in real-time.</p>
          <button className="w-full py-3 bg-[#0052ff] text-white rounded-full font-bold hover:bg-[#0052ff]/90 transition-colors">
            Start Chat
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl text-center flex flex-col items-center"
        >
          <div className="p-4 bg-emerald-500/10 rounded-2xl mb-6">
            <Mail className="text-emerald-500" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Email Support</h3>
          <p className="text-secondary text-sm mb-6 leading-relaxed">Send us a detailed message and we'll reply via email.</p>
          <button className="w-full py-3 bg-emerald-500 text-white rounded-full font-bold hover:bg-emerald-600 transition-colors">
            Send Email
          </button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl text-center flex flex-col items-center"
        >
          <div className="p-4 bg-purple-500/10 rounded-2xl mb-6">
            <Phone className="text-purple-500" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Phone Support</h3>
          <p className="text-secondary text-sm mb-6 leading-relaxed">Call our international support line for urgent matters.</p>
          <button className="w-full py-3 bg-purple-500 text-white rounded-full font-bold hover:bg-purple-600 transition-colors">
            Call Now
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle size={24} className="text-[#00f0ff]" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
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
                <select className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all">
                  <option>General Inquiry</option>
                  <option>Technical Issue</option>
                  <option>Billing & Payments</option>
                  <option>Account Security</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-2">Priority</label>
                <select className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all">
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
            <button 
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
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
