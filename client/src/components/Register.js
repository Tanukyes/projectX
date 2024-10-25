import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css'; // Подключаем стили

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post('http://localhost:5000/register', {
        username,
        email,
        password,
        role
      });
      navigate('/login');  // Перенаправляем на страницу логина после успешной регистрации
    } catch (error) {
      setError('Ошибка регистрации, попробуйте снова.');
    }
  };

  return (
    <div className="app-container">
      <h2>Register</h2>

      {/* Добавлены атрибуты id и name */}
      <input
        type="text"
        id="username"
        name="username"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        type="email"
        id="email"
        name="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        id="password"
        name="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <select
        id="role"
        name="role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>

      {error && <p className="error">{error}</p>}

      <button onClick={handleRegister}>Register</button>
    </div>
  );
}

export default Register;
