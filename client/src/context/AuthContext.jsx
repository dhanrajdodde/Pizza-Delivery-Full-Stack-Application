import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('pizzaverse_user');
      if (!savedUser) return null;
      const parsed = JSON.parse(savedUser);
      return { ...parsed, isVerified: true };
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('pizzaverse_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
            localStorage.setItem('pizzaverse_user', JSON.stringify(res.data.user));
          }
        } catch (err) {
          console.warn('Auth check failed:', err.message);
          logout();
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pizzaverse_token', res.data.token);
      localStorage.setItem('pizzaverse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const res = await api.post('/auth/admin-login', { email, password });
    if (res.data.success) {
      setToken(res.data.token);
      setUser(res.data.user);
      localStorage.setItem('pizzaverse_token', res.data.token);
      localStorage.setItem('pizzaverse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    return res.data;
  };

  const verifyEmail = async (verificationToken) => {
    const res = await api.post('/auth/verify-email', { token: verificationToken });
    if (user && res.data.success) {
      const updated = { ...user, isVerified: true };
      setUser(updated);
      localStorage.setItem('pizzaverse_user', JSON.stringify(updated));
    }
    return res.data;
  };

  const quickVerify = async (email) => {
    const res = await api.post('/auth/quick-verify', { email });
    if (user && res.data.success) {
      const updated = { ...user, isVerified: true };
      setUser(updated);
      localStorage.setItem('pizzaverse_user', JSON.stringify(updated));
    }
    return res.data;
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.data.success) {
      setUser(res.data.user);
      localStorage.setItem('pizzaverse_user', JSON.stringify(res.data.user));
    }
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('pizzaverse_token');
    localStorage.removeItem('pizzaverse_user');
  };

  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        login,
        adminLogin,
        register,
        verifyEmail,
        quickVerify,
        updateProfile,
        logout,
      }}
    >
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
