import { jwtDecode } from 'jwt-decode';

export const getUserRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.sub.role || null; // Извлекаем роль из `sub`
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

export const getUsernameFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    return decoded.sub.username || null; // Извлекаем username из `sub`
  } catch (error) {
    console.error("Ошибка декодирования токена:", error);
    return null;
  }
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

export const logout = () => {
  localStorage.removeItem('token');
};
