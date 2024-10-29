import React, { useState, useEffect } from 'react';
import './Dobrodel.css';
import Popup from '../Popup';

function Dobrodel() {
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    orderNumber: '',
    description: '',
    task: '',
    performer: '',
    note: ''
  });
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/dobrodel');
      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(data);
    } catch (err) {
      console.error("Ошибка получения данных:", err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddOrder = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/dobrodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Ошибка добавления записи: ${response.status} ${response.statusText}`);
      }
      const newOrder = await response.json();
      setOrders([...orders, newOrder]);
      setFormData({ date: new Date().toISOString().split("T")[0], orderNumber: '', description: '', task: '', performer: '', note: '' });
    } catch (err) {
      setError(err.message || 'Ошибка добавления записи');
    }
  };

  const handleDeleteOrder = async () => {
    if (!selectedOrderId) {
      setError("Выберите запись для удаления");
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/dobrodel/${selectedOrderId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`Ошибка удаления записи: ${response.status} ${response.statusText}`);
      }
      setOrders(orders.filter((order) => order.id !== selectedOrderId));
      setSelectedOrderId(null);
    } catch (err) {
      setError(err.message || 'Ошибка удаления записи');
    }
  };

  const handleUpdateTable = () => {
    fetchOrders();
  };

  const handleEditOrder = () => {
    const orderToEdit = orders.find((order) => order.id === selectedOrderId);
    if (orderToEdit) {
      setFormData({
        date: orderToEdit.date_performed,
        orderNumber: orderToEdit.order_number,
        description: orderToEdit.description,
        task: orderToEdit.field,
        performer: orderToEdit.executor,
        note: orderToEdit.note
      });
      setEditing(true);
    } else {
      setError("Выберите запись для редактирования");
    }
  };

  const handleSaveEdit = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/dobrodel/${selectedOrderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`Ошибка сохранения изменений: ${response.status} ${response.statusText}`);
      }
      const updatedOrder = await response.json();
      setOrders(orders.map(order => (order.id === selectedOrderId ? updatedOrder : order)));
      setEditing(false);
      setFormData({ date: new Date().toISOString().split("T")[0], orderNumber: '', description: '', task: '', performer: '', note: '' });
      setSelectedOrderId(null);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения изменений');
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    setFormData({ date: new Date().toISOString().split("T")[0], orderNumber: '', description: '', task: '', performer: '', note: '' });
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  if (loading) return <p>Загрузка данных...</p>;

  return (
    <div className="dobrodel-container">
      <div className="dobrodel-form">
        <h3>{editing ? 'Редактировать наряд' : 'Добавить наряд'}</h3>

        <label>Дата выполнения:</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
          max={new Date().toISOString().split("T")[0]}
        />

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

        {editing ? (
          <div className="form-buttons-editing">
            <button onClick={handleSaveEdit}>Сохранить</button>
            <button onClick={handleCancelEdit}>Отмена</button>
          </div>
        ) : (
          <div>
            <div className="form-buttons-top">
              <button onClick={handleAddOrder}>Добавить</button>
              <button onClick={handleDeleteOrder}>Удалить</button>
              <button onClick={handleUpdateTable}>Обновить</button>
            </div>
            <div className="form-buttons-bottom">
              <button onClick={handleEditOrder}>Редактировать</button>
              <button onClick={handleOpenDialog}>Выходные формы</button>
            </div>
          </div>
        )}
      </div>

      <div className="dobrodel-table">
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
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  style={{ backgroundColor: selectedOrderId === order.id ? '#f0f0f0' : 'transparent' }}
                >
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
                <td colSpan="6">Нет данных для отображения</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showDialog && (
        <Popup
          title="Выходные формы"
          content={<p>Здесь можно добавить содержимое для диалогового окна.</p>}
          onClose={handleCloseDialog}
        />
      )}

      {error && (
        <Popup
          title="Ошибка"
          content={<p>{error}</p>}
          onClose={closeErrorPopup}
        />
      )}
    </div>
  );
}

export default Dobrodel;
