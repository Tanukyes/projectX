import React, { useState, useEffect } from 'react';
//import { useDataLoader } from '../services/dataLoader';
import axios from 'axios';
import './AdminPage.css';

function AdminPage() {
  //const { data, error, loading } = useDataLoader('/api/admin');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [newPattern, setNewPattern] = useState(''); // Новое состояние для шаблона

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
      }
    };

    fetchRoles();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFeedback('');
    try {
      await axios.post('http://localhost:5000/api/auth/register', { username, email, password, role });
      setFeedback('Пользователь успешно создан.');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error) {
      setFeedback('Ошибка создания пользователя, попробуйте снова.');
      console.error(error);
    }
  };

  const handleAddPattern = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/get_patterns');
      const patterns = response.data.patterns;
      patterns.push(newPattern);

      await axios.post('http://localhost:5000/api/save_patterns', { patterns });
      setFeedback('Шаблон успешно добавлен.');
      setNewPattern('');
    } catch (error) {
      setFeedback('Ошибка добавления шаблона, попробуйте снова.');
      console.error(error);
    }
  };

  return (
    <div className="app-container">
      <h2>Страница администратора</h2>
      <h3>Создать нового пользователя</h3>
      {feedback && <p className="feedback">{feedback}</p>}
      <form onSubmit={handleCreateUser} className="user-form">
        <input type="text" placeholder="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <select value={role} onChange={(e) => setRole(e.target.value)} required>
          {roles.map((r) => (
            <option key={r.id} value={r.name}>{r.name}</option>
          ))}
        </select>
        <button type="submit">Создать пользователя</button>
      </form>

      {/* Секция добавления шаблона */}
      <h3>Добавить новый шаблон</h3>
      <input type="text" placeholder="Новый шаблон" value={newPattern} onChange={(e) => setNewPattern(e.target.value)} />
      <button onClick={handleAddPattern}>Добавить шаблон</button>
    </div>
  );
}

export default AdminPage;
