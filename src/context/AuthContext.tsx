import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db, doc, getDoc, setDoc, onSnapshot, handleFirestoreError, OperationType } from '../firebase';

interface UserData {
  name: string;
  email: string;
  role: 'user' | 'admin';
  balance: number;
  balances?: {
    BTC: number;
    ETH: number;
    USDT: number;
  };
  joinedDate: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  referralCode: string;
  referredBy?: string;
  referralCount: number;
  level: number;
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
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        
        // Fetch user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        
        // Use onSnapshot for real-time updates
        const unsubscribeDoc = onSnapshot(userDocRef, async (docSnap) => {
          if (docSnap.exists()) {
            setUserData(docSnap.data() as UserData);
          } else {
            // If user doc doesn't exist, create a default one
            const newData: UserData = {
              name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
              email: firebaseUser.email || '',
              role: firebaseUser.email === 'why.wd.ww.do@gmail.com' ? 'admin' : 'user',
              balance: 0,
              balances: {
                BTC: 0,
                ETH: 0,
                USDT: 0
              },
              joinedDate: new Date().toISOString(),
              verificationStatus: 'pending',
              referralCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
              referralCount: 0,
              level: 1,
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

        return () => unsubscribeDoc();
      } else {
        setUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
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
