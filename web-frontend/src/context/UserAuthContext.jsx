import React, { createContext, useState, useContext, useEffect } from 'react';
import { userLogin, userLogout, isUserLoggedIn, getCurrentUser } from '../services/api';

const UserAuthContext = createContext();

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isUserLoggedIn()) {
      setUser({ username: getCurrentUser() });
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const result = await userLogin(username, password);
      if (result && result.access) {
        setUser({ username });
        return { success: true };
      }
      return { success: false, error: 'Invalid response from server' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.error || 'Login failed' };
    }
  };

  const logout = () => {
    userLogout();
    setUser(null);
  };

  return (
    <UserAuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </UserAuthContext.Provider>
  );
};