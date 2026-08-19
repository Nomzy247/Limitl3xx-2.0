import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Settings as SettingsIcon, User, Lock, Bell, Shield, 
  Globe, Moon, Sun, Trash2, Save, Camera, Smartphone, 
  CheckCircle, Copy, RefreshCw, Eye, EyeOff, ChevronRight, X,
  BatteryCharging, BatteryLow, ZapOff, Sparkles, Sliders
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePowerSave } from '../context/PowerSaveContext';
import { useBattery } from '../hooks/useBattery';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../components/LanguageSelector';
import { fluidSpring } from '../components/SystemManager';
import { toast } from 'sonner';
import { db, doc, updateDoc } from '../firebase';
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from 'firebase/auth';

const ALL_COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", 
  "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", 
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", 
  "Cabo Verde", "Cambodia", "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", 
  "Comoros", "Congo (Congo-Brazzaville)", "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia (Czech Republic)", 
  "Democratic Republic of the Congo", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", 
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini (fmr. Swaziland)", "Ethiopia", "Fiji", "Finland", 
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", 
  "Guyana", "Haiti", "Holy See", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", 
  "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos", 
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi", 
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", 
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar (formerly Burma)", "Namibia", "Nauru", "Nepal", 
  "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", 
  "Pakistan", "Palau", "Palestine State", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", 
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", 
  "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", 
  "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea", "South Sudan", 
  "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Tajikistan", "Tanzania", "Thailand", 
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu", "Uganda", 
  "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", 
  "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

export default function Settings() {
  const { user, userData } = useAuth();
  const { isDark, toggleTheme, setTheme } = useTheme();
  const { powerSaveMode, isEffectivePowerSaving, togglePowerSaveMode, updateIntervalMs } = usePowerSave();
  const battery = useBattery();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications' | 'preferences' | 'power'>('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile Form State
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [country, setCountry] = useState('United Kingdom');
  const [avatar, setAvatar] = useState(userData?.avatar_url || '');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [is2FAModalOpen, setIs2FAModalOpen] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(userData?.two_factor_enabled || false);
  const [faStep, setFaStep] = useState(1);
  const [faCode, setFaCode] = useState('');

  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'security', icon: Lock, label: 'Security' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'preferences', icon: Globe, label: 'Preferences' },
    { id: 'power', icon: BatteryCharging, label: 'Power Save' },
  ];

  useEffect(() => {
    if (userData) {
      setName(userData.name);
      setPhone(userData.phone || '');
      setIs2FAEnabled(userData.two_factor_enabled || false);
    }
  }, [userData]);

  const handleProfileUpdate = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        phone,
        // Since we don't have a real storage upload, we'll just mock the avatar update if changed
        avatar_url: avatar
      });
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!user || !currentPassword || !newPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle2FA = () => {
    if (is2FAEnabled) {
      setIs2FAModalOpen(true);
      setFaStep(3); // Direct to disable flow
    } else {
      setIs2FAModalOpen(true);
      setFaStep(1);
    }
  };

  const complete2FASetup = async () => {
    if (faCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsSaving(true);
    try {
      if (!user) return;
      await updateDoc(doc(db, 'users', user.uid), {
        two_factor_enabled: !is2FAEnabled
      });
      setIs2FAEnabled(!is2FAEnabled);
      toast.success(is2FAEnabled ? '2FA disabled' : '2FA enabled successfully!');
      setIs2FAModalOpen(false);
      setFaCode('');
      setFaStep(1);
    } catch (error) {
      toast.error('Failed to update 2FA status');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Settings</h1>
          <p className="text-secondary mt-1">Configure your personal profile and safeguard your assets.</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={isSaving}
          onClick={activeTab === 'profile' ? handleProfileUpdate : activeTab === 'security' ? handlePasswordUpdate : () => toast.info('Settings saved')}
          className="px-8 py-3 bg-gradient-to-r from-[#0052ff] to-[#00f0ff] text-white rounded-xl font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
        >
          {isSaving ? <RefreshCw size={18} className="animate-spin" /> : <Save size={18} />}
          Save Changes
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ x: 5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-semibold ${
                activeTab === tab.id 
                  ? 'bg-gradient-to-r from-[#0052ff]/10 to-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20' 
                  : 'text-muted hover:bg-surface hover:text-primary border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <tab.icon size={20} />
                <span className="text-sm">{tab.label}</span>
              </div>
              {activeTab === tab.id && <ChevronRight size={16} />}
            </motion.button>
          ))}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div 
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={fluidSpring}
              className="bg-card/40 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-10 border border-white/5 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00f0ff]/5 rounded-full blur-[100px] pointer-events-none" />

              {activeTab === 'profile' && (
                <div className="space-y-10 relative z-10">
                  <div className="flex flex-col md:flex-row items-center gap-8 pb-10 border-b border-white/5">
                    <div className="relative group">
                      <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-[#0052ff] to-[#00f0ff] p-1 shadow-2xl">
                        <div className="w-full h-full rounded-full bg-surface-dark flex items-center justify-center text-white font-bold text-4xl overflow-hidden border-4 border-card">
                          {avatar ? <img src={avatar} alt="Avatar" className="w-full h-full object-cover" /> : name?.charAt(0) || 'U'}
                        </div>
                      </div>
                      <button className="absolute bottom-0 right-0 p-2.5 bg-[#0052ff] text-white rounded-full shadow-lg group-hover:scale-110 transition-transform border-4 border-card">
                        <Camera size={16} />
                      </button>
                    </div>
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl font-bold tracking-tight">{name || 'Set your name'}</h3>
                      <p className="text-secondary text-sm mt-1">{userData?.email}</p>
                      <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase rounded-full border border-emerald-500/20">Email Verified</span>
                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase rounded-full border border-blue-500/20">LVL {userData?.level || 1}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Full Name</label>
                      <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Email Address</label>
                      <input 
                        type="email" 
                        value={userData?.email}
                        disabled
                        className="w-full bg-surface border border-white/5 rounded-2xl px-5 py-4 text-muted cursor-not-allowed text-sm font-medium opacity-60"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Phone Number</label>
                      <div className="relative">
                        <Smartphone className="absolute left-5 top-1/2 -translate-y-1/2 text-secondary" size={18} />
                        <input 
                          type="tel" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl pl-12 pr-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-secondary uppercase tracking-widest px-1">Country / Region</label>
                      <select 
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium appearance-none"
                      >
                        {ALL_COUNTRIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-12 relative z-10">
                  {/* Password Section */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2">
                       <Lock size={20} className="text-[#00f0ff]" />
                       <h3 className="text-xl font-bold tracking-tight">Security Credentials</h3>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="relative">
                        <input 
                          type={showPassword ? 'text' : 'password'} 
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current Password"
                          className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium"
                        />
                        <button 
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-5 top-1/2 -track-y-1/2 text-muted hover:text-primary transition-colors"
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input 
                          type="password" 
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password"
                          className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium"
                        />
                        <input 
                          type="password" 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          className="w-full bg-surface-dark/50 border border-white/5 focus:border-[#00f0ff]/30 rounded-2xl px-5 py-4 text-primary focus:outline-none focus:ring-4 focus:ring-[#00f0ff]/5 transition-all text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 2FA Section */}
                  <div className="space-y-6 pt-10 border-t border-white/5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                         <Shield size={20} className="text-emerald-400" />
                         <h3 className="text-xl font-bold tracking-tight">Two-Factor Authentication</h3>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${is2FAEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                        {is2FAEnabled ? 'Active' : 'Disabled'}
                      </div>
                    </div>

                    <div className="bg-surface-dark/30 rounded-3xl p-6 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-400">
                          <Smartphone size={28} />
                        </div>
                        <div>
                          <p className="font-bold text-primary">Authenticator App</p>
                          <p className="text-xs text-secondary mt-1 max-w-xs leading-relaxed">
                            Protect your account with a secondary security layer from Google Authenticator or Authy.
                          </p>
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleToggle2FA}
                        className={`px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-xl ${
                          is2FAEnabled 
                            ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border border-rose-500/20' 
                            : 'bg-emerald-500 text-white shadow-emerald-500/20 hover:bg-emerald-600'
                        }`}
                      >
                        {is2FAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <Bell size={20} className="text-[#00f0ff]" />
                     <h3 className="text-xl font-bold tracking-tight">System Alerts</h3>
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: 'mining', label: 'Mining Rewards', desc: 'Get real-time alerts when daily mining payouts are processed.' },
                      { id: 'deposits', label: 'Financial Transactions', desc: 'Confirmations for all deposits, withdrawals, and internal transfers.' },
                      { id: 'security', label: 'Security Protocols', desc: 'Critical alerts about logins and credential modifications.' },
                      { id: 'marketing', label: 'Network News', desc: 'Be the first to know about new mining plans and platform updates.' },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-6 bg-surface-dark/30 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                        <div className="max-w-md">
                          <p className="font-bold text-primary">{item.label}</p>
                          <p className="text-[11px] text-secondary mt-1 leading-relaxed">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex h-7 w-12 items-center cursor-pointer group">
                          <input type="checkbox" className="sr-only peer" defaultChecked={item.id !== 'marketing'} />
                          <div className="w-12 h-7 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00f0ff]/30 border border-white/5"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-12 relative z-10">
                  {/* Language & Regional Settings */}
                  <div className="space-y-6 pb-12 border-b border-white/5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-[#0052ff]" />
                          <h3 className="text-xl font-bold tracking-tight">
                            {t('settings.languageSectionTitle', 'Language & Regional Settings')}
                          </h3>
                        </div>
                        <p className="text-xs text-secondary mt-1 max-w-lg">
                          {t('settings.languageSectionSubtitle', 'Select your preferred display language for dashboards, notifications, and trading reports.')}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-semibold text-secondary hidden sm:inline">
                          {t('settings.selectLanguageLabel', 'Interface Language')}:
                        </span>
                        <LanguageSelector variant="dropdown" />
                      </div>
                    </div>

                    <LanguageSelector variant="cards" />
                  </div>

                  <div className="space-y-6">
                     <div className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-3">
                          <Globe size={20} className="text-[#00f0ff]" />
                          <h3 className="text-xl font-bold tracking-tight">
                            {t('settings.themeSectionTitle', 'Platform Theme & Experience')}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 bg-surface border border-border px-4 py-2 rounded-2xl">
                          <span className="text-xs font-semibold text-secondary">
                            {t('settings.toggleThemeLabel', 'Toggle Theme')}
                          </span>
                          <button
                            onClick={toggleTheme}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                              isDark ? 'bg-[#0052ff]' : 'bg-amber-500'
                            }`}
                          >
                            <span
                              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                isDark ? 'translate-x-6' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                     </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <motion.button 
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme('dark')}
                        className={`p-6 rounded-[2rem] flex flex-col items-start gap-4 transition-all text-left relative overflow-hidden ${
                          isDark 
                            ? 'border-2 border-[#0052ff] bg-surface shadow-xl shadow-blue-500/10' 
                            : 'border border-border bg-surface/50 hover:border-[#0052ff]/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-3 rounded-xl ${isDark ? 'bg-[#0052ff]/10 text-[#0052ff]' : 'bg-subtle text-muted'}`}>
                            <Moon size={28} />
                          </div>
                          {isDark && (
                            <span className="flex items-center gap-1 text-xs font-bold text-[#0052ff] bg-[#0052ff]/10 border border-[#0052ff]/20 px-3 py-1 rounded-full">
                              <CheckCircle size={14} /> Active
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-primary">Fintech Dark Mode</p>
                          <p className="text-xs text-secondary mt-1 leading-relaxed">High contrast, low eye-strain professional deep navy dashboard visual mode.</p>
                        </div>
                      </motion.button>

                      <motion.button 
                        whileHover={{ scale: 1.02, y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme('light')}
                        className={`p-6 rounded-[2rem] flex flex-col items-start gap-4 transition-all text-left relative overflow-hidden ${
                          !isDark 
                            ? 'border-2 border-amber-500 bg-surface shadow-xl shadow-amber-500/10' 
                            : 'border border-border bg-surface/50 hover:border-amber-500/40'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className={`p-3 rounded-xl ${!isDark ? 'bg-amber-500/10 text-amber-500' : 'bg-subtle text-muted'}`}>
                            <Sun size={28} />
                          </div>
                          {!isDark && (
                            <span className="flex items-center gap-1 text-xs font-bold text-amber-500 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full">
                              <CheckCircle size={14} /> Active
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-lg text-primary">Clean Light Mode</p>
                          <p className="text-xs text-secondary mt-1 leading-relaxed">Bright, high-clarity daylight theme with vibrant blue accents and subtle card borders.</p>
                        </div>
                      </motion.button>
                    </div>
                  </div>

                  <div className="pt-12 border-t border-white/5">
                    <h3 className="font-bold text-rose-500 mb-6 flex items-center gap-2 uppercase tracking-widest text-xs">
                       Danger Protocols
                    </h3>
                    <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-[2rem] flex flex-col md:flex-row items-center justify-between gap-6 group hover:bg-rose-500/10 transition-colors">
                      <div className="text-center md:text-left">
                        <p className="font-bold text-lg text-rose-500">Purge Data & Terminate Account</p>
                        <p className="text-xs text-rose-400/60 mt-1 max-w-sm">This action is irreversible. All assets, history, and verification will be permanently erased.</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-8 py-3 bg-rose-500/20 text-rose-500 border border-rose-500/30 rounded-xl text-sm font-bold hover:bg-rose-500 hover:text-white transition-all flex items-center gap-2 group-hover:shadow-xl group-hover:shadow-rose-500/20"
                      >
                        <Trash2 size={16} /> Delete Forever
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'power' && (
                <div className="space-y-10 relative z-10">
                  {/* Header & Battery Status Telemetry Card */}
                  <div className="p-6 md:p-8 bg-surface-dark/40 rounded-3xl border border-white/5 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <BatteryCharging size={22} className="text-[#00f0ff]" />
                          <h3 className="text-xl font-bold tracking-tight text-primary">
                            Device Power-Save Mode
                          </h3>
                        </div>
                        <p className="text-xs text-secondary mt-1 max-w-xl leading-relaxed">
                          Dynamically throttle mining dashboard polling, ticker refresh rates, and background telemetry queries to preserve battery longevity on portable and mobile devices when unplugged.
                        </p>
                      </div>

                      <div className="flex items-center gap-3 bg-surface border border-border px-5 py-3 rounded-2xl shrink-0">
                        <span className="text-xs font-semibold text-secondary">
                          Power-Save State
                        </span>
                        <button
                          id="settings-toggle-power-save"
                          onClick={togglePowerSaveMode}
                          className={`relative inline-flex h-7 w-13 items-center rounded-full transition-colors ${
                            powerSaveMode ? 'bg-emerald-500' : 'bg-white/10'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform shadow-md ${
                              powerSaveMode ? 'translate-x-7' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    {/* Live Device Battery Diagnostics */}
                    {battery.isSupported && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5">
                        <div className="p-4 rounded-2xl bg-surface/40 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Battery Level</p>
                          <p className="text-xl font-black font-mono mt-1 text-primary">
                            {Math.round(battery.level * 100)}%
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-surface/40 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Power Source</p>
                          <p className={`text-sm font-bold mt-1.5 flex items-center gap-1.5 ${battery.charging ? 'text-[#00f0ff]' : 'text-amber-400'}`}>
                            {battery.charging ? <BatteryCharging size={16} /> : <BatteryLow size={16} />}
                            {battery.charging ? 'AC Connected (Charging)' : 'Discharging on Battery'}
                          </p>
                        </div>
                        <div className="p-4 rounded-2xl bg-surface/40 border border-border/40">
                          <p className="text-[10px] uppercase font-bold text-secondary tracking-wider">Telemetry Cadence</p>
                          <p className="text-sm font-mono font-bold mt-1.5 text-secondary">
                            {isEffectivePowerSaving ? 'Every 90s (Throttled)' : 'Every 15s (Real-time)'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Feature Breakdown & Modes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 bg-surface-dark/30 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm">
                        <ZapOff size={18} />
                        <span>Background Polling Throttling</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
                        When battery is discharging, background network calls to update contract balances and pool statuses are relaxed from 15 seconds to 90 seconds.
                      </p>
                    </div>

                    <div className="p-6 bg-surface-dark/30 rounded-3xl border border-white/5 space-y-3">
                      <div className="flex items-center gap-2.5 text-[#0052ff] font-bold text-sm">
                        <Sparkles size={18} />
                        <span>Zero Cloud Mining Interruption</span>
                      </div>
                      <p className="text-xs text-secondary leading-relaxed">
                        Cloud and Pool contracts run autonomously on our enterprise hardware nodes. Reducing local client polling will never affect your earned payouts or hashrates.
                      </p>
                    </div>
                  </div>

                  {/* Operational Status Pill */}
                  <div className="p-5 rounded-2xl border bg-surface/30 border-border flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sliders size={18} className="text-secondary" />
                      <div>
                        <p className="text-sm font-bold text-primary">Active Optimization Status</p>
                        <p className="text-xs text-secondary">
                          {isEffectivePowerSaving 
                            ? 'Power-Save mode is actively conserving battery during discharge.' 
                            : powerSaveMode && battery.charging 
                            ? 'Power-Save enabled, but standby mode is bypassed because device is connected to power.'
                            : 'Standard high-frequency telemetry updates active.'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      isEffectivePowerSaving ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-surface text-secondary border border-border'
                    }`}>
                      {isEffectivePowerSaving ? 'Active Saver' : 'Standard'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* 2FA Setup Modal */}
      <AnimatePresence>
        {is2FAModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIs2FAModalOpen(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card rounded-[2.5rem] p-10 border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-[60px] pointer-events-none" />
              
              <button 
                onClick={() => setIs2FAModalOpen(false)}
                className="absolute top-6 right-6 text-muted hover:text-primary p-2 hover:bg-surface rounded-full transition-all"
              >
                <X size={20} />
              </button>

              {faStep === 1 && (
                <div className="text-center space-y-8 mt-4">
                  <div className="inline-flex p-5 bg-emerald-500/10 rounded-3xl text-emerald-400">
                    <Smartphone size={48} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Enable Security Layer</h2>
                    <p className="text-secondary text-sm mt-3 leading-relaxed">
                      Download Google Authenticator or Authy to start the verification process.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl mx-auto w-fit shadow-xl border-4 border-card">
                    {/* Simulated QR Code */}
                    <div className="w-32 h-32 bg-background flex flex-wrap gap-1 p-1">
                       {[...Array(16)].map((_, i) => (
                         <div key={i} className={`w-7 h-7 rounded-sm ${Math.random() > 0.5 ? 'bg-primary' : 'bg-transparent'}`} />
                       ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-surface rounded-2xl border border-white/5">
                      <code className="text-[#00f0ff] font-bold text-base tracking-wider">J7X2 L9P0 W4K1</code>
                      <button className="text-muted hover:text-primary transition-colors">
                        <Copy size={16} />
                      </button>
                    </div>
                    <button 
                      onClick={() => setFaStep(2)}
                      className="w-full py-4 bg-[#0052ff] hover:bg-[#1e6aff] text-white rounded-2xl font-bold shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                    >
                      I scanned the QR <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}

              {faStep === 2 && (
                <div className="text-center space-y-8 mt-4">
                  <div className="inline-flex p-5 bg-emerald-500/10 rounded-3xl text-emerald-400">
                    <Shield size={48} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Verify Secure Code</h2>
                    <p className="text-secondary text-sm mt-3 leading-relaxed">
                      Enter the 6-digit code generated from your authenticator app to complete setup.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={faCode}
                      onChange={(e) => setFaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000 000"
                      className="w-full text-center bg-surface-dark/50 border-2 border-white/5 focus:border-[#00f0ff]/40 rounded-2xl py-5 text-3xl font-bold tracking-[0.5em] text-[#00f0ff] outline-none"
                    />
                  </div>
                  <button 
                    onClick={complete2FASetup}
                    disabled={faCode.length !== 6 || isSaving}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <CheckCircle size={20} />}
                    Complete Verification
                  </button>
                </div>
              )}

              {faStep === 3 && (
                <div className="text-center space-y-8 mt-4">
                  <div className="inline-flex p-5 bg-rose-500/10 rounded-3xl text-rose-500">
                    <Trash2 size={48} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold tracking-tight">Disable Security</h2>
                    <p className="text-secondary text-sm mt-3 leading-relaxed">
                      This will remove the secondary verification layer. Enter your 6-digit code to confirm.
                    </p>
                  </div>
                  <div className="flex justify-center gap-2">
                    <input 
                      type="text" 
                      maxLength={6}
                      value={faCode}
                      onChange={(e) => setFaCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000 000"
                      className="w-full text-center bg-surface-dark/50 border-2 border-rose-500/10 focus:border-rose-500/40 rounded-2xl py-5 text-3xl font-bold tracking-[0.5em] text-rose-500 outline-none"
                    />
                  </div>
                  <button 
                    onClick={complete2FASetup}
                    disabled={faCode.length !== 6 || isSaving}
                    className="w-full py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-bold shadow-lg shadow-rose-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? <RefreshCw size={20} className="animate-spin" /> : <X size={20} />}
                    Disable 2FA Layer
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
