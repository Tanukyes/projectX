import React, { createContext, useState, useEffect } from 'react';
import { isAuthenticated, getUserRoleFromToken, getUsernameFromToken, logout } from '../services/auth';

// Создаем контекст аутентификации
const AuthContext = createContext();

// Провайдер контекста аутентификации
const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(isAuthenticated());  // Состояние аутентификации
  const [userRole, setUserRole] = useState(getUserRoleFromToken());  // Роль пользователя
  const [username, setUsername] = useState(getUsernameFromToken());  // Имя пользователя

  // Проверка аутентификации и обновление состояния
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

    // Проверяем аутентификацию при загрузке и при изменении в localStorage
    checkAuth();
    window.addEventListener('storage', checkAuth); // Следим за изменениями в localStorage

    return () => window.removeEventListener('storage', checkAuth);
  }, []);

  // Функция выхода из системы
  const handleLogout = () => {
    logout();
    setIsAuth(false);
    setUserRole('');
    setUsername('');
  };

  return (
    <AuthContext.Provider value={{ isAuth, userRole, username, setIsAuth, setUserRole, setUsername, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };