'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { authApi, LoginRequest, RegisterRequest } from '@/lib/api';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = Cookies.get('auth_token');
    if (savedToken) {
      setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);
      if (response && response.token) {
        setToken(response.token);
        Cookies.set('auth_token', response.token, { expires: 7 });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error: any) {
      console.error('Auth login error:', error);
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data);
    setToken(response.token);
    Cookies.set('auth_token', response.token, { expires: 7 });
  };

  const logout = () => {
    setToken(null);
    Cookies.remove('auth_token');
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!token,
        token,
        login,
        register,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

