import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';

const PrivateRoute = ({ children, allowedRole }) => {
  const { isAuth, userRole } = useContext(AuthContext);

  if (!isAuth){
    return <Navigate to="/login" />;
  }
  if (allowedRole && userRole !== allowedRole) {
    return <Navigate to="/dashboard"/>;
  }

  return children;
};

export default PrivateRoute;
