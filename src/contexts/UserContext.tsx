import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { auth, db } from '@/src/firebase';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface UserContextType {
  user: FirebaseUser | null;
  role: 'customer' | 'admin' | null;
  loading: boolean;
}

const UserContext = createContext<UserContextType>({
  user: null,
  role: null,
  loading: true,
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'customer' | 'admin' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      
      if (!currentUser) {
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Default admin check
    if (user.email === 'allidon591@gmail.com' && user.emailVerified) {
      setRole('admin');
      setLoading(false);
      return;
    }

    const unsubscribeDoc = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setRole(docSnap.data().role as 'customer' | 'admin');
      } else {
        setRole('customer'); // fallback
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user role:", error);
      setRole('customer');
      setLoading(false);
    });

    return () => unsubscribeDoc();
  }, [user]);

  return (
    <UserContext.Provider value={{ user, role, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
