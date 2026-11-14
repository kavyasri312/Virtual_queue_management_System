import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (savedUser && token) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, ...userData } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    return userData;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token, ...registeredUser } = response.data;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(registeredUser));
    setUser(registeredUser);
    return registeredUser;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/login';
  };

  const refreshProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      const updated = { ...user, ...response.data };
      localStorage.setItem('user', JSON.stringify(updated));
      setUser(updated);
      return updated;
    } catch (e) {
      // ignored
    }
  };

  const isCustomer = user?.role === 'ROLE_CUSTOMER';
  const isStaff = user?.role === 'ROLE_STAFF';
  const isAdmin = user?.role === 'ROLE_ADMIN';

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshProfile,
        isCustomer,
        isStaff,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
