import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import * as authApi from '../api/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  // On mount, ask backend if we have a valid session cookie.
  useEffect(() => {
    let cancelled = false;
    authApi
      .fetchMe()
      .then((u) => {
        if (!cancelled) setUser(u);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const u = await authApi.login(email, password);
    setUser(u);
    queryClient.clear();
    return u;
  }, [queryClient]);

  const register = useCallback(async (email, password, fullName) => {
    const u = await authApi.register(email, password, fullName);
    setUser(u);
    queryClient.clear();
    return u;
  }, [queryClient]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = {
    user,
    loading,
    isAuthed: !!user,
    isAdmin: user?.role === 'ADMIN',
    isClient: user?.role === 'CLIENT',
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
