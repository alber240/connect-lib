import React, { createContext, useState, useContext, useEffect } from 'react';
import { userLogin, userLogout, isUserLoggedIn, getCurrentUser } from '../services/api';

const UserAuthContext = createContext();

export const useUserAuth = () => useContext(UserAuthContext);

export const UserAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Fallback to username only
        const username = getCurrentUser();
        if (username) {
          setUser({ username });
        }
      }
    } else if (isUserLoggedIn()) {
      // Legacy check
      const username = getCurrentUser();
      if (username) {
        setUser({ username });
      }
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const result = await userLogin(username, password);
      if (result && result.access) {
        // Store tokens
        localStorage.setItem('access_token', result.access);
        if (result.refresh) {
          localStorage.setItem('refresh_token', result.refresh);
        }
        
        // Get user data from the API if available
        try {
          const userResponse = await fetch('https://connect-lib.onrender.com/api/user/', {
            headers: {
              'Authorization': `Bearer ${result.access}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            const fullUser = {
              id: userData.id,
              username: userData.username || username,
              email: userData.email || '',
              first_name: userData.first_name || '',
              last_name: userData.last_name || '',
              ...userData
            };
            localStorage.setItem('user', JSON.stringify(fullUser));
            setUser(fullUser);
            return { success: true, user: fullUser };
          }
        } catch (error) {
          console.warn('Could not fetch user details:', error);
        }
        
        // Fallback: store username only
        const userData = { username, isAuthenticated: true };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Helper to check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('access_token') && !!user;
  };

  return (
    <UserAuthContext.Provider 
      value={{ 
        user, 
        login, 
        logout, 
        loading, 
        isAuthenticated: isAuthenticated(),
        refreshUser: () => {
          // Force refresh user data from localStorage
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              setUser(JSON.parse(savedUser));
            } catch {
              setUser(null);
            }
          }
        }
      }}
    >
      {children}
    </UserAuthContext.Provider>
  );
};