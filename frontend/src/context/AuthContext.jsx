import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('store_rating_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('store_rating_token') || null);
  const [loading, setLoading] = useState(true);

  // Validate stored session on initial mount
  useEffect(() => {
    const verifySession = async () => {
      const storedToken = localStorage.getItem('store_rating_token');
      if (storedToken) {
        try {
          const res = await authService.getMe();
          if (res.success && res.user) {
            setUser(res.user);
            localStorage.setItem('store_rating_user', JSON.stringify(res.user));
          } else {
            logout();
          }
        } catch (err) {
          console.warn('Session verification failed, clearing auth cache.');
          logout();
        }
      }
      setLoading(false);
    };

    verifySession();
  }, []);

  const login = async (email, password) => {
    const data = await authService.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('store_rating_token', data.token);
      localStorage.setItem('store_rating_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      localStorage.setItem('store_rating_token', data.token);
      localStorage.setItem('store_rating_user', JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
    }
    return data;
  };

  const logout = () => {
    authService.logout();
    localStorage.removeItem('store_rating_token');
    localStorage.removeItem('store_rating_user');
    setToken(null);
    setUser(null);
  };

  const getDashboardPath = (role) => {
    const targetRole = role || (user ? user.role : null);
    switch (targetRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'OWNER':
        return '/owner/dashboard';
      case 'USER':
      default:
        return '/user/dashboard';
    }
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    register,
    logout,
    getDashboardPath
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
