import axios from 'axios';

const API_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});


// Интерсептор для обработки запросов
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);


// Функция для GET-запросов
export const apiGet = async (url) => {
  try {
    const response = await api.get(url, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`GET request failed: ${error}`);
    throw error;
  }
};

// Функция для POST-запросов
export const apiPost = async (url, data) => {
  try {
    const response = await api.post(url, data, { withCredentials: true });
    return response.data;
  } catch (error) {
    console.error(`POST request failed: ${error}`);
    throw error;
  }
};

export default api;
