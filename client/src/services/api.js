import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Добавляем токен ко всем запросам, если он существует
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Удаляем токен, если он недействителен
      window.location.href = '/login'; // Перенаправляем на страницу входа
    }
    return Promise.reject(error);
  }
);

// Поддержка дополнительных конфигураций (например, заголовков) в запросах
export const apiGet = async (url, config = {}) => {
  try {
    const response = await api.get(url, config);
    return response;
  } catch (error) {
    console.error(`GET request failed: ${error}`);
    throw error;
  }
};

export const apiPost = async (url, data, config = {}) => {
  try {
    const response = await api.post(url, data, config);
    return response;
  } catch (error) {
    console.error(`POST request failed: ${error}`);
    throw error;
  }
};
