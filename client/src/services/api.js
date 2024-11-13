import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response.data, // Успешный ответ
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token'); // Удаляем токен, если он истек или неверен
    }
    return Promise.reject(error); // Пробрасываем ошибку дальше
  }
);

export const apiGet = async (url) => {
  try {
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error(`GET request failed: ${error}`);
    throw error;
  }
};

export const apiPost = async (url, data) => {
  try {
    const response = await api.post(url, data);
    return response;
  } catch (error) {
    console.error(`POST request failed: ${error}`);
    throw error;
  }
};