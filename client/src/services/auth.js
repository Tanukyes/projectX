import {jwtDecode} from 'jwt-decode';

// Функция для проверки, аутентифицирован ли пользователь
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const { exp } = jwtDecode(token);
    return exp * 1000 > Date.now(); // Проверяем срок действия токена
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    localStorage.removeItem('token');
    return false;
  }
};

// Получение роли пользователя из токена
export const getUserRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.role || null; // Предполагаем, что роль хранится в `role`
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

// Получение имени пользователя из токена
export const getUsernameFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.sub.username  || null; // Предполагаем, что имя пользователя хранится в `username`
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

export const getFioFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return decoded.fio || null; // Предполагаем, что FIO хранится в токене
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

// Функция для выхода пользователя из системы
export const logout = () => {
  localStorage.removeItem('token');
};
