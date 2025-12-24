import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // { id, name, email, role }
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(res.data.data);
      } catch (err) {
        console.error('AuthContext: failed to fetch me', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.data); // data contains id, name, email, role per your friend's controller
        return { success: true, user: res.data.data };
      }
      return { success: false, error: 'Invalid response' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message || 'Login failed' };
    }
  };

  const register = async (registrationData) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', registrationData);
      if (res.data && res.data.token) {
        localStorage.setItem('token', res.data.token);
        setUser(res.data.data);
        return { success: true, user: res.data.data };
      }
      return { success: false, error: 'Invalid response' };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || err.message || 'Register failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
