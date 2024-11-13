import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPost } from '../services/api';
import './AdminPage.css';

function AdminPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('');

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/roles');
        setRoles(response.data);
      } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
      }
    };

    const fetchPatterns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/get_patterns');
        setPatterns(response.data.patterns);
      } catch (error) {
        console.error('Ошибка при загрузке шаблонов:', error);
      }
    };

    fetchRoles();
    fetchPatterns();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setFeedback('');
    try {
      await apiPost('/api/auth/register', { username, email, password, role });
      setFeedback('Пользователь успешно создан.');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
    } catch (error) {
      if (error.response && error.response.data && error.response.data.msg) {
        setFeedback(error.response.data.msg);
      } else {
        setFeedback('Ошибка создания пользователя, попробуйте снова.');
      }
      console.error(error);
    }
  };

  const handleAddPattern = async () => {
    if (!newPattern) {
      setFeedback('Введите название шаблона для добавления.');
      return;
    }

    try {
      const updatedPatterns = [...patterns, newPattern];
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      setFeedback('Шаблон успешно добавлен.');
      setPatterns(updatedPatterns);
      setNewPattern('');
    } catch (error) {
      setFeedback('Ошибка добавления шаблона, попробуйте снова.');
      console.error(error);
    }
  };

  const handleDeletePattern = async () => {
    if (!selectedPattern) {
      setFeedback('Выберите шаблон для удаления.');
      return;
    }

    try {
      const updatedPatterns = patterns.filter((pattern) => pattern !== selectedPattern);
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      setFeedback('Шаблон успешно удален.');
      setPatterns(updatedPatterns);
      setSelectedPattern('');
    } catch (error) {
      setFeedback('Ошибка удаления шаблона, попробуйте снова.');
      console.error(error);
    }
  };

  return (
    <div className="admin-page-container">
      <h2>Страница администратора</h2>

      {feedback && <p className="feedback">{feedback}</p>}

      <div className="admin-section">
        <h3>Создать нового пользователя</h3>
        <form onSubmit={handleCreateUser} className="user-form">
          <input
            type="text"
            placeholder="Имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} required>
            {roles.map((r) => (
              <option key={r.id} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
          <button type="submit">Создать пользователя</button>
        </form>
      </div>

      <div className="admin-section">
        <h3>Управление шаблонами (Добродел)</h3>

        <div className="pattern-management">
          <div className="pattern-input">
            <input
              type="text"
              placeholder="Новый шаблон"
              value={newPattern}
              onChange={(e) => setNewPattern(e.target.value)}
            />
            <button onClick={handleAddPattern}>Добавить шаблон</button>
          </div>

          <div className="pattern-delete">
            <select
              value={selectedPattern}
              onChange={(e) => setSelectedPattern(e.target.value)}
            >
              <option value="">Выберите шаблон для удаления</option>
              {patterns.map((pattern, index) => (
                <option key={index} value={pattern}>
                  {pattern}
                </option>
              ))}
            </select>
            <button onClick={handleDeletePattern}>Удалить шаблон</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
