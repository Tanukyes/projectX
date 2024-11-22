import React from 'react';
import ReactDOM from 'react-dom/client';  // импортируем createRoot
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));  // создаем root
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);