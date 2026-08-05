import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { logout as logoutApi, fetchProfile } from '../services/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'authToken';
const USER_KEY = 'authUser';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (token && !user) {
      fetchProfile(token)
        .then((profile) => {
          setUser(profile);
          localStorage.setItem(USER_KEY, JSON.stringify(profile));
        })
        .catch(() => {
          logout();
        });
    }
  }, [token]);

  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken && token) {
        setToken(null);
        setUser(null);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    const interval = setInterval(() => {
      const currentToken = localStorage.getItem(TOKEN_KEY);
      if (!currentToken && token) {
        setToken(null);
        setUser(null);
      }
    }, 200);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [token]);

  const login = (newToken, userData) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setToken(newToken);
    setUser(userData);
  };

  const logout = async () => {
    if (token) {
      try {
        await logoutApi(token);
      } catch {
        // Clear local session even if server logout fails
      }
    }
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
