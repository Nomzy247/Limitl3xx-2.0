import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Lock, User, ArrowRight, CheckCircle2, ExternalLink } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { toast } from 'sonner';
import { auth, db, doc, getDoc } from '../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { fluidSpring } from '../components/SystemManager';
import { useAuth } from '../context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, user } = useAuth();
  const isRootAdmin = new URLSearchParams(location.search).get('root') === 'true';
  const ROOT_ADMIN_EMAILS = ['why.wd.ww.do@gmail.com', 'limitl3xx.007@gmail.com'];
  const ROOT_ADMIN_PASSWORD = 'weAREone007@';

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [user, isAdmin, navigate]);

  useEffect(() => {
    if (isRootAdmin) {
      setEmail(ROOT_ADMIN_EMAILS[0]);
      // We don't auto-fill password by default for security, 
      // but we provide a quick-fill button below.
    }
  }, [isRootAdmin]);

  const fillRootCredentials = (emailToFill: string) => {
    setEmail(emailToFill);
    setPassword(ROOT_ADMIN_PASSWORD);
    toast.info(`Root credentials for ${emailToFill} pre-filled`);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
          
        if (!userDoc.exists()) {
          await signOut(auth);
          throw new Error('User record not found');
        }
        
        const userData = userDoc.data();
        
        if (userData && userData.role === 'admin') {
          toast.success('Admin login successful');
          navigate('/admin/dashboard');
        } else {
          await signOut(auth);
          toast.error('Access denied. This portal is for administrators only.');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Invalid admin credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-background">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary rounded-full blur-[150px] opacity-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-[#00f0ff] rounded-full blur-[120px] opacity-5 pointer-events-none" />

      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-start relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={fluidSpring}
          className="w-full space-y-8 bg-surface p-8 rounded-3xl border border-border/50 shadow-2xl"
        >
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Admin Portal</h2>
            <p className="mt-2 text-sm text-secondary">
              Secure access for system administrators
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-end mb-2">
                  <label className="block text-sm font-medium text-secondary">
                    Admin Email
                  </label>
                  {!isRootAdmin && (
                    <button
                      type="button"
                      onClick={() => navigate('/admin/poolmining.cloud?root=true')}
                      className="text-xs text-primary hover:text-primary/80 bg-primary/10 px-2 py-1 rounded-md transition-colors"
                    >
                      Use Root Admin
                    </button>
                  )}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="admin@example.com"
                    readOnly={isRootAdmin}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-border rounded-xl bg-background text-primary placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                    placeholder="••••••••"
                  />
                </div>
                {isRootAdmin && (
                  <div className="mt-2 flex flex-col gap-2">
                    {ROOT_ADMIN_EMAILS.map((rootEmail) => (
                      <button
                        key={rootEmail}
                        type="button"
                        onClick={() => fillRootCredentials(rootEmail)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <Lock size={10} /> Use Root Password for {rootEmail} (weAREone007@)
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-background bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all disabled:opacity-70"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
              ) : (
                <>
                  Secure Login <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-secondary">
              Not an admin?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary/80 transition-colors">
                Return to User Login
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Setup Guide & Direct Link */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...fluidSpring, delay: 0.2 }}
          className="bg-surface/50 backdrop-blur-md p-8 rounded-3xl border border-border/50"
        >
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-emerald-400" size={24} />
            Admin Setup Guide
          </h3>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-primary">Create an Account</h4>
                <p className="text-sm text-secondary mt-1">
                  If you haven't already, sign up for a standard user account using one of the root emails (e.g., <code className="bg-muted/30 px-1 py-0.5 rounded text-[#00f0ff]">why.wd.ww.do@gmail.com</code> or <code className="bg-muted/30 px-1 py-0.5 rounded text-[#00f0ff]">limitl3xx.007@gmail.com</code>) and password <code className="bg-muted/30 px-1 py-0.5 rounded text-[#00f0ff]">weAREone007@</code>.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-primary">Access Root Login</h4>
                <p className="text-sm text-secondary mt-1">Navigate to this page with the <code className="bg-muted/30 px-1 py-0.5 rounded text-[#00f0ff]">?root=true</code> parameter to pre-fill the root email.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-primary">Authenticate</h4>
                <p className="text-sm text-secondary mt-1">Enter the password you created during signup to access the dashboard.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary shrink-0">4</div>
              <div>
                <h4 className="font-semibold text-primary">Manage Users</h4>
                <p className="text-sm text-secondary mt-1">Once inside, use the "Add Administrator" section to promote other users by their email.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-border/50">
            <h4 className="font-semibold text-primary mb-3">Direct Dashboard Access</h4>
            <p className="text-xs text-secondary mb-4">
              If you are already authenticated, you can bypass this login screen and go directly to the dashboard.
            </p>
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="w-full py-3 bg-subtle hover:bg-subtle-hover text-primary rounded-xl font-medium transition-colors flex items-center justify-center gap-2 border border-border"
            >
              Go to Dashboard <ExternalLink size={16} />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
