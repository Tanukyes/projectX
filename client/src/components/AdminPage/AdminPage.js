import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPost, apiGet } from '../../services/api';
import './AdminPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

function AdminPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [room, setRoom] = useState('');
  const [fio, setFio] = useState('');
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [newPattern, setNewPattern] = useState('');
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await apiGet('/api/roles');
        setRoles(response);
      } catch (error) {
        console.error('Ошибка при загрузке ролей:', error);
      }
    };

    const fetchPatterns = async () => {
      try {
        const response = await apiGet('/api/get_patterns');
        setPatterns(response.patterns);
      } catch (error) {
        console.error('Ошибка при загрузке шаблонов:', error);
      }
    };

    const fetchUsers = async () => {
      try {
        const response = await apiGet('/api/auth/users');
        setUsers(response);
      } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
      }
    };

    fetchRoles();
    fetchPatterns();
    fetchUsers();
  }, []);

  const showFeedbackMessage = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(''), 2000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await apiPost('/api/auth/register', { username, email, password, role, room, fio });
      showFeedbackMessage('Пользователь успешно создан.');
      setUsername('');
      setEmail('');
      setPassword('');
      setRole('user');
      setRoom('');
      setFio('');
      // Обновляем список пользователей
      const updatedUsers = await apiGet('/api/auth/users');
      setUsers(updatedUsers);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Ошибка создания пользователя, попробуйте снова.';
      showFeedbackMessage(errorMessage);
      console.error(error);
    }
  };

  const handleEditUser = () => {
    const user = users.find((user) => user.id === selectedUser);

    if (!user) {
      showFeedbackMessage('Пожалуйста, выберите пользователя для редактирования.');
      return;
    }

    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      fio: user.fio || '',
      room: user.room || '',
      password: '', // Пароль не отображается, оставляем пустым
    });
    setShowEditPopup(true);
  };

  const handleSaveEditUser = async () => {
    try {
      await apiPost(`/api/auth/edit_user/${editUser.id}`, editUser);
      showFeedbackMessage('Данные пользователя успешно обновлены.');
      setShowEditPopup(false);
      // Обновляем список пользователей
      const updatedUsers = await apiGet('/api/auth/users');
      setUsers(updatedUsers);
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Ошибка обновления данных пользователя.';
      showFeedbackMessage(errorMessage);
      console.error(error);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      showFeedbackMessage('Выберите пользователя для удаления.');
      return;
    }

    try {
      await axios.delete(`http://localhost:5000/api/auth/delete_user/${selectedUser}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      showFeedbackMessage('Пользователь успешно удален.');
      setUsers(users.filter((user) => user.id !== selectedUser));
      setSelectedUser('');
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Ошибка удаления пользователя.';
      showFeedbackMessage(errorMessage);
      console.error(error);
    }
  };

  const handleAddPattern = async () => {
    if (!newPattern) {
      showFeedbackMessage('Введите название шаблона для добавления.');
      return;
    }

    try {
      const updatedPatterns = [...patterns, newPattern];
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      showFeedbackMessage('Шаблон успешно добавлен.');
      setPatterns(updatedPatterns);
      setNewPattern('');
    } catch (error) {
      showFeedbackMessage('Ошибка добавления шаблона, попробуйте снова.');
      console.error(error);
    }
  };

  const handleDeletePattern = async () => {
    if (!selectedPattern) {
      showFeedbackMessage('Выберите шаблон для удаления.');
      return;
    }

    try {
      const updatedPatterns = patterns.filter((pattern) => pattern !== selectedPattern);
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      showFeedbackMessage('Шаблон успешно удален.');
      setPatterns(updatedPatterns);
      setSelectedPattern('');
    } catch (error) {
      showFeedbackMessage('Ошибка удаления шаблона, попробуйте снова.');
      console.error(error);
    }
  };

  const toggleShowPassword = () => setShowPassword(!showPassword);

  return (
    <div className="admin-page-container">
      {feedback && <div className="feedback-message">{feedback}</div>}

      <h2>Страница администратора</h2>

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
          <input
            type="text"
            placeholder="ФИО"
            value={fio}
            onChange={(e) => setFio(e.target.value)}
          />
          <input
            type="text"
            placeholder="Комната"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
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

      <div className="template-management-section">
        <h3>Управление шаблонами</h3>
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
                id="delete-pattern"
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

      <div className="user-interaction-section">
        <h3>Взаимодействие с пользователями</h3>
        <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(parseInt(e.target.value))}
        >
          <option value="">Выберите пользователя</option>
          {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username}
              </option>
          ))}
        </select>
        <button onClick={handleEditUser}>Редактировать</button>
        <button onClick={handleDeleteUser}>Удалить</button>
      </div>


      {showEditPopup && (
          <div className="edit-popup">
            <h3>Редактирование пользователя</h3>
            <input
                type="text"
                placeholder="Имя пользователя"
                value={editUser.username || ''}
                onChange={(e) => setEditUser({...editUser, username: e.target.value})}
            />
            <input
                type="email"
                placeholder="Email"
                value={editUser.email || ''}
                onChange={(e) => setEditUser({...editUser, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="ФИО"
            value={editUser.fio || ''}
            onChange={(e) => setEditUser({ ...editUser, fio: e.target.value })}
          />
          <input
            type="text"
            placeholder="Комната"
            value={editUser.room || ''}
            onChange={(e) => setEditUser({ ...editUser, room: e.target.value })}
          />
            <div className="password-field">
              <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Новый пароль (оставьте пустым, если не менять)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
              />
              <button type="button" onClick={toggleShowPassword}>
                {showPassword ? <FaEyeSlash/> : <FaEye/>}
              </button>
            </div>

            <button onClick={handleSaveEditUser}>Сохранить</button>
            <button onClick={() => setShowEditPopup(false)}>Отмена</button>
          </div>
      )}
    </div>
  );
}

export default AdminPage;