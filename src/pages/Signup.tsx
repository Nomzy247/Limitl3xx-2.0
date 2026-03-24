import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Mail, Lock, User, AlertCircle, Phone } from 'lucide-react';
import { auth, signInWithGoogle } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

export default function Signup() {
  const [signupMethod, setSignupMethod] = useState<'email' | 'phone'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();

  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (!pass) return { score: 0, label: '', color: 'bg-transparent' };
    
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 0:
      case 1: return { score, label: 'Weak', color: 'bg-red-500' };
      case 2: return { score, label: 'Fair', color: 'bg-yellow-500' };
      case 3: return { score, label: 'Good', color: 'bg-[#0052ff]' };
      case 4: return { score, label: 'Strong', color: 'bg-emerald-500' };
      default: return { score: 0, label: '', color: 'bg-transparent' };
    }
  };

  const strength = getPasswordStrength(password);

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (signupMethod === 'email') {
        if (strength.score < 4) {
          setError('Password must be at least 8 characters long and contain an uppercase letter, a number, and a special character.');
          setIsLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: name
        });
        
        setSuccess('Account created successfully! Redirecting...');
        setTimeout(() => navigate('/'), 2000);
      } else {
        // Mock phone signup for now
        await new Promise(resolve => setTimeout(resolve, 1000));
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      await signInWithGoogle();
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Google signup failed.');
    }
  };

  const handleMicrosoftSignup = async () => {
    // Mock Microsoft signup
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#00f0ff] rounded-full blur-[150px] opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl border border-border relative z-10 shadow-2xl"
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <Hexagon className="text-[#00f0ff]" size={32} />
            <span className="text-2xl font-bold tracking-tight text-primary">PoolMining<span className="text-[#0052ff]">.cloud</span></span>
          </Link>
          <h2 className="text-3xl font-bold text-primary">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-secondary">
            Start your journey to automated wealth
          </p>
        </div>
        
        <AnimatePresence mode="wait">
            <motion.div
              key="signup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              <div className="flex p-1 bg-surface rounded-xl mb-6 border border-border">
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${signupMethod === 'email' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                  onClick={() => setSignupMethod('email')}
                >
                  Email
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium rounded-full transition-colors ${signupMethod === 'phone' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                  onClick={() => setSignupMethod('phone')}
                >
                  Phone
                </button>
              </div>

              <form className="space-y-6" onSubmit={handleInitialSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Full Name</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-muted" />
                      </div>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  {signupMethod === 'email' ? (
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-muted mb-1">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-5 w-5 text-muted" />
                        </div>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-muted mb-1">Password</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-muted" />
                      </div>
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                        placeholder="••••••••"
                      />
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {password && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-xs text-muted">Password strength</span>
                          <span className={`text-xs font-medium ${strength.color.replace('bg-', 'text-')}`}>
                            {strength.label}
                          </span>
                        </div>
                        <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-surface">
                          {[1, 2, 3, 4].map((level) => (
                            <div 
                              key={level} 
                              className={`flex-1 transition-colors duration-300 ${
                                level <= strength.score ? strength.color : 'bg-transparent'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className={`text-[10px] flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-500' : 'text-muted'}`}>
                            <span className="w-1 h-1 rounded-full bg-current" /> At least 8 characters
                          </p>
                          <p className={`text-[10px] flex items-center gap-1 ${/[A-Z]/.test(password) ? 'text-emerald-500' : 'text-muted'}`}>
                            <span className="w-1 h-1 rounded-full bg-current" /> One uppercase letter
                          </p>
                          <p className={`text-[10px] flex items-center gap-1 ${/[0-9]/.test(password) ? 'text-emerald-500' : 'text-muted'}`}>
                            <span className="w-1 h-1 rounded-full bg-current" /> One number
                          </p>
                          <p className={`text-[10px] flex items-center gap-1 ${/[^A-Za-z0-9]/.test(password) ? 'text-emerald-500' : 'text-muted'}`}>
                            <span className="w-1 h-1 rounded-full bg-current" /> One special character
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-[#0052ff] hover:bg-[#0052ff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052ff] transition-all disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : 'Continue'}
                </button>
                {error && (
                  <div className="mt-4 p-3 rounded-full bg-red-500/10 border border-red-500/50 flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/50 flex items-center gap-2 text-emerald-400 text-sm text-center">
                    {success}
                  </div>
                )}
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleSignup}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-primary bg-surface hover:bg-subtle transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleMicrosoftSignup}
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-border rounded-full shadow-sm text-sm font-medium text-primary bg-surface hover:bg-subtle transition-all"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Microsoft
                </button>
              </div>
            </motion.div>
        </AnimatePresence>
        
        <p className="text-center text-sm text-secondary mt-8">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-[#00f0ff] hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}