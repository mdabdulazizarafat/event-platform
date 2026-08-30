'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { App } from 'antd';

export interface User {
  username: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  bio?: string;
  role?: string;
  mobile?: string;
  phone?: string;
  phoneNumber?: string;
  org?: string;
  organization?: string;
  jobTitle?: string;
  status?: string;
  dateOfBirth?: string;
  gender?: string;
  university?: string;
  classLevel?: string;
  district?: string;
  occupationType?: 'student' | 'job';
  institutionName?: string;
  position?: string;
  organizerStatus?: string;
  rejectionCount?: number;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (emailOrUsername: string, password: string) => Promise<boolean>;
  registerUser: (data: {
    username?: string;
    name?: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    code: string;
    role?: 'USER' | 'ORGANIZER';
    mobile?: string;
    org?: string;
  }) => Promise<{ success: boolean; message: string }>;
  updateUserProfile: (data: {
    name?: string;
    email?: string;
    mobile?: string;
    avatar?: string;
    bio?: string;
    org?: string;
    role?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    occupationType?: string;
    institutionName?: string;
    classLevel?: string;
    position?: string;
    district?: string;
  }) => Promise<boolean>;
  refetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { message } = App.useApp();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkSession = async () => {
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
  };

  // Validate session on load
  useEffect(() => {
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

  const registerUser = async (data: {
    username?: string;
    name?: string;
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    code: string;
    role?: 'USER' | 'ORGANIZER';
    mobile?: string;
    org?: string;
  }): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Registration failed');
      }

      message.success(resData.message || 'Successfully registered!');
      return { success: true, message: resData.message };
    } catch (error: any) {
      message.error(error.message);
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (data: {
    name?: string;
    email?: string;
    mobile?: string;
    avatar?: string;
    bio?: string;
    org?: string;
    role?: string;
    status?: string;
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    gender?: string;
    occupationType?: string;
    institutionName?: string;
    classLevel?: string;
    position?: string;
    district?: string;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.error || 'Failed to update profile');
      }

      setUser(resData.user);
      message.success('Profile updated successfully!');
      return true;
    } catch (error: any) {
      message.error(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, registerUser, updateUserProfile, refetchUser: checkSession, logout }}>
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
