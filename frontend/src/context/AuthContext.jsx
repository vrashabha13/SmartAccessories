import { createContext, useContext, useMemo, useState } from 'react';
import { logout as logoutApi } from '../services/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'authToken';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));

  const login = (newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
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
    setToken(null);
  };

  const value = useMemo(
    () => ({
      token,
      isAuthenticated: Boolean(token),
      login,
      logout,
    }),
    [token]
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
