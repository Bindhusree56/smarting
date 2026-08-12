import { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('smartshg_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.preferredLanguage) {
      i18n.changeLanguage(user.preferredLanguage);
      localStorage.setItem('smartshg_lang', user.preferredLanguage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.preferredLanguage]);

  const persistSession = (token, userData) => {
    localStorage.setItem('smartshg_token', token);
    localStorage.setItem('smartshg_user', JSON.stringify(userData));
    setUser(userData);
  };

  const login = async (mobile, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { mobile, password });
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      persistSession(data.token, data.user);
      return { success: true };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('smartshg_token');
    localStorage.removeItem('smartshg_user');
    setUser(null);
  };

  const setLanguage = async (language) => {
    i18n.changeLanguage(language);
    localStorage.setItem('smartshg_lang', language);
    if (user) {
      const updated = { ...user, preferredLanguage: language };
      localStorage.setItem('smartshg_user', JSON.stringify(updated));
      setUser(updated);
      try {
        await api.put('/auth/language', { language });
      } catch {
        // Non-fatal: language preference stays local even if the sync fails
      }
    }
  };

  const updateUserGroup = (groupId) => {
    if (!user) return;
    const updated = { ...user, group: groupId };
    localStorage.setItem('smartshg_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, setLanguage, updateUserGroup }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
