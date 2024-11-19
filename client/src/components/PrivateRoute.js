import React, { useContext, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuth, userRole } = useContext(AuthContext);
  const location = useLocation();

  useEffect(() => {
    if (isAuth) {
      localStorage.setItem('currentRoute', location.pathname); // Сохраняем текущий маршрут
    }
  }, [isAuth, location.pathname]);

  if (!isAuth) {
    return <Navigate to="/login" />;
  }

  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to={localStorage.getItem('currentRoute') || '/dashboard'} />;
  }

  return children;
};

export default PrivateRoute;
