import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { CheckCircle2, ChevronRight, Server, Shield, TrendingUp, Zap, ChevronLeft, Flag } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingModal() {
  const { user, userData } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);

  // Preferences State
  const [name, setName] = useState(userData?.name || '');
  const [phone, setPhone] = useState(userData?.phone || '');
  const [experience, setExperience] = useState('beginner');
  const [goal, setGoal] = useState('mining');

  // If we don't have user data yet, or onboarding is completed/undefined, don't show
  if (!user || !userData || userData.onboarding_completed !== false) {
    return null;
  }

  const handleNext = async () => {
    if (currentStep === 0 && !name.trim()) {
      toast.error('Please enter your name to continue.');
      return;
    }
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      await finishOnboarding();
    }
  };

  const handlePrev = () => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  };

  const finishOnboarding = async () => {
    setIsFinishing(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        name,
        phone,
        onboarding_completed: true
      });
      toast.success("Account setup complete! Welcome aboard.");
    } catch (error) {
      console.error("Failed to complete onboarding", error);
      toast.error("An error occurred saving your preferences. Please try again.");
      setIsFinishing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -10 }}
          transition={{ duration: 0.2 }}
          className="bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl flex flex-col relative"
        >
          
          {/* STEP 1: Welcome & Setup */}
          {currentStep === 0 && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6">
                <Zap className="text-blue-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Welcome to LimitLess!</h2>
              <p className="text-secondary leading-relaxed mb-8">
                We noticed your account is new. Let's finish setting up your profile before we get started.
              </p>

              <div className="text-left space-y-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0052ff] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Phone Number (Optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#0052ff] transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-secondary mb-3">What is your crypto experience level?</label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { id: 'beginner', label: 'Beginner' },
                      { id: 'intermediate', label: 'Intermediate' },
                      { id: 'advanced', label: 'Advanced' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setExperience(opt.id)}
                        className={`py-3 px-4 rounded-xl border text-sm font-medium transition-colors ${
                          experience === opt.id 
                            ? 'bg-[#0052ff]/10 border-[#0052ff] text-[#00f0ff]' 
                            : 'bg-background border-border text-secondary hover:border-[#0052ff]/50'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Goals */}
          {currentStep === 1 && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-6">
                <Flag className="text-emerald-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">What brings you here?</h2>
              <p className="text-secondary leading-relaxed mb-8">
                Choose your primary focus so we can tailor the dashboard to your needs. Don't worry, you'll still have access to everything.
              </p>

              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { id: 'mining', title: 'Cloud Mining', desc: 'Rent hashpower and earn passive crypto daily.', icon: <Server size={20} /> },
                  { id: 'trading', title: 'Active Trading', desc: 'Trade on spot markets with real-time analytics.', icon: <TrendingUp size={20} /> },
                  { id: 'both', title: 'A Bit of Everything', desc: 'Diversify with both mining and trading.', icon: <Zap size={20} /> }
                ].map(opt => (
                  <button
                    key={opt.id}
                    onClick={() => setGoal(opt.id)}
                    className={`flex items-center gap-4 p-4 text-left rounded-2xl border transition-all ${
                      goal === opt.id 
                        ? 'bg-[#0052ff]/10 border-[#0052ff]' 
                        : 'bg-background border-border hover:border-[#0052ff]/50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl ${goal === opt.id ? 'bg-[#0052ff] text-white' : 'bg-surface text-secondary'}`}>
                      {opt.icon}
                    </div>
                    <div>
                      <h4 className={`font-bold ${goal === opt.id ? 'text-[#00f0ff]' : 'text-primary'}`}>{opt.title}</h4>
                      <p className="text-xs text-secondary mt-1">{opt.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Security & Verification */}
          {currentStep === 2 && (
            <div className="text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6">
                <Shield className="text-purple-500 w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-3">Bank-Grade Security</h2>
              <p className="text-secondary leading-relaxed mb-6">
                Your account is protected by top-tier encryption and security protocols.
              </p>
              
              <div className="bg-background border border-border p-5 rounded-2xl text-left space-y-4 mb-8">
                <div className="flex gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Action Required Later</h4>
                    <p className="text-xs text-secondary mt-1">To withdraw funds, you will eventually need to complete KYC verification in your account settings.</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CheckCircle2 className="text-emerald-500 shrink-0" size={20} />
                  <div>
                    <h4 className="font-bold text-sm">Two-Factor Authentication (2FA)</h4>
                    <p className="text-xs text-secondary mt-1">Highly recommended. Enable this in Settings to secure your assets.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Final Screen */}
          {currentStep === 3 && (
            <div className="text-center py-6">
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
                className="mx-auto w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
              >
                <CheckCircle2 className="text-emerald-500 w-12 h-12" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-3">You're all set!</h2>
              <p className="text-secondary leading-relaxed mb-8">
                Your account is ready. Let's make some limit less gains together.
              </p>
              <div className="p-4 bg-background border border-border rounded-xl text-xs text-secondary flex items-start gap-2 text-left mb-8">
                <div className="mt-0.5">💡</div>
                <p>Pro tip: Check the <strong>Dashboard</strong> frequently to monitor your performance and watch your balance grow.</p>
              </div>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
            {currentStep > 0 && currentStep < 3 ? (
              <button
                onClick={handlePrev}
                className="px-4 py-2 text-sm font-medium text-secondary hover:text-white flex items-center gap-1 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div /> // Spacer
            )}

            {/* Progress indicators - only show for steps 0 to 2 */}
            {currentStep < 3 && (
              <div className="flex justify-center gap-2">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      step === currentStep 
                        ? 'w-6 bg-[#0052ff]' 
                        : step < currentStep 
                          ? 'w-2 bg-[#0052ff]/50'
                          : 'w-2 bg-border'
                    }`}
                  />
                ))}
              </div>
            )}

            <button
              onClick={handleNext}
              disabled={isFinishing}
              className={`px-6 py-2.5 bg-[#0052ff] hover:bg-[#0052ff]/90 text-white rounded-full font-bold flex items-center gap-2 transition-all disabled:opacity-50 ${currentStep === 3 ? 'w-full justify-center text-lg py-4' : ''}`}
            >
              {isFinishing ? 'Finishing...' : currentStep === 3 ? "Let's Go!" : "Next"}
              {currentStep < 3 && <ChevronRight size={18} />}
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
