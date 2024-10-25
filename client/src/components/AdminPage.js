import React from 'react';
import { useDataLoader } from '../services/dataLoader';
import './AdminPage.css';

function AdminPage() {
  const { data, error, loading } = useDataLoader('/api/admin');

  return (
    <div className="app-container">
      <h2>Admin Page</h2>
      <p>Эта страница доступна только администраторам.</p>
      {error ? (
        <p className="error">{error}</p>
      ) : loading ? (
        <p>Загрузка данных...</p>
      ) : (
        <ul>
          {data.length > 0 ? (
            data.map((item, index) => (
              <li key={index}>{item}</li>
            ))
          ) : (
            <p>Нет данных для отображения</p>
          )}
        </ul>
      )}
    </div>
  );
}

export default AdminPage;
