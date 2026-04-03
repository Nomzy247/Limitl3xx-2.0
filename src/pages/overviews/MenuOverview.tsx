import React from 'react';
import { motion } from 'motion/react';
import { LayoutGrid, Users, Headphones, Settings, User, Share2, Shield, HelpCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import { fluidSpring } from '../../components/SystemManager';

export default function MenuOverview() {
  const menuFeatures = [
    {
      icon: <Users className="text-pink-400" size={28} />,
      title: "Referral Program",
      description: "Invite friends and earn up to 15% commission on their mining activities."
    },
    {
      icon: <Headphones className="text-sky-400" size={28} />,
      title: "24/7 Support",
      description: "Our dedicated team is always here to help you with any questions or issues."
    },
    {
      icon: <Settings className="text-slate-400" size={28} />,
      title: "Advanced Settings",
      description: "Customize your mining experience and security preferences with ease."
    },
    {
      icon: <User className="text-emerald-400" size={28} />,
      title: "Profile Management",
      description: "Keep your personal information and security settings up to date."
    }
  ];

  return (
    <div className="min-h-screen pt-32 pb-20 px-6 bg-[#0a0f1d] overflow-hidden relative">
      {/* Background Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-[120px] -z-10" />

      <div className="max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-500/10 border border-pink-500/20 text-pink-400 text-sm font-medium mb-6">
            <LayoutGrid size={16} />
            <span>The Complete Ecosystem</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-8 tracking-tight">
            Everything You Need <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-sky-400">
              In One Place
            </span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            From referral rewards to world-class support, our ecosystem is designed to help you succeed in the world of cloud mining.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          {menuFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...fluidSpring, delay: index * 0.1 }}
              className="p-10 rounded-3xl bg-white/5 border border-white/10 hover:border-pink-500/30 transition-all group flex flex-col sm:flex-row gap-8 items-start sm:items-center"
            >
              <div className="p-6 rounded-2xl bg-white/5 group-hover:bg-pink-500/10 transition-colors shrink-0">
                {feature.icon}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...fluidSpring, delay: 0.4 }}
          className="relative p-12 rounded-[40px] bg-gradient-to-br from-pink-500/20 to-sky-500/20 border border-white/10 overflow-hidden text-center"
        >
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.1),transparent)]" />
          
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6 relative z-10">
            Join the community today
          </h2>
          <p className="text-lg text-slate-300 mb-10 max-w-xl mx-auto relative z-10">
            Unlock all features and start building your mining empire with our comprehensive set of tools and services.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link 
              to="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-pink-500 hover:bg-pink-400 text-white font-bold rounded-2xl transition-all shadow-[0_0_20px_rgba(236,72,153,0.3)] flex items-center justify-center gap-2 group"
            >
              Get Started <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all border border-white/10"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Feature List Section */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-12">
          {[
            { icon: <Share2 size={24} />, title: "Social Sharing", text: "Easily share your progress and referral links on social media." },
            { icon: <Shield size={24} />, title: "Enhanced Security", text: "Two-factor authentication and advanced encryption for your data." },
            { icon: <HelpCircle size={24} />, title: "Help Center", text: "Comprehensive guides and FAQs to help you navigate the platform." }
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <div className="mb-4 text-pink-400">{item.icon}</div>
              <h4 className="text-xl font-bold text-white mb-2">{item.title}</h4>
              <p className="text-slate-500 text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
