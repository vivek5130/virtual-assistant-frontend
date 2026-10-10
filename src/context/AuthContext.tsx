import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { api, getToken, setToken } from '../lib/api';
import type { User } from '../lib/types';

type AuthState = {
  user: User | null;
  ready: boolean;
  login: (identifier: string, password: string) => Promise<User>;
  loginWithGoogle: (credential: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!getToken()) return setReady(true);
    api<{ user: User }>('/auth/me')
      .then((r) => setUser(r.user))
      .catch(() => setToken(null))
      .finally(() => setReady(true));
  }, []);

  const finish = useCallback((r: { token: string; user: User }) => {
    setToken(r.token);
    setUser(r.user);
    window.dispatchEvent(new Event('ss:identity'));
    return r.user;
  }, []);

  const value: AuthState = {
    user,
    ready,
    login: (identifier, password) => api<{ token: string; user: User }>('/auth/login', { method: 'POST', body: { identifier, password } }).then(finish),
    loginWithGoogle: (credential) => api<{ token: string; user: User }>('/auth/google', { method: 'POST', body: { credential } }).then(finish),
    register: (name, email, password) =>
      api<{ token: string; user: User }>('/auth/register', { method: 'POST', body: { name, email, password } }).then(finish),
    logout: () => {
      setToken(null);
      setUser(null);
      window.dispatchEvent(new Event('ss:identity'));
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
