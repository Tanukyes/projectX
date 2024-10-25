import React from 'react';
import { useDataLoader } from '../services/dataLoader';
import './Dashboard.css';

function Dashboard() {
  const { data, error, loading } = useDataLoader('/api/dashboard');

  // Если данные еще загружаются
  if (loading) {
    return <p>Загрузка данных...</p>;
  }

  // Если произошла ошибка при загрузке данных
  if (error) {
    return <p className="error">{error}</p>;
  }

  // Проверяем, что данные загружены и содержат пользователя
  if (!data || !data.user || !data.user.role) {
    return <p>Ошибка: нет данных для отображения.</p>;
  }

  return (
    <div className="app-container">
      <h2>Панель управления</h2>
      <p>{data.message}</p>
      <p>Роль: {data.user.role}</p> {/* Отображаем роль пользователя */}
    </div>
  );
}

export default Dashboard;
