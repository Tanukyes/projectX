import { useState, useEffect } from 'react';
import { apiGet } from './api';

export const useDataLoader = (endpoint) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await apiGet(endpoint);
        setData(result);
      } catch (err) {
        setError('Ошибка при загрузке данных. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, error, loading };
};
