import { useState, useEffect } from 'react';
import { apiGet } from './api';

export const useDataLoader = (endpoint) => {
  const [data, setData] = useState(null);  // Начальное состояние null
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet(endpoint);  // Запрашиваем данные с API
        setData(result);  // Устанавливаем полученные данные
      } catch (err) {
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);  // В любом случае останавливаем загрузку
      }
    };

    fetchData();
  }, [endpoint]);  // Запускаем эффект, если меняется endpoint

  return { data, error, loading };
};
