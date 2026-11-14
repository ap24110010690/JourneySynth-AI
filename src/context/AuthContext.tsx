// src/context/AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/frontend';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('journeysynth_token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { user } = await authService.getMe();
        setUser(user);
        localStorage.setItem('journeysynth_user', JSON.stringify(user));
      } catch (err) {
        console.warn('Stored token was invalid or expired');
        localStorage.removeItem('journeysynth_token');
        localStorage.removeItem('journeysynth_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (data: { email: string; password: string }) => {
    const res = await authService.login(data);
    localStorage.setItem('journeysynth_token', res.token);
    localStorage.setItem('journeysynth_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const register = async (data: { name: string; email: string; password: string; confirmPassword: string }) => {
    const res = await authService.register(data);
    localStorage.setItem('journeysynth_token', res.token);
    localStorage.setItem('journeysynth_user', JSON.stringify(res.user));
    setUser(res.user);
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
