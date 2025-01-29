import React, { useState, useContext, useEffect } from 'react';
import { useDataLoader } from '../services/dataLoader';
import { AuthContext } from '../contexts/authContext';
import './Dashboard.css';
import Dobrodel from './Dobrodel/Dobrodel';
import TimeLogs from './TimeLogs/TimeLogs';
import { AiOutlineMenu } from 'react-icons/ai';

function Dashboard() {
  const { error, loading } = useDataLoader('/api/dashboard');
  const { userRole, handleLogout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('dashboardTab') || 'tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentRoute', window.location.pathname);
    localStorage.setItem('dashboardTab', activeTab);
  }, [activeTab]);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p className="error">{error}</p>;

  // Проверка доступности вкладок на основе роли
  const showTasksJournal = userRole === 'user' || userRole === 'upUser';
  const showChangesJournal = userRole === 'user' || userRole === 'smena' || userRole === 'upSmena'
      || userRole === 'powUser' || userRole === 'upUser';
  const showTimeLogs = userRole === 'user' || userRole === 't-user' || userRole === 'upUser'
      || userRole === 'powUser' || userRole === 'powT-user' || userRole === 'smena' || userRole === 'upSmena';
  const showDocumentsJournal = userRole === 'user' || userRole === 'smena' || userRole === 'upSmena'
      ||  userRole === 'upUser';
  const hideMenu = userRole === 't-user' || userRole === 'powT-user';

  // Определяем заголовок для выбранной вкладки
  const tabTitle = {
    tasks: 'Добродел',
    changes: 'Журнал изменений',
    documents: 'Журнал документации',
    time_logs: '',
  }[activeTab];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="dashboard-container">
      <div className="tabs">
        {/* Отображение заголовка активной вкладки */}
        <h2 className="tab-title">{tabTitle}</h2>

        {/* Иконка меню */}
        {!hideMenu && (
          <div className="menu-icon" onClick={toggleMenu}>
            <AiOutlineMenu />
          </div>
        )}
      </div>

      {/* Выпадающее меню, если иконка активна */}
      {!hideMenu && isMenuOpen && (
        <div className="dropdown-menu">
          {/* Отображаем кнопки только для ролей, которым они разрешены */}
          {(userRole === 'user' || userRole === 'upUser') && (
            <button onClick={() => { setActiveTab('tasks'); toggleMenu(); }}>
              Добродел
            </button>
          )}

          {(userRole === 'user' || userRole === 'smena' || userRole === 'upSmena' || userRole === 'powUser' || userRole === 'upUser') && (
            <button onClick={() => { setActiveTab('changes'); toggleMenu(); }}>
              Журнал изменений
            </button>
          )}

          {(userRole === 'user' || userRole === 'smena' || userRole === 'upSmena' || userRole === 'upUser') && (
            <button onClick={() => { setActiveTab('documents'); toggleMenu(); }}>
              Журнал документации
            </button>
          )}

          {(userRole === 'user' || userRole === 't-user' || userRole === 'upUser' || userRole === 'powUser' || userRole === 'powT-user' || userRole === 'smena'|| userRole === 'upSmena') && (
            <button onClick={() => { setActiveTab('time_logs'); toggleMenu(); }}>
              Журнал отгулов
            </button>
          )}

          <button onClick={handleLogout} className="logout-button">Выход</button>
        </div>
      )}

      <div className="tab-content">
        {!hideMenu && activeTab === 'tasks' && showTasksJournal && (
          <Dobrodel />
        )}
        {activeTab === 'time_logs' && showTimeLogs && (
          <TimeLogs />
        )}
        {activeTab === 'changes' && showChangesJournal && (
          <div>
            <h3>Журнал изменений</h3>
            <p>Здесь отображаются изменения...</p>
          </div>
        )}
        {activeTab === 'documents' && showDocumentsJournal && (
          <div>
            <h3>Журнал документации</h3>
            <p>Здесь отображаются документы...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
