import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Set up axios instance to automatically include credentials (cookies)
  const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    withCredentials: true,
  });

  useEffect(() => {
    // Check local storage for user info on initial load
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    const response = await api.post('/auth/signin', { username, password });
    if (response.data) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setCurrentUser(response.data);
    }
    return response.data;
  };

  const register = async (username, email, password) => {
    return api.post('/auth/signup', { username, email, password });
  };

  const logout = async () => {
    try {
      await api.post('/auth/signout');
    } catch (e) {
      console.error('Logout error', e);
    } finally {
      localStorage.removeItem('user');
      setCurrentUser(null);
    }
  };

  const value = {
    currentUser,
    login,
    register,
    logout,
    api,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
