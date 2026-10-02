import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types/index.js';
import { api } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, pass: string) => Promise<User>;
  signup: (formData: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  isTeacher: boolean;
  isStudent: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('smit_user') || localStorage.getItem('webcraft_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('smit_token') || localStorage.getItem('webcraft_token');
  });
  const [isLoading, setIsLoading] = useState<boolean>(() => {
    const savedToken = localStorage.getItem('smit_token') || localStorage.getItem('webcraft_token');
    const savedUser = localStorage.getItem('smit_user') || localStorage.getItem('webcraft_user');
    // Instant zero-latency rendering if not logged in or already cached
    if (!savedToken) return false;
    if (savedUser) return false;
    return true;
  });

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }
    try {
      const res = await api.getMe();
      if (res.data?.success && res.data.data) {
        const profileData = res.data.data;
        const mappedUser: User = {
          id: profileData.id,
          role: profileData.role,
          username: profileData.username,
          email: profileData.email,
          fullName: profileData.profile?.full_name || profileData.username,
          avatarUrl: profileData.profile?.avatar_url || '',
          rollNumber: profileData.profile?.roll_number,
          mobileNumber: profileData.profile?.mobile_number,
          isDropped: !!profileData.is_dropped || !!profileData.profile?.is_dropped,
          droppedReason: profileData.dropped_reason || profileData.profile?.dropped_reason,
        };
        setUser(mappedUser);
        localStorage.setItem('smit_user', JSON.stringify(mappedUser));
      }
    } catch (err: any) {
      // Only clear credentials if backend explicitly responded with 401 Unauthorized
      if (err.response?.status === 401) {
        console.warn('[AuthContext] Session expired (401)');
        setUser(null);
        setToken(null);
        localStorage.removeItem('smit_token');
        localStorage.removeItem('smit_user');
        localStorage.removeItem('webcraft_token');
        localStorage.removeItem('webcraft_user');
      } else {
        console.warn('[AuthContext] Background refresh transient error (retaining cached user):', err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (identifier: string, pass: string): Promise<User> => {
    const res = await api.login({ identifier, password: pass });
    if (res.data?.success && res.data.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('smit_token', newToken);
      localStorage.setItem('smit_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data?.message || 'Login failed');
  };

  const signup = async (formData: any): Promise<User> => {
    const res = await api.signup(formData);
    if (res.data?.success && res.data.data) {
      const { token: newToken, user: userData } = res.data.data;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('smit_token', newToken);
      localStorage.setItem('smit_user', JSON.stringify(userData));
      return userData;
    }
    throw new Error(res.data?.message || 'Signup failed');
  };

  const logout = () => {
    try {
      api.login({ identifier: '', password: '' }).catch(() => {});
    } catch (e) {}
    setUser(null);
    setToken(null);
    localStorage.removeItem('smit_token');
    localStorage.removeItem('smit_user');
    localStorage.removeItem('webcraft_token');
    localStorage.removeItem('webcraft_user');
  };

  const isAuthenticated = !!user && !!token;
  const isTeacher = user?.role === 'teacher';
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        signup,
        logout,
        refreshUser,
        isAuthenticated,
        isTeacher,
        isStudent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Resilient fallback during HMR or mounting transitions to prevent screen crashes
    const saved = typeof window !== 'undefined' ? (localStorage.getItem('smit_user') || localStorage.getItem('webcraft_user')) : null;
    const user = saved ? JSON.parse(saved) : null;
    const token = typeof window !== 'undefined' ? (localStorage.getItem('smit_token') || localStorage.getItem('webcraft_token')) : null;
    return {
      user,
      token,
      isLoading: false,
      login: async () => ({} as any),
      signup: async () => ({} as any),
      logout: () => {},
      refreshUser: async () => {},
      isAuthenticated: !!(user && token),
      isTeacher: user?.role === 'teacher',
      isStudent: user?.role === 'student',
    };
  }
  return context;
};
