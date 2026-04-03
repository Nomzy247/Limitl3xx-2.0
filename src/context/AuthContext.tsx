import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

interface UserData {
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'admin';
  balance: number;
  balances?: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
  joined_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  referral_code: string;
  referred_by?: string;
  referral_count: number;
  referral_earnings: number;
  level: number;
  onboarding_completed?: boolean;
  is_blocked?: boolean;
  trade_enabled?: boolean;
  last_login?: string;
}

export type AppUser = FirebaseUser;

interface AuthContextType {
  user: AppUser | null;
  userData: UserData | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  isAdmin: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time updates
        unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data() as UserData;
            
            // Update last login if it's been more than an hour
            const lastLogin = data.last_login ? new Date(data.last_login).getTime() : 0;
            if (Date.now() - lastLogin > 3600000) {
              try {
                await updateDoc(userDocRef, { last_login: new Date().toISOString() });
              } catch (e) {
                console.error("Failed to update last login", e);
              }
            }
            
            setUserData(data);
          } else {
            // If user doc doesn't exist, create a default one
            const newData: UserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || firebaseUser.phoneNumber || 'User',
              email: firebaseUser.email || '',
              phone: firebaseUser.phoneNumber || '',
              role: (firebaseUser.email === 'why.wd.ww.do@gmail.com' || firebaseUser.email === 'limitl3xx.007@gmail.com') ? 'admin' : 'user',
              balance: 0,
              balances: {
                BTC: 0,
                ETH: 0,
                USDT: 0
              },
              joined_date: new Date().toISOString(),
              verification_status: 'pending',
              referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
              referral_count: 0,
              referral_earnings: 0,
              level: 1,
              onboarding_completed: false,
              is_blocked: false,
              trade_enabled: true,
              last_login: new Date().toISOString()
            };
            try {
              await setDoc(userDocRef, newData);
              setUserData(newData);
            } catch (error) {
              handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
            }
          }
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
          setLoading(false);
        });
      } else {
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const value = {
    user,
    userData,
    loading,
    isAdmin: userData?.role === 'admin',
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
