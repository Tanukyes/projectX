import React, { useState, useEffect, useRef, useContext } from "react";
import { apiPost, apiGet, apiDelete } from "../../services/api";
import "./AdminPage.css";
import { FaEye, FaEyeSlash, FaCaretDown } from "react-icons/fa";
import { AuthContext } from "../../contexts/authContext";

function AdminPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [room, setRoom] = useState("");
  const [fio, setFio] = useState("");
  const [roles, setRoles] = useState([]);
  const [feedback, setFeedback] = useState("");
  const [newPattern, setNewPattern] = useState("");
  const [patterns, setPatterns] = useState([]);
  const [selectedPattern, setSelectedPattern] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [dropdownOpenRole, setDropdownOpenRole] = useState(false);
  const [dropdownOpenPattern, setDropdownOpenPattern] = useState(false);
  const [dropdownOpenUser, setDropdownOpenUser] = useState(false);
  const dropdownRefRole = useRef(null);
  const dropdownRefPattern = useRef(null);
  const dropdownRefUser = useRef(null);
  const { handleLogout } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesResponse, usersResponse, patternsResponse] = await Promise.all([
          apiGet("/api/roles"),
          apiGet("/api/auth/users"),
          apiGet("/api/get_patterns"),
        ]);

        setRoles(rolesResponse || []);
        setUsers(usersResponse || []);
        setPatterns(patternsResponse?.patterns || []);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        showFeedbackMessage("Ошибка при загрузке данных, попробуйте позже.");
      }
    };

    fetchData();

    const handleOutsideClick = (event) => {
      if (dropdownRefRole.current && !dropdownRefRole.current.contains(event.target)) {
        setDropdownOpenRole(false);
      }
      if (dropdownRefPattern.current && !dropdownRefPattern.current.contains(event.target)) {
        setDropdownOpenPattern(false);
      }
      if (dropdownRefUser.current && !dropdownRefUser.current.contains(event.target)) {
        setDropdownOpenUser(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const showFeedbackMessage = (message) => {
    setFeedback(message);
    setTimeout(() => setFeedback(""), 3000);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    if (!username || !email || !password) {
      showFeedbackMessage("Пожалуйста, заполните все обязательные поля.");
      alert("Пожалуйста, заполните все обязательные поля.");
      return;
    }
    try {
      const response = await apiPost("/api/auth/register", {
        username,
        email,
        password,
        role,
        room,
        fio,
      });
      showFeedbackMessage(response.msg || "Пользователь успешно создан.");
      setUsername("");
      setEmail("");
      setPassword("");
      setRole("user");
      setRoom("");
      setFio("");
      const updatedUsers = await apiGet("/api/auth/users");
      setUsers(updatedUsers);
      alert("Пользователь успешно создан.");
    } catch (error) {
      console.error("Ошибка при создании пользователя:", error);
      showFeedbackMessage(error?.response?.data?.msg || "Ошибка создания пользователя.");
      alert("Ошибка создания пользователя.");
    }
  };

  const handleSaveEditUser = async () => {
    try {
      const userData = { ...editUser };
      if (!editUser.password) {
        delete userData.password;
      }
      await apiPost(`/api/auth/edit_user/${editUser.id}`, userData);
      showFeedbackMessage("Данные пользователя успешно обновлены.");
      setShowEditPopup(false);
      const updatedUsers = await apiGet("/api/auth/users");
      setUsers(updatedUsers);
      alert("Данные пользователя успешно обновлены.")
    } catch (error) {
      console.error("Ошибка при обновлении пользователя:", error);
      showFeedbackMessage(error?.response?.data?.msg || "Ошибка обновления данных пользователя.");
      alert("Ошибка обновления данных пользователя.");
    }
  };

  const handleEditUser = () => {
    const user = users.find((user) => user.id === selectedUser);
    if (!user) {
      showFeedbackMessage("Пожалуйста, выберите пользователя для редактирования.");
      alert("Пожалуйста, выберите пользователя для редактирования.");
      return;
    }
    setEditUser({
      id: user.id,
      username: user.username,
      email: user.email,
      fio: user.fio || "",
      room: user.room || "",
      password: "",
    });
    setShowEditPopup(true);
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setDropdownOpenRole(false);
  };

  const handlePatternSelect = (pattern) => {
    setSelectedPattern(pattern);
    setDropdownOpenPattern(false);
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setDropdownOpenUser(false);
  };

  const handleAddPattern = async () => {
    if (!newPattern) {
      showFeedbackMessage('Введите название шаблона для добавления.');
      alert('Введите название шаблона для добавления.');
      return;
    }

    try {
      const updatedPatterns = [...patterns, newPattern];
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      showFeedbackMessage('Шаблон успешно добавлен.');
      setPatterns(updatedPatterns);
      setNewPattern('');
      alert('Шаблон успешно добавлен.');
    } catch (error) {
      showFeedbackMessage('Ошибка добавления шаблона, попробуйте снова.');
      console.error(error);
      alert('Ошибка добавления шаблона, попробуйте снова.');
    }
  };

  const handleDeletePattern = async () => {
    if (!selectedPattern) {
      showFeedbackMessage('Выберите шаблон для удаления.');
      alert('Выберите шаблон для удаления.');
      return;
    }

    try {
      const updatedPatterns = patterns.filter((pattern) => pattern !== selectedPattern);
      await apiPost('/api/save_patterns', { patterns: updatedPatterns });
      showFeedbackMessage('Шаблон успешно удален.');
      setPatterns(updatedPatterns);
      setSelectedPattern('');
      alert('Шаблон успешно удален.');
    } catch (error) {
      showFeedbackMessage('Ошибка удаления шаблона, попробуйте снова.');
      console.error(error);
      alert('Ошибка удаления шаблона, попробуйте снова.');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) {
      showFeedbackMessage("Выберите пользователя для удаления.");
      return;
    }
    if (!window.confirm("Вы уверены, что хотите удалить пользователя?")) {
      return;
    }
    try {
      const response = await apiDelete(`/api/auth/delete_user/${selectedUser}`);
      showFeedbackMessage(response.msg || "Пользователь успешно удален.");
      const updatedUsers = await apiGet("/api/auth/users");
      setUsers(updatedUsers);
      setSelectedUser(null);
    } catch (error) {
      console.error("Ошибка при удалении пользователя:", error);
      showFeedbackMessage(error?.response?.data?.msg || "Ошибка удаления пользователя.");
    }
  };

  return (
    <div className="admin-page admin-page-container">
      <div className="admin-header">
        <h2>Страница администратора</h2>
        <button className="admin-logout-button" onClick={handleLogout}>Выйти</button>
      </div>

      {feedback && <div className="feedback-message">{feedback}</div>}

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
            <div className="password-field">
              <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
              />
              <button className="password-eye" type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash/> : <FaEye/>}
              </button>
            </div>
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

            <div className="dropdown-container" ref={dropdownRefRole}>
              <div className="dropdown-header" onClick={() => setDropdownOpenRole(!dropdownOpenRole)}>
                <span>{role || 'Выберите роль'}</span>
                <FaCaretDown/>
              </div>
              {dropdownOpenRole && (
                  <div className="dropdown-menu1">
                    {roles.map((r) => (
                        <div
                            key={r.id}
                            className="dropdown-item"
                            onClick={() => handleRoleSelect(r.name)}
                        >
                          {r.name}
                        </div>
                    ))}
                  </div>
              )}
            </div>

            <button className="submit-button" type="submit">Создать пользователя</button>
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
            <div className="dropdown-container" ref={dropdownRefPattern}>
              <div
                  className="dropdown-header"
                  onClick={() => setDropdownOpenPattern(!dropdownOpenPattern)}
              >
                <span>{selectedPattern || 'Выберите шаблон для удаления'}</span>
                <FaCaretDown/>
              </div>
              {dropdownOpenPattern && (
                  <div className="dropdown-menu1">
                    {patterns.map((pattern, index) => (
                        <div
                            key={index}
                            className="dropdown-item"
                            onClick={() => handlePatternSelect(pattern)}
                        >
                          {pattern}
                        </div>
                    ))}
                  </div>
              )}
            </div>
            <button className="DDdelete" onClick={handleDeletePattern}>Удалить шаблон</button>
          </div>
        </div>

        <div className="user-interaction-section">
          <h3>Редактировать/удалить пользователя</h3>
          <div className="user-interaction-section-managment">
          <div className="dropdown-container" ref={dropdownRefUser}>
            <div
                className="dropdown-header"
                onClick={() => setDropdownOpenUser(!dropdownOpenUser)}
            >
            <span>
              {users.find((u) => u.id === selectedUser)?.username || 'Выберите пользователя'}
            </span>
              <FaCaretDown/>
            </div>
            {dropdownOpenUser && (
                <div className="dropdown-menu1">
                  {users.map((user) => (
                      <div
                          key={user.id}
                          className="dropdown-item"
                          onClick={() => handleUserSelect(user.id)}
                      >
                        {user.username}
                      </div>
                  ))}
                </div>
            )}
          </div>
          <button onClick={handleEditUser}>Редактировать</button> &nbsp;
          <button onClick={handleDeleteUser}>Удалить</button>
        </div>
        </div>

        {showEditPopup && (
            <div className="export-popup-overlay">
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
                    onChange={(e) => setEditUser({...editUser, email: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="ФИО"
                    value={editUser.fio || ''}
                    onChange={(e) => setEditUser({...editUser, fio: e.target.value})}
                />
                <input
                    type="text"
                    placeholder="Комната"
                    value={editUser.room || ''}
                    onChange={(e) => setEditUser({...editUser, room: e.target.value})}
                />
                <div className="password-field">
                  <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Пароль"
                      value={editUser.password || ''}
                      onChange={(e) => setEditUser({...editUser, password: e.target.value})}
                  />
                </div>
                <button className="save-button" onClick={handleSaveEditUser}>Сохранить</button>
                <button className="cancel-button" onClick={() => setShowEditPopup(false)}>Отмена</button>
              </div>
            </div>
        )}
    </div>
  );
}

export default AdminPage;
