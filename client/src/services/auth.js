import {jwtDecode} from 'jwt-decode';  // Правильный импорт jwtDecode

export const getUserRoleFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode(token);
    return decoded.role || null;  // Возвращаем роль из токена
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
