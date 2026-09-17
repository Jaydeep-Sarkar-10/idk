import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../api/auth';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const userData = await authAPI.getMe(token);
          setUser(userData);
        } catch (err) {
          console.error('Session invalid, clearing auth');
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authAPI.login(credentials);
    localStorage.setItem('access_token', data.access);
    setUser(data.user);
  };

  const googleLogin = async (idToken) => {
    const data = await authAPI.googleLogin(idToken);
    localStorage.setItem('access_token', data.access);
    setUser(data.user);
  };

  const signup = async (userData) => {
    const data = await authAPI.signup(userData);
    localStorage.setItem('access_token', data.access);
    setUser(data.user);
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await authAPI.logout(token);
    } catch (err) {
      console.error('Logout error', err);
    } finally {
      localStorage.removeItem('access_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, googleLogin, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
