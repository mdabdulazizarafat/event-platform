'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { message } from 'antd';

export interface User {
  username: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Validate session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const response = await fetch('/api/v1/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (emailOrUsername: string, password: string): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      if (!response.ok) {
        let errorMessage = 'Login failed. Please check your credentials.';
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch (e) {
          try {
            const text = await response.text();
            errorMessage = text || errorMessage;
          } catch (textErr) {}
        }
        throw new Error(errorMessage);
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (err) {
        throw new Error('Received invalid response format from server.');
      }

      setUser(data.user);
      message.success('Successfully logged in!');
      return true;
    } catch (error: any) {
      message.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await fetch('/api/v1/auth/logout', { method: 'POST' });
      setUser(null);
      message.success('Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
      message.error('An error occurred during logout.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
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
