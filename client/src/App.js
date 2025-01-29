import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import AdminPage from './components/AdminPage/AdminPage';
import TimeLogs from "./components/TimeLogs/TimeLogs";
import PrivateRoute from './components/PrivateRoute';
import { AuthProvider } from './contexts/authContext';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/time-logs"
            element={
              <PrivateRoute allowedRole={['t-user', 'powT-user']}>
                <TimeLogs />
              </PrivateRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute allowedRole={['user', 'upUser', 'smena', 'upSmena', 'powUser', 't-user', 'powT-user']}>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <PrivateRoute allowedRole="admin">
                <AdminPage />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
