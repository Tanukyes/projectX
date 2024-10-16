import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage';

function App() {
  const getRole = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role ? payload.role.toLowerCase() : null;
    } catch (error) {
      console.error("Failed to decode token:", error);
      return null;
    }
  };

  const ProtectedRoute = ({ element, role }) => {
    const userRole = getRole();
    if (!userRole) return <Navigate to="/login" />;
    return userRole === role ? element : <Navigate to="/dashboard" />;
  };

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<ProtectedRoute element={<AdminPage />} role="admin" />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
