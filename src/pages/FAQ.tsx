import { motion } from 'motion/react';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: "What is PoolMining?",
    answer: "PoolMining is a cloud-based cryptocurrency mining platform that allows users to participate in mining without the need to purchase or maintain expensive hardware."
  },
  {
    question: "How do I start mining?",
    answer: "Simply create an account, deposit funds, and purchase a hashpower contract. Your mining will begin automatically and yields will be credited to your account daily."
  },
  {
    question: "What are the fees involved?",
    answer: "We charge a small maintenance fee which covers electricity and hardware upkeep. This is automatically deducted from your daily mining yields."
  },
  {
    question: "How can I withdraw my earnings?",
    answer: "You can withdraw your earnings at any time once you reach the minimum withdrawal threshold. Withdrawals are processed within 24 hours to your designated crypto wallet."
  },
  {
    question: "Is my investment secure?",
    answer: "Yes, we employ institutional-grade security measures including cold storage for funds, regular security audits, and comprehensive insurance coverage for our mining facilities."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight text-primary"
          >
            Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">Questions</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-secondary"
          >
            Find answers to common questions about our platform, mining process, and security.
          </motion.p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="border border-border rounded-2xl bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
              >
                <span className="text-lg font-semibold text-primary">{faq.question}</span>
                <ChevronDown 
                  className={`text-secondary transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} 
                  size={24} 
                />
              </button>
              <motion.div
                initial={false}
                animate={{ height: openIndex === index ? 'auto' : 0, opacity: openIndex === index ? 1 : 0 }}
                className="overflow-hidden"
              >
                <div className="p-6 pt-0 text-secondary leading-relaxed">
                  {faq.answer}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
