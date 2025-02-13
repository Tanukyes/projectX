import React, { createContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserRoleFromToken, getUsernameFromToken, logout } from '../services/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());
  const [userRole, setUserRole] = useState(getUserRoleFromToken());
  const [username, setUsername] = useState(getUsernameFromToken());

  useEffect(() => {
  const checkAuth = () => {
    const authStatus = isAuthenticated();
    setIsAuth(authStatus);
    if (authStatus) {
      setUserRole(getUserRoleFromToken());
      setUsername(getUsernameFromToken());
    } else {
      setUserRole('');
      setUsername('');
    }
  };

  checkAuth();

    const savedRoute = localStorage.getItem('currentRoute');
  if (savedRoute) {
    window.history.replaceState({}, '', savedRoute);
  }

    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUserRole('');
    setUsername('');
    localStorage.removeItem('currentRoute');
  };

  return (
    <AuthContext.Provider value={{ isAuth, userRole, username, setIsAuth, setUserRole, setUsername, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };