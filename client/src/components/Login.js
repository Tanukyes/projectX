import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password
      });

      const token = response.data.access_token;
      if (!token) {
        setError('Не удалось выполнить вход. Пожалуйста, попробуйте снова.');
        return;
      }

      localStorage.setItem('token', token);

      // Декодируем JWT токен и получаем роль
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRole = payload.role ? payload.role.toLowerCase() : '';

        // Логируем роль для проверки правильности
        console.log('User Role:', userRole);

        // Перенаправление в зависимости от роли пользователя
        if (userRole === 'admin') {
          navigate('/admin');
        } else {
          navigate('/dashboard');
        }
      } catch (error) {
        console.error('Ошибка при декодировании токена:', error);
        setError('Неверный токен. Пожалуйста, попробуйте снова.');
      }
    } catch (error) {
      console.error('Ошибка входа:', error);
      setError('Неверный email или пароль.');
    }
  };

  return (
    <div className="app-container">
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
