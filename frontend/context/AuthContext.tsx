'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, fullName: string) => Promise<User>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = typeof window !== 'undefined' ? localStorage.getItem('ghwf_token') : null;
    const storedUser = typeof window !== 'undefined' ? localStorage.getItem('ghwf_user') : null;

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser) as User;
          setUser(parsedUser);
          setLoading(false);
          fetchProfile(storedToken, true);
        } catch {
          localStorage.removeItem('ghwf_user');
          fetchProfile(storedToken, false);
        }
      } else {
        fetchProfile(storedToken, false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const handleActivity = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        logout();
      }, 15 * 60 * 1000);
    };

    const events = ['mousemove', 'keydown', 'mousedown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    handleActivity();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [user]);

  const fetchProfile = async (authToken: string, silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem('ghwf_user', JSON.stringify(data.user));
        }
      } else {
        localStorage.removeItem('ghwf_token');
        localStorage.removeItem('ghwf_user');
        setToken(null);
        setUser(null);
      }
    } catch (e) {
      console.error('Error fetching profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (token) await fetchProfile(token, true);
  };

  const login = async (email: string, password: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }
      localStorage.setItem('ghwf_token', data.token);
      localStorage.setItem('ghwf_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<User> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, full_name: fullName })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create student account.');
      }
      localStorage.setItem('ghwf_token', data.token);
      localStorage.setItem('ghwf_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (token) {
        await fetch('/api/v1/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.error('Error logging out:', e);
    } finally {
      localStorage.removeItem('ghwf_token');
      localStorage.removeItem('ghwf_user');
      setToken(null);
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
