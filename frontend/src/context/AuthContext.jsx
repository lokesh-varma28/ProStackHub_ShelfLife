import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('shelflife_token'));
  const [loading, setLoading] = useState(true);

  // Restore authentication state on initial load or token change
  const restoreAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('shelflife_token');
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    try {
      const data = await authAPI.getMe();
      if (data.success && data.user) {
        setUser(data.user);
        setToken(savedToken);
      } else {
        localStorage.removeItem('shelflife_token');
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.error('Session restoration failed:', err);
      localStorage.removeItem('shelflife_token');
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    restoreAuth();
  }, [restoreAuth]);

  const login = async (email, password) => {
    const data = await authAPI.login({ email, password });
    if (data.success && data.token) {
      localStorage.setItem('shelflife_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } else {
      throw new Error(data.message || 'Login failed');
    }
  };

  const register = async (name, email, password) => {
    const data = await authAPI.register({ name, email, password });
    if (data.success && data.token) {
      localStorage.setItem('shelflife_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data;
    } else {
      throw new Error(data.message || 'Registration failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('shelflife_token');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user && !!token,
    login,
    register,
    logout,
    restoreAuth,
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

export default AuthContext;
