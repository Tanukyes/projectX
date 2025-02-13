import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuth, userRole } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (isAuth) {
      localStorage.setItem('currentRoute', location.pathname);
    }
  }, [isAuth, location.pathname]);

  // 1. Проверка авторизации
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // 2. Приоритетное перенаправление для t-user и powT-user на /time-logs
  if (['t-user', 'powT-user'].includes(userRole) && location.pathname !== '/time-logs') {
    return <Navigate to="/time-logs" />;
  }

  // 3. Проверка ролей через allowedRole (если передан массив или строка)
  if (Array.isArray(allowedRole) && !allowedRole.includes(userRole)) {
    return <Navigate to={localStorage.getItem('currentRoute') || '/dashboard'} />;
  }

  if (typeof allowedRole === 'string' && allowedRole !== userRole) {
    return <Navigate to={localStorage.getItem('currentRoute') || '/dashboard'} />;
  }

  // 4. Рендеринг дочерних компонентов
  return children;
};

export default PrivateRoute;