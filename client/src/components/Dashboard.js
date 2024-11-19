import React, { useState, useContext, useEffect  } from 'react';
import { useDataLoader } from '../services/dataLoader';
import { AuthContext } from '../contexts/authContext';
import './Dashboard.css';
import Dobrodel from './Dobrodel/Dobrodel'; // Импортируем компонент Dobродел
import { AiOutlineMenu } from 'react-icons/ai';

function Dashboard() {
  const { error, loading } = useDataLoader('/api/dashboard');
  const { userRole, handleLogout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(localStorage.getItem('dashboardTab') ||'tasks');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('currentRoute', window.location.pathname);
    localStorage.setItem('dashboardTab', activeTab);
  }, [activeTab]);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p className="error">{error}</p>;

  // Проверка доступности вкладок на основе роли
  const showTasksJournal = userRole === 'user';
  const showChangesJournal = userRole === 'user' || userRole === 'smena' || userRole === 'powUser';
  const showTimesJournal = userRole === 'user' || userRole === 'powUser';
  const showDocumentsJournal = userRole === 'user';

  // Определяем заголовок для выбранной вкладки
  const tabTitle = {
    tasks: "Добродел",
    changes: "Журнал изменений",
    documents: "Журнал документации"
  }[activeTab];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="dashboard-container">
      <div className="tabs">
        {/* Отображение заголовка активной вкладки */}
        <h2 className="tab-title">{tabTitle}</h2>

        {/* Иконка меню */}
        <div className="menu-icon" onClick={toggleMenu}>
          <AiOutlineMenu />
        </div>
      </div>

      {/* Выпадающее меню, если иконка активна */}
      {isMenuOpen && (
        <div className="dropdown-menu">
          <button onClick={() => { setActiveTab('tasks'); toggleMenu(); }}>Добродел</button>
          <button onClick={() => { setActiveTab('changes'); toggleMenu(); }}>Журнал изменений</button>
          <button onClick={() => { setActiveTab('documents'); toggleMenu(); }}>Журнал документации</button>
          <button onClick={() => { setActiveTab('times'); toggleMenu(); }}>Журнал отгулов</button>
          <button onClick={handleLogout} className="logout-button">Выход</button>
        </div>
      )}

      <div className="tab-content">
        {activeTab === 'tasks' && showTasksJournal && (
          <Dobrodel />
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
        {activeTab === 'times' && showTimesJournal && (
          <div>
            <h3>Журнал отгулов</h3>
            <p>Здесь отображаются отгулы...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
