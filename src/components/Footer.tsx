import { Link } from 'react-router';
import { Hexagon, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { fluidSpring } from './SystemManager';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              {/* Replace this Hexagon with your uploaded logo image: <img src="/logo.png" alt="Logo" className="h-8" /> */}
              <Hexagon className="text-[#00f0ff]" size={28} />
              <span className="text-xl font-bold tracking-tight text-primary">PoolMining<span className="text-[#0052ff]">.cloud</span></span>
            </Link>
            <p className="text-secondary text-sm mb-6">
              Automated wealth generation through advanced crypto mining protocols and institutional-grade security.
            </p>
            <div className="flex gap-4">
              <motion.a 
                whileHover={{ scale: 1.2, color: '#00f0ff' }}
                whileTap={{ scale: 0.9 }}
                transition={fluidSpring}
                href="#" 
                className="text-secondary transition-colors"
              >
                <Twitter size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.2, color: '#00f0ff' }}
                whileTap={{ scale: 0.9 }}
                transition={fluidSpring}
                href="#" 
                className="text-secondary transition-colors"
              >
                <Github size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.2, color: '#00f0ff' }}
                whileTap={{ scale: 0.9 }}
                transition={fluidSpring}
                href="#" 
                className="text-secondary transition-colors"
              >
                <Linkedin size={20} />
              </motion.a>
              <motion.a 
                whileHover={{ scale: 1.2, color: '#00f0ff' }}
                whileTap={{ scale: 0.9 }}
                transition={fluidSpring}
                href="#" 
                className="text-secondary transition-colors"
              >
                <Mail size={20} />
              </motion.a>
            </div>
          </div>
          
          <div>
            <motion.h3 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary font-semibold mb-4 cursor-default"
            >
              Platform
            </motion.h3>
            <ul className="space-y-2">
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/services" 
                  className="text-secondary text-sm block"
                >
                  Services
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/locations" 
                  className="text-secondary text-sm block"
                >
                  Locations
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/live-trading" 
                  className="text-secondary text-sm block"
                >
                  Live Trading
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/marketplace" 
                  className="text-secondary text-sm block"
                >
                  Marketplace
                </motion.a>
              </li>
            </ul>
          </div>
          
          <div>
            <motion.h3 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary font-semibold mb-4 cursor-default"
            >
              Resources
            </motion.h3>
            <ul className="space-y-2">
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/faq" 
                  className="text-secondary text-sm block"
                >
                  FAQ
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/support" 
                  className="text-secondary text-sm block"
                >
                  Help Center
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/profile" 
                  className="text-secondary text-sm block"
                >
                  Account Profile
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/referrals" 
                  className="text-secondary text-sm block"
                >
                  Referral Program
                </motion.a>
              </li>
            </ul>
          </div>
          
          <div>
            <motion.h3 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-primary font-semibold mb-4 cursor-default"
            >
              Company
            </motion.h3>
            <ul className="space-y-2">
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/about" 
                  className="text-secondary text-sm block"
                >
                  About Us
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="/contact" 
                  className="text-secondary text-sm block"
                >
                  Contact
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="#" 
                  className="text-secondary text-sm block"
                >
                  Privacy Policy
                </motion.a>
              </li>
              <li>
                <motion.a 
                  whileHover={{ x: 5, color: '#00f0ff' }}
                  transition={fluidSpring}
                  href="#" 
                  className="text-secondary text-sm block"
                >
                  Terms of Service
                </motion.a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            &copy; {new Date().getFullYear()} PoolMining.cloud. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <span>Status: <span className="text-emerald-400">All Systems Operational</span></span>
            <span>Global Hashrate: <span className="text-[#00f0ff]">142.5 EH/s</span></span>
          </div>
        </div>
      </div>
    </footer>
  );
}
