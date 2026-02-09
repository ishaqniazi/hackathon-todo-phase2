'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Auth Context
const AuthContext = createContext();

// Auth Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, user: action.payload, isAuthenticated: true };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  });

  // Check for existing token on initial load
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      // In a real app, you'd validate the token here
      // For now, we'll just set the user as authenticated
      // This would typically involve a call to a 'me' endpoint
      dispatch({ type: 'SET_USER', payload: { id: 'temp', username: 'temp' } });
    }
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });

      // In a real app, this would be handled by the API skill
      // We're simulating the behavior here
      // const response = await apiSkill.login(credentials);

      // For now, we'll just simulate successful login
      const userData = { id: 1, username: credentials.username };
      localStorage.setItem('accessToken', 'fake-token');

      dispatch({ type: 'LOGIN_SUCCESS', payload: userData });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE', payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      // In a real app, this would call the API
      // await apiSkill.logout();

      localStorage.removeItem('accessToken');
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value = {
    ...state,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};