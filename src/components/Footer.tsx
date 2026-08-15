import { Link } from 'react-router';
import { Hexagon, Twitter, Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';
import { fluidSpring } from './SystemManager';
import Logo from './Logo';
import DiscordIcon from './DiscordIcon';

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <Logo compact={false} />
            </Link>
            <p className="text-secondary text-sm mb-6">
              Automated wealth generation through advanced crypto mining protocols and institutional-grade security.
            </p>
            <div className="flex gap-4 items-center">
              <a 
                href="https://discord.gg/p5XRG4bG8" 
                target="_blank" 
                rel="noopener noreferrer" 
                aria-label="Join PoolMining Discord Server" 
                className="text-secondary transition-colors hover:text-[#5865F2] hover:scale-110 active:scale-95 inline-block transition-all"
                title="Discord Community"
              >
                <DiscordIcon size={20} />
              </a>
              <a href="#" aria-label="Twitter" className="text-secondary transition-colors hover:text-[#00f0ff] hover:scale-110 active:scale-95 inline-block transition-all">
                <Twitter size={20} />
              </a>
              <a href="#" aria-label="GitHub" className="text-secondary transition-colors hover:text-[#00f0ff] hover:scale-110 active:scale-95 inline-block transition-all">
                <Github size={20} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-secondary transition-colors hover:text-[#00f0ff] hover:scale-110 active:scale-95 inline-block transition-all">
                <Linkedin size={20} />
              </a>
              <a href="mailto:poolmining@poolmining.cloud" aria-label="Email" className="text-secondary transition-colors hover:text-[#00f0ff] hover:scale-110 active:scale-95 inline-block transition-all">
                <Mail size={20} />
              </a>
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
                <Link to="/services" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/locations" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Locations
                </Link>
              </li>
              <li>
                <Link to="/live-trading" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Live Trading
                </Link>
              </li>
              <li>
                <Link to="/marketplace" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Marketplace
                </Link>
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
                <Link to="/faq" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  FAQ
                </Link>
              </li>
              <li>
                <a 
                  href="https://discord.gg/p5XRG4bG8" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-secondary text-sm block hover:text-[#5865F2] transition-all hover:translate-x-1 flex items-center gap-1.5"
                >
                  <span>Discord Community</span>
                </a>
              </li>
              <li>
                <Link to="/support" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Account Profile
                </Link>
              </li>
              <li>
                <Link to="/referrals" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Referral Program
                </Link>
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
                <Link to="/about" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-secondary text-sm block hover:text-[#00f0ff] transition-all hover:translate-x-1 block">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-secondary text-sm block hover:text-[#0052ff] transition-all hover:translate-x-1 block">
                  Create Account
                </Link>
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
