import React, { useState, useContext } from 'react';
import { apiPost } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/authContext';
import './Login.css';

function Login() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setIsAuth, setUserRole } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await apiPost('/api/auth/login', { emailOrUsername, password });
      const token = response.access_token;
      const role = response.role;

      if (!token) {
        setError('Не удалось выполнить вход. Пожалуйста, попробуйте снова.');
        return;
      }

      localStorage.setItem('token', token);
      setIsAuth(true);
      setUserRole(role);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Неверный email/имя пользователя или пароль.');
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p className="error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="text"
          id="emailOrUsername"
          name="emailOrUsername"
          placeholder="Email или Имя пользователя"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
        />
        <input
          type="password"
          id="password"
          name="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Войти</button>
      </form>
    </div>
  );
}

export default Login;
