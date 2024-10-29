import React, { useState, useEffect } from 'react';
import './Dobrodel.css';

function Dobrodel() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    date: '',
    orderNumber: '',
    description: '',
    task: '',
    performer: '',
    note: ''
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Загрузка данных из сервера при монтировании компонента
  useEffect(() => {
    const fetchOrders = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/dobrodel');
            if (!response.ok) {
                throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log("Данные, полученные с сервера:", data); // <--- Временный лог
            setOrders(data);
        } catch (err) {
            console.error("Ошибка получения данных:", err);
            setError(err.message || 'Ошибка загрузки данных');
        } finally {
            setLoading(false);
        }
    };
    fetchOrders();
}, []);


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrder = async () => {
    try {
      const response = await fetch('/api/dobrodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Ошибка добавления записи: ${response.status} ${response.statusText}`);
      }

      const newOrder = await response.json();
      setOrders([...orders, newOrder]);
      setFormData({ date: '', orderNumber: '', description: '', task: '', performer: '', note: '' });
    } catch (err) {
      setError(err.message || 'Ошибка добавления записи');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    try {
      const response = await fetch(`/api/dobrodel/${orderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Ошибка удаления записи: ${response.status}   ${response.statusText}`);
      }
      setOrders(orders.filter((order) => order.id !== orderId));
    } catch (err) {
      setError(err.message || 'Ошибка удаления записи');
    }
  };

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="dobrodel-container">
      <div className="dobrodel-form">
        <h3>Добавить наряд</h3>

        <label>Дата выполнения:</label>
        <input type="date" name="date" value={formData.date} onChange={handleInputChange} />

        <label>Номер ИЗМ/НАР:</label>
        <input type="text" name="orderNumber" value={formData.orderNumber} onChange={handleInputChange} />

        <label>Проводимые работы (описание):</label>
        <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>

        <label>Задание:</label>
        <input type="text" name="task" value={formData.task} onChange={handleInputChange} />

        <label>Исполнитель работ:</label>
        <input type="text" name="performer" value={formData.performer} onChange={handleInputChange} />

        <label>Примечание:</label>
        <textarea name="note" value={formData.note} onChange={handleInputChange}></textarea>

         {/* Верхние кнопки управления */}
        <div className="form-buttons-top">
          <button onClick={handleAddOrder}>Добавить</button>
          <button>Удалить</button>
          <button>Обновить</button>
        </div>

        {/* Нижние кнопки управления */}
        <div className="form-buttons-bottom">
          <button>Редактировать</button>
          <button>Выходные формы</button>
        </div>
      </div>

      <div className="dobrodel-table">
        <h3>Журнал управления нарядами</h3>
        <table>
          <thead>
            <tr>
              <th>Номер наряда</th>
              <th>Описание</th>
              <th>Задание</th>
              <th>Дата выполнения</th>
              <th>Исполнитель</th>
              <th>Примечание</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td>{order.description}</td>
                  <td>{order.field}</td>
                  <td>{order.date_performed}</td>
                  <td>{order.executor}</td>
                  <td>{order.note}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7">Нет данных для отображения</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dobrodel;