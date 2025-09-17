import React from 'react';

const authContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const value = {
    currentUser: { uid: 'test-uid', email: 'test@example.com' },
    login: jest.fn(),
    signup: jest.fn(),
    logout: jest.fn(),
    resetPassword: jest.fn()
  };

  return (
    <authContext.Provider value={value}>
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => ({
  currentUser: { uid: 'test-uid', email: 'test@example.com' },
  login: jest.fn(),
  signup: jest.fn(),
  logout: jest.fn(),
  resetPassword: jest.fn()
});

export const AuthContext = authContext;