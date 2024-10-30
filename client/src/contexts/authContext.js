import React, { createContext, useState, useEffect } from 'react';
import { getUserRoleFromToken, isAuthenticated, getUsernameFromToken } from '../services/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [username, setUsername] = useState(''); // Добавляем username

  useEffect(() => {
    const checkAuth = () => {
      if (isAuthenticated()) {
        const role = getUserRoleFromToken();
        const name = getUsernameFromToken(); // Извлекаем username из токена
        setIsAuth(true);
        setUserRole(role);
        setUsername(name);
      } else {
        setIsAuth(false);
        setUserRole('');
        setUsername('');
      }
    };

    checkAuth();
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuth, userRole, username, setIsAuth, setUserRole, setUsername }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
