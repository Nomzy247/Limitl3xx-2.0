import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { Hexagon, Mail, Lock, AlertCircle, Phone, Key, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { getSupabase } from '../lib/supabase';
import { fluidSpring } from '../components/SystemManager';
import { useMediaQuery } from '../hooks/useMediaQuery';

export default function Login() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Recovery State
  const [showRecovery, setShowRecovery] = useState(false);

  const navigate = useNavigate();

  // 2FA state
  const [show2FA, setShow2FA] = useState(false);
  // ...

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    const supabase = getSupabase();
    if (!supabase) {
      setError('Supabase not initialized');
      setIsLoading(false);
      return;
    }

    try {
      if (loginMethod === 'email') {
        console.log('Signing in with email...');
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) throw error;

        if (data.user) {
          console.log('Sign-in successful, user:', data.user.id);
          // Double check for 2FA (Firestore still holds this info)
          const { getDoc, doc, db } = await import('../firebase');
          const userDoc = await getDoc(doc(db, 'users', data.user.id));
          
          if (userDoc.exists() && userDoc.data().two_factor_enabled) {
            console.log('2FA required');
            setPendingUser(data.user);
            setShow2FA(true);
            setIsLoading(false);
            return;
          }

          console.log('Navigating to dashboard...');
          navigate(isMobile ? '/hub' : '/dashboard');
        }
      } else {
        // TODO: Phone auth implementation with Supabase
        setError('Phone auth using Supabase not yet implemented.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    console.log('Google login attempt started');
    try {
      await signInWithGoogle();
      console.log('Google login successful');
      navigate(isMobile ? '/hub' : '/dashboard');
    } catch (err: any) {
      console.error('Google login error:', err);
      setError(err.message || 'Google login failed.');
    }
  };

  const handleMicrosoftLogin = async () => {
    // Mock Microsoft login
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/');
    }, 1500);
  };

  const handleRecoverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address for recovery.');
      return;
    }
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success('Password reset email sent! Please check your inbox.');
      setShowRecovery(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send recovery email.');
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FAVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (faCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    
    setIsLoading(true);
    // In a real app, you'd verify against a TOTP secret.
    // For this implementation, we'll simulate verification success if code is 6 digits.
    setTimeout(() => {
      toast.success('Security verification complete!');
      navigate(isMobile ? '/hub' : '/dashboard');
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#0052ff] rounded-full blur-[150px] opacity-20 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={fluidSpring}
        className="max-w-md w-full space-y-8 bg-card p-8 rounded-3xl border border-border relative z-10 shadow-2xl"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6 group">
            <Hexagon className="text-[#00f0ff] transition-transform duration-500 group-hover:rotate-180" size={36} />
            <span className="text-2xl font-bold tracking-tight text-primary">PoolMining<span className="text-[#0052ff]">.cloud</span></span>
          </Link>
          <h2 className="text-2xl font-semibold text-primary">
            {showRecovery ? 'Account Recovery' : 'Welcome back'}
          </h2>
          <p className="mt-1 text-sm text-secondary">
            {showRecovery ? 'Enter your details to recover your account' : 'Sign in to access your dashboard'}
          </p>
        </div>
        
        <AnimatePresence mode="wait">
          {show2FA ? (
            <motion.form 
              key="2fa"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={fluidSpring}
              className="space-y-8" 
              onSubmit={handle2FAVerify}
            >
              <div className="text-center">
                <div className="inline-flex p-4 bg-emerald-500/10 rounded-2xl text-emerald-400 mb-4">
                  <Shield size={32} />
                </div>
                <h3 className="text-xl font-bold">Security Verification</h3>
                <p className="text-xs text-secondary mt-2">Enter the 6-digit code from your authenticator app to authorize this login.</p>
              </div>
              
              <div className="flex justify-center">
                <input 
                  type="text" 
                  maxLength={6}
                  value={faCode}
                  onChange={(e) => setFaCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000 000"
                  className="w-full text-center bg-surface-dark/50 border-2 border-white/5 focus:border-[#00f0ff]/40 rounded-2xl py-4 text-2xl font-bold tracking-[0.5em] text-[#00f0ff] outline-none"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || faCode.length !== 6}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-emerald-500 hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Verifying...' : 'Verify & Continue'}
              </button>
              
              <button
                type="button"
                onClick={() => {
                  setShow2FA(false);
                  setFaCode('');
                }}
                className="w-full text-xs text-secondary hover:text-primary transition-colors"
              >
                Cancel and sign in again
              </button>
            </motion.form>
          ) : showRecovery ? (
            <motion.form 
              key="recovery"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={fluidSpring}
              className="space-y-6" 
              onSubmit={handleRecoverySubmit}
            >
              <div>
                <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-border/50 rounded-xl bg-background/50 text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                  placeholder="you@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-semibold text-white bg-[#0052ff] hover:bg-[#0052ff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052ff] transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : 'Send Recovery Link'}
              </button>
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <button
                type="button"
                onClick={() => setShowRecovery(false)}
                className="w-full text-xs text-secondary hover:text-primary transition-colors hover:underline"
              >
                Back to Login
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={fluidSpring}
            >
              <div className="flex p-1 bg-surface rounded-xl mb-6 border border-border/50">
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginMethod === 'email' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                  onClick={() => setLoginMethod('email')}
                >
                  Email
                </button>
                <button
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${loginMethod === 'phone' ? 'bg-card text-primary shadow-sm' : 'text-muted hover:text-primary'}`}
                  onClick={() => setLoginMethod('phone')}
                >
                  Phone
                </button>
              </div>

              <form className="space-y-5" onSubmit={handleInitialSubmit}>
                <div className="space-y-4">
                  {loginMethod === 'email' ? (
                    <div>
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Email Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-muted" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Phone Number</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-muted" />
                        </div>
                        <input
                          type="tel"
                          required
                          disabled={!!confirmationResult}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface disabled:opacity-50"
                          placeholder="+1 (555) 000-0000"
                        />
                      </div>
                    </div>
                  )}
                  
                  {loginMethod === 'email' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-semibold text-muted uppercase tracking-wider">Password</label>
                        <button type="button" onClick={() => setShowRecovery(true)} className="text-[10px] font-semibold text-[#00f0ff] hover:underline">Forgot?</button>
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Lock className="h-4 w-4 text-muted" />
                        </div>
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface"
                          placeholder="••••••••"
                        />
                      </div>
                    </div>
                  )}

                  {loginMethod === 'phone' && confirmationResult && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="overflow-hidden"
                    >
                      <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-2">Verification Code</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-4 w-4 text-muted" />
                        </div>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="block w-full pl-10 pr-3 py-3 border border-border/50 rounded-xl bg-background/50 text-sm text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-[#0052ff]/50 focus:border-[#0052ff] transition-all hover:border-border hover:bg-surface tracking-widest"
                          placeholder="123456"
                          maxLength={6}
                        />
                      </div>
                    </motion.div>
                  )}
                </div>

                <div id="recaptcha-container"></div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-semibold text-white bg-[#0052ff] hover:bg-[#0052ff]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0052ff] transition-all active:scale-95 disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : (loginMethod === 'phone' && !confirmationResult ? 'Send Code' : 'Sign In')}
                </button>
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/50 flex items-center gap-2 text-red-400 text-xs text-center justify-center">
                    <AlertCircle size={14} />
                    {error}
                  </div>
                )}
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-[10px] font-semibold text-muted uppercase tracking-widest">
                  <span className="px-2 bg-card">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-border rounded-xl text-xs font-semibold text-primary bg-surface hover:bg-subtle transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Google
                </button>
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-border rounded-xl text-xs font-semibold text-primary bg-surface hover:bg-subtle transition-all active:scale-95"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
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
          )}
        </AnimatePresence>
        
        <p className="text-center text-xs text-secondary mt-8">
          Don't have an account?{' '}
          <Link to="/signup" className="font-semibold text-[#00f0ff] hover:underline">
            Create one now
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
