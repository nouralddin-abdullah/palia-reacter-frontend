import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validate token on mount via GET /auth/me
    const token = localStorage.getItem('vote_token');
    if (token) {
      api.getMe()
        .then((userData) => {
          setUser(userData);
          localStorage.setItem('vote_user', JSON.stringify(userData));
        })
        .catch(() => {
          // Token invalid/expired — clear session
          localStorage.removeItem('vote_token');
          localStorage.removeItem('vote_user');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (email, password) => {
    const res = await api.login(email, password);
    localStorage.setItem('vote_token', res.token);
    localStorage.setItem('vote_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const signupUser = async ({ username, email, password }) => {
    const res = await api.signup({ username, email, password });
    localStorage.setItem('vote_token', res.token);
    localStorage.setItem('vote_user', JSON.stringify(res.user));
    setUser(res.user);
    return res.user;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('vote_user');
    localStorage.removeItem('vote_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginUser, signupUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
