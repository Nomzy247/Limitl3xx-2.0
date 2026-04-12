import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Settings as SettingsIcon, User, Lock, Bell, Shield, Globe, Moon, Sun, Trash2, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fluidSpring } from '../components/SystemManager';
import { toast } from 'sonner';

export default function Settings() {
  const { userData } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences'>('profile');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'preferences', icon: Globe, label: 'Preferences' },
  ];

  const handleSave = () => {
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold">Account Settings</h1>
          <p className="text-secondary mt-1">Manage your account preferences and security settings.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={fluidSpring}
          onClick={handleSave}
          className="px-6 py-2 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-full font-medium transition-colors flex items-center gap-2"
        >
          <Save size={18} /> Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              transition={fluidSpring}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                activeTab === tab.id 
                  ? 'bg-[#0052ff]/10 text-[#0052ff] border border-[#0052ff]/20' 
                  : 'text-muted hover:bg-subtle hover:text-primary'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={fluidSpring}
            className="bg-card rounded-3xl p-8 border border-border/50 shadow-xl space-y-8"
          >
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="flex items-center gap-6 pb-8 border-b border-border/50">
                  <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl">
                    {userData?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{userData?.name || 'User'}</h3>
                    <p className="text-secondary text-sm">{userData?.email}</p>
                    <button className="mt-2 text-xs text-[#0052ff] font-bold hover:underline">Change Avatar</button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Full Name</label>
                    <input 
                      type="text" 
                      defaultValue={userData?.name}
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Email Address</label>
                    <input 
                      type="email" 
                      defaultValue={userData?.email}
                      disabled
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-muted cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-muted mb-2">Country</label>
                    <select className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all">
                      <option>United Kingdom</option>
                      <option>United States</option>
                      <option>Canada</option>
                      <option>Germany</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2">
                    <Shield size={18} className="text-[#00f0ff]" />
                    Security Features
                  </h3>
                  <div className="p-4 bg-surface rounded-2xl border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Two-Factor Authentication (2FA)</p>
                      <p className="text-xs text-secondary mt-1">Add an extra layer of security to your account.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fluidSpring}
                      className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-full text-xs font-bold hover:bg-emerald-500/20 transition-colors"
                    >
                      Enable
                    </motion.button>
                  </div>
                  <div className="p-4 bg-surface rounded-2xl border border-border/50 flex items-center justify-between">
                    <div>
                      <p className="font-semibold">Login Alerts</p>
                      <p className="text-xs text-secondary mt-1">Get notified of new logins to your account.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fluidSpring}
                      className="px-4 py-2 bg-emerald-500 text-white rounded-full text-xs font-bold transition-colors"
                    >
                      Active
                    </motion.button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold">Change Password</h3>
                  <div className="space-y-4">
                    <input 
                      type="password" 
                      placeholder="Current Password"
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="New Password"
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="Confirm New Password"
                      className="w-full bg-surface border border-border/50 rounded-xl px-4 py-3 text-primary focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 transition-all"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-6">
                <h3 className="font-bold">Notification Preferences</h3>
                <div className="space-y-4">
                  {[
                    { id: 'mining', label: 'Mining Rewards', desc: 'Get notified when you receive mining payouts.' },
                    { id: 'deposits', label: 'Deposits & Withdrawals', desc: 'Alerts for successful financial transactions.' },
                    { id: 'security', label: 'Security Alerts', desc: 'Critical alerts about your account security.' },
                    { id: 'marketing', label: 'Marketing & News', desc: 'Stay updated with our latest offers and features.' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-border/50">
                      <div>
                        <p className="font-semibold">{item.label}</p>
                        <p className="text-xs text-secondary mt-1">{item.desc}</p>
                      </div>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-[#0052ff]">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-6" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="space-y-8">
                <div className="space-y-4">
                  <h3 className="font-bold">Appearance</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fluidSpring}
                      className="p-4 rounded-2xl border-2 border-[#0052ff] bg-surface flex flex-col items-center gap-3"
                    >
                      <Moon size={24} className="text-[#0052ff]" />
                      <span className="font-bold text-sm">Dark Mode</span>
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.05, y: -5 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fluidSpring}
                      className="p-4 rounded-2xl border border-border/50 bg-white flex flex-col items-center gap-3"
                    >
                      <Sun size={24} className="text-muted" />
                      <span className="font-bold text-sm text-muted">Light Mode</span>
                    </motion.button>
                  </div>
                </div>

                <div className="pt-8 border-t border-border/50">
                  <h3 className="font-bold text-rose-500 mb-4">Danger Zone</h3>
                  <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-rose-500">Delete Account</p>
                      <p className="text-xs text-rose-400/70 mt-1">Permanently delete your account and all your data.</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fluidSpring}
                      className="px-4 py-2 bg-rose-500 text-white rounded-full text-xs font-bold hover:bg-rose-600 transition-colors flex items-center gap-2"
                    >
                      <Trash2 size={14} /> Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
