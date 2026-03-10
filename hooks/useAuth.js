// hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentUser, setCurrentUser } from '../firebase/config';
import { getUserData } from '../firebase/auth';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
      setUserData(storedUser);
    }
    setLoading(false);
  }, []);

  const refreshUserData = async () => {
    if (user) {
      const data = await getUserData(user.id);
      setUserData(data);
      if (data) {
        setCurrentUser(data);
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, refreshUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
