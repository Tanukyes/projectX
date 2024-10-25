import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuth, userRole } = useContext(AuthContext);

  // Если пользователь не авторизован, перенаправляем на страницу логина
  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  // Если роль пользователя не соответствует требуемой, перенаправляем на пользовательскую панель
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default PrivateRoute;
