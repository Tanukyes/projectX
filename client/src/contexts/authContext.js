import React, { createContext, useState, useEffect } from 'react';
import { getUserRoleFromToken, isAuthenticated } from '../services/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const role = getUserRoleFromToken();
        setIsAuth(true);
        setUserRole(role);
      } else {
        setIsAuth(false);
        setUserRole('');
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, userRole, setIsAuth, setUserRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
