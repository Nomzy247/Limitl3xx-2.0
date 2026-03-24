import { motion } from 'motion/react';
import { Hexagon, Users, Globe, Shield, Zap, Target, Lightbulb, Heart } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const sections = [
  {
    title: "Our Vision",
    icon: <Target className="text-[#0052ff]" size={40} />,
    description: "We envision a world where anyone, regardless of technical expertise or capital, can actively participate in and benefit from the decentralized economy. By breaking down the barriers to entry, we aim to be the global leader in accessible crypto mining."
  },
  {
    title: "Our Mission",
    icon: <Lightbulb className="text-[#00f0ff]" size={40} />,
    description: "Founded in 2023, PoolMining was built on the belief that the future of finance should be decentralized and accessible. Our platform bridges this gap by offering cloud-based mining solutions powered by renewable energy and state-of-the-art ASIC hardware."
  },
  {
    title: "Our Values",
    icon: <Heart className="text-emerald-400" size={40} />,
    description: "Transparency, sustainability, and security are at the core of everything we do. We are committed to providing our users with the most competitive, transparent, and secure mining yields in the industry while prioritizing environmental responsibility."
  }
];

export default function About() {
  return (
    <div className="min-h-screen bg-background pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-24">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight text-primary"
          >
            About <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0052ff] to-[#00f0ff]">PoolMining</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-secondary"
          >
            Democratizing access to institutional-grade cryptocurrency mining, making it accessible, profitable, and secure for everyone.
          </motion.p>
        </div>

        {/* Vision, Mission, Values Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {sections.map((section, i) => (
            <ScrollReveal key={i}>
              <motion.div
                whileHover={{ y: -10 }}
                className="bg-card border border-border p-8 rounded-3xl h-full"
              >
                <div className="mb-6">{section.icon}</div>
                <h3 className="text-2xl font-bold text-primary mb-4">{section.title}</h3>
                <p className="text-secondary leading-relaxed">{section.description}</p>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Stats Section */}
        <ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-24 bg-surface p-12 rounded-3xl border border-border">
            {[
              { icon: <Users size={32} />, title: "100k+", desc: "Active Miners" },
              { icon: <Globe size={32} />, title: "15+", desc: "Global Data Centers" },
              { icon: <Shield size={32} />, title: "100%", desc: "Secure & Insured" },
              { icon: <Zap size={32} />, title: "99.9%", desc: "Uptime Guarantee" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 mx-auto bg-card rounded-full flex items-center justify-center text-[#00f0ff] mb-4">
                  {stat.icon}
                </div>
                <h3 className="text-3xl font-bold text-primary mb-2">{stat.title}</h3>
                <p className="text-secondary">{stat.desc}</p>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Final CTA Section */}
        <ScrollReveal>
          <div className="text-center bg-gradient-to-r from-[#0052ff]/10 to-[#00f0ff]/10 border border-[#00f0ff]/30 p-16 rounded-3xl">
            <h2 className="text-4xl font-bold text-primary mb-6">Ready to start mining?</h2>
            <p className="text-xl text-secondary mb-8 max-w-2xl mx-auto">Join thousands of miners already maximizing their returns with PoolMining.cloud.</p>
            <button className="px-8 py-4 rounded-full font-bold bg-[#0052ff] hover:bg-[#0052ff]/90 text-white transition-all shadow-lg shadow-[#0052ff]/25">
              Get Started Now
            </button>
          </div>
        </ScrollReveal>
      </div>
    </div>
  );
}
