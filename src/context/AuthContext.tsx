import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth, db, doc, getDoc, setDoc, updateDoc, onSnapshot, handleFirestoreError, OperationType, addDoc, collection, serverTimestamp, withFirestoreRetry, query, where, getDocs, limit } from '../firebase';
import PageSuspenseFallback from '../components/PageSuspenseFallback';

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
    SOL: number;
  };
  joined_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  referral_code: string;
  referred_by?: string;
  referred_by_uid?: string;
  referral_count: number;
  referral_earnings: number;
  manual_profits?: number;
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
      console.log('Auth state changed:', firebaseUser ? `User: ${firebaseUser.uid}` : 'Logged out');
      try {
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
                  await withFirestoreRetry(() => updateDoc(userDocRef, { last_login: new Date().toISOString() }));
                  
                  // Log a visit notification only when last_login is updated (max once per hour)
                  await withFirestoreRetry(() => addDoc(collection(db, 'notifications'), {
                      type: 'visit',
                      userId: firebaseUser.uid,
                      message: `User ${firebaseUser.email} visited the site`,
                      timestamp: serverTimestamp(),
                      read: false
                  }));
                } catch (e) {
                  console.error("Failed to update last login or log visit", e);
                }
              }
              
              setUserData(data);
            } else {
              // If user doc doesn't exist, create a default one with referral linking
              let referredBy = '';
              let referrerUid = '';
              const storedRefCode = (
                localStorage.getItem('poolmining_referral_code') || 
                sessionStorage.getItem('poolmining_referral_code') || 
                ''
              ).trim().toUpperCase();

              if (storedRefCode) {
                try {
                  const refQuery = query(collection(db, 'users'), where('referral_code', '==', storedRefCode), limit(1));
                  const refSnap = await getDocs(refQuery);
                  if (!refSnap.empty) {
                    const referrerDoc = refSnap.docs[0];
                    if (referrerDoc.id !== firebaseUser.uid) {
                      referredBy = storedRefCode;
                      referrerUid = referrerDoc.id;
                    }
                  }
                } catch (lookupErr) {
                  console.warn("Referral code lookup on user creation error:", lookupErr);
                }
              }

              const newUserData: Record<string, any> = {
                name: firebaseUser.displayName || '',
                email: firebaseUser.email || '',
                phone: firebaseUser.phoneNumber || '',
                role: (firebaseUser.email === 'why.wd.ww.do@gmail.com' || firebaseUser.email === 'limitl3xx.007@gmail.com') ? 'admin' : 'user',
                balance: 0,
                balances: {
                  BTC: 0,
                  ETH: 0,
                  USDT: 0,
                  SOL: 0
                },
                joined_date: new Date().toISOString(),
                verification_status: 'pending',
                referral_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
                referral_count: 0,
                referral_earnings: 0,
                level: 1,
                onboarding_completed: false,
                is_blocked: false,
                trade_enabled: false,
                last_login: new Date().toISOString()
              };

              if (referredBy) {
                newUserData.referred_by = referredBy;
              }
              if (referrerUid) {
                newUserData.referred_by_uid = referrerUid;
              }

              const newData = newUserData as UserData;

              try {
                await withFirestoreRetry(() => setDoc(userDocRef, newData), 3, 500);
                setUserData(newData);

                // If referred, log referral entry & notification
                if (referredBy && referrerUid) {
                  try {
                    await addDoc(collection(db, 'referrals'), {
                      referrer_uid: referrerUid,
                      referrer_code: referredBy,
                      referred_uid: firebaseUser.uid,
                      referred_email: firebaseUser.email || '',
                      referred_name: firebaseUser.displayName || 'New Miner',
                      status: 'active',
                      commission_earned: 0,
                      total_spent: 0,
                      timestamp: serverTimestamp(),
                      created_at: new Date().toISOString()
                    });

                    // Increment referrer count
                    const referrerRef = doc(db, 'users', referrerUid);
                    const referrerSnap = await getDoc(referrerRef);
                    if (referrerSnap.exists()) {
                      const currentCount = referrerSnap.data().referral_count || 0;
                      await updateDoc(referrerRef, { referral_count: currentCount + 1 });
                    }

                    // Send notification to referrer
                    await addDoc(collection(db, 'notifications'), {
                      type: 'referral',
                      userId: referrerUid,
                      message: `🎉 New Referral: User (${firebaseUser.email || 'Miner'}) joined using your referral link!`,
                      timestamp: serverTimestamp(),
                      read: false
                    });

                    // Clear used referral code from local storage
                    localStorage.removeItem('poolmining_referral_code');
                    sessionStorage.removeItem('poolmining_referral_code');
                  } catch (refLogErr) {
                    console.warn("Failed to complete referral logging:", refLogErr);
                  }
                }
              } catch (error) {
                console.error("Error creating user doc", error);
                handleFirestoreError(error, OperationType.WRITE, `users/${firebaseUser.uid}`);
              }
            }
            setLoading(false);
          }, (error) => {
            console.error("Firebase onSnapshot error", error);
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
      } catch (err) {
        console.error("Auth state handling error", err);
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
      {loading ? <PageSuspenseFallback /> : children}
    </AuthContext.Provider>
  );
};
