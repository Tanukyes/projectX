import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Подключаем стили
import App from './App'; // Импортируем основной компонент приложения

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
