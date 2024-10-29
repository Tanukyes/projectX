import React, { useState, useContext } from 'react';
import { useDataLoader } from '../services/dataLoader';
import { AuthContext } from '../contexts/authContext';
import './Dashboard.css';
import Dobrodel from './Dobrodel/Dobrodel';  // Импортируем компонент Dobrodel

function Dashboard() {
  const { error, loading } = useDataLoader('/api/dashboard');
  const { userRole } = useContext(AuthContext);  // Получаем роль пользователя из контекста
  const [activeTab, setActiveTab] = useState('tasks');  // Управляем вкладками

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p className="error">{error}</p>;

  // Проверяем доступность таблиц на основе роли
  const showTasksJournal = userRole === 'user';
  const showChangesJournal = userRole === 'user' || userRole === 'user1';
  const showDocumentsJournal = userRole === 'user';

  return (
    <div className="dashboard-container">
      <h2>Панель управления</h2>

      <div className="tabs">
        {showTasksJournal && (
          <button onClick={() => setActiveTab('tasks')} className={activeTab === 'tasks' ? 'active' : ''}>
            Добродел
          </button>
        )}
        {showChangesJournal && (
          <button onClick={() => setActiveTab('changes')} className={activeTab === 'changes' ? 'active' : ''}>
            Журнал изменений
          </button>
        )}
        {showDocumentsJournal && (
          <button onClick={() => setActiveTab('documents')} className={activeTab === 'documents' ? 'active' : ''}>
            Журнал документации
          </button>
        )}
      </div>

      <div className="tab-content">
        {activeTab === 'tasks' && showTasksJournal && (
          <Dobrodel />
        )}

        {activeTab === 'changes' && showChangesJournal && (
          <div>
            <h3>Журнал изменений</h3>
            <p>Здесь отображаются изменения...</p>
            {/* Добавьте свою логику отображения данных */}
          </div>
        )}

        {activeTab === 'documents' && showDocumentsJournal && (
          <div>
            <h3>Журнал документации</h3>
            <p>Здесь отображаются документы...</p>
            {/* Добавьте свою логику отображения данных */}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;