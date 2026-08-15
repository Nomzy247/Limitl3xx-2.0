import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { fluidSpring } from '../components/SystemManager';
import DiscordIcon from '../components/DiscordIcon';

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Message sent successfully! We will get back to you soon.');
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
          transition={{ ...fluidSpring, duration: 1.5, repeat: Infinity }}
          className="text-4xl md:text-5xl font-bold mb-6 cursor-default"
        >
          Get in <span className="text-primary">Touch</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...fluidSpring, delay: 0.1 }}
          className="text-lg text-secondary max-w-2xl mx-auto"
        >
          Have questions about our mining services? Our global support team is available 24/7 to assist you with any inquiries.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...fluidSpring, delay: 0.2 }}
          className="space-y-8"
        >
          <div>
            <motion.h3 
              whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-2xl font-bold mb-6 cursor-default"
            >
              Contact Information
            </motion.h3>
            <p className="text-secondary mb-8">
              Reach out to us through any of the following channels. We aim to respond to all inquiries within 2 hours during business days.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-subtle rounded-xl flex items-center justify-center flex-shrink-0 cursor-default"
              >
                <Mail className="text-primary" size={24} />
              </motion.div>
              <div>
                <motion.h4 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="font-semibold text-lg cursor-default"
                >
                  Email Us
                </motion.h4>
                <p className="text-secondary">poolmining@poolmining.cloud</p>
                <p className="text-secondary">sales@poolmining.cloud</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-subtle rounded-xl flex items-center justify-center flex-shrink-0 cursor-default"
              >
                <Phone className="text-primary" size={24} />
              </motion.div>
              <div>
                <motion.h4 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="font-semibold text-lg cursor-default"
                >
                  Call Us
                </motion.h4>
                <p className="text-secondary">+1 (800) 123-4567</p>
                <p className="text-secondary">Mon-Fri from 8am to 5pm</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-[#5865F2]/15 text-[#5865F2] rounded-xl flex items-center justify-center flex-shrink-0 cursor-default"
              >
                <DiscordIcon size={24} />
              </motion.div>
              <div>
                <motion.h4 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="font-semibold text-lg cursor-default"
                >
                  Discord Server
                </motion.h4>
                <p className="text-secondary">Official 24/7 PoolMining Group</p>
                <a 
                  href="https://discord.gg/p5XRG4bG8" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-xs font-bold text-[#5865F2] hover:underline inline-flex items-center gap-1 mt-1"
                >
                  <span>discord.gg/p5XRG4bG8</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="w-12 h-12 bg-subtle rounded-xl flex items-center justify-center flex-shrink-0 cursor-default"
              >
                <MapPin className="text-primary" size={24} />
              </motion.div>
              <div>
                <motion.h4 
                  whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="font-semibold text-lg cursor-default"
                >
                  Headquarters
                </motion.h4>
                <p className="text-secondary">100 Mining Way, Suite 400</p>
                <p className="text-secondary">San Francisco, CA 94105</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...fluidSpring, delay: 0.3 }}
          className="bg-surface border border-border rounded-3xl p-8 shadow-xl"
        >
          <motion.h3 
            whileHover={{ color: ['#ffffff', '#00f0ff', '#ffffff'] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-2xl font-bold mb-6 cursor-default"
          >
            Send a Message
          </motion.h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-medium text-secondary">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="John"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-medium text-secondary">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  required
                  className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                  placeholder="Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-secondary">Email Address</label>
              <input 
                type="email" 
                id="email" 
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors"
                placeholder="john@example.com"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-secondary">Subject</label>
              <select 
                id="subject" 
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors appearance-none"
              >
                <option>General Inquiry</option>
                <option>Technical Support</option>
                <option>Billing Question</option>
                <option>Partnership</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-secondary">Message</label>
              <textarea 
                id="message" 
                rows={4}
                required
                className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors resize-none"
                placeholder="How can we help you?"
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full bg-primary text-background py-3 rounded-full font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Send Message <Send size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
