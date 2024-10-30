import React, { useState, useEffect, useCallback, useContext } from 'react';
import './Dobrodel.css';
import Popup from '../Popup';
import { AuthContext } from '../../contexts/authContext';

function Dobrodel() {
  const { username } = useContext(AuthContext); // Получаем username из контекста
  const [orders, setOrders] = useState([]);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    orderNumber: '',
    description: '',
    task: '',
    performer: username || '', // Устанавливаем username по умолчанию в качестве исполнителя
    note: ''
  });

  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/dobrodel');
      if (!response.ok) {
        throw new Error(`Ошибка загрузки данных: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      setOrders(sortOrdersByDate(data));
    } catch (err) {
      console.error("Ошибка получения данных:", err);
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Обновляем поле "Исполнитель работ" при изменении имени авторизованного пользователя
  useEffect(() => {
    setFormData((prevData) => ({
      ...prevData,
      performer: username || '', // Задаем пустую строку, если username отсутствует
    }));
  }, [username]);

  const sortOrdersByDate = (orders) => {
    return orders.sort((a, b) => new Date(b.date_performed) - new Date(a.date_performed));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value || '' // Fallback to empty string if value is undefined
    }));
  };

  const getCurrentDate = () => new Date().toISOString().split("T")[0];
  const getCurrentTime = () => new Date().toTimeString().slice(0, 5);

  const handleAddOrder = async () => {
    const today = getCurrentDate();
    const noteWithDate = formData.date === today
      ? formData.note
        ? `${getCurrentTime()}. ${formData.note}`
        : getCurrentTime()
      : `(добавлено ${today}) ${formData.note || ""}`;

    const updatedFormData = { ...formData, note: noteWithDate };

    try {
      const response = await fetch('http://localhost:5000/api/dobrodel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFormData),
      });
      if (!response.ok) {
        throw new Error(`Ошибка добавления записи: ${response.status} ${response.statusText}`);
      }
      const newOrder = await response.json();
      setOrders(sortOrdersByDate([newOrder, ...orders]));
      setFormData({ date: today, orderNumber: '', description: '', task: '', performer: username, note: '' });
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
    if (!selectedOrderId) {
      setError("Выберите запись для редактирования");
      return;
    }

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
      setFormData({ date: getCurrentDate(), orderNumber: '', description: '', task: '', performer: username, note: '' });
      setSelectedOrderId(null);
    } catch (err) {
      setError(err.message || 'Ошибка сохранения изменений');
    }
  };

  const handlePopupOpen = (e, text) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      setPopupContent(text);
      setShowPopup(true);
    }
  };

  const handlePopupClose = () => {
    setPopupContent("");
    setShowPopup(false);
  };

  const handleOpenDialog = () => {
    setShowDialog(true);
  };

  const closeErrorPopup = () => {
    setError(null);
  };

  if (loading) return <p>Загрузка данных...</p>;

  return (
    <div className="dobrodel-container">
      <div className="dobrodel-form">
        <h3>{editing ? 'Редактировать наряд' : 'Добавить наряд'}</h3>

        <label htmlFor="date">Дата выполнения:</label>
        <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleInputChange}
            max={new Date().toISOString().split("T")[0]}
        />

        <label htmlFor="orderNumber">Номер ИЗМ/НАР:</label>
        <input
            type="text"
            id="orderNumber"
            name="orderNumber"
            value={formData.orderNumber || ''}
            onChange={handleInputChange}
        />

        <label htmlFor="description">Проводимые работы (описание):</label>
        <textarea
            id="description"
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
        ></textarea>

        <label htmlFor="task">Задание:</label>
        <input
            type="text"
            id="task"
            name="task"
            value={formData.task || ''}
            onChange={handleInputChange}
            placeholder="Введите задание"
        />

        <label htmlFor="performer">Исполнитель работ:</label>
        <input
            type="text"
            id="performer"
            name="performer"
            defaultValue={formData.performer || ''} // Используем defaultValue для неизменяемого поля
            readOnly // Делаем поле неизменяемым
        />

        <label htmlFor="note">Примечание:</label>
        <textarea
            id="note"
            name="note"
            value={formData.note || ''}
            onChange={handleInputChange}
        ></textarea>

        {editing ? (
            <div className="form-buttons-editing">
              <button onClick={handleSaveEdit}>Сохранить</button>
              <button onClick={() => setEditing(false)}>Отмена</button>
            </div>
        ) : (
            <div>
              <div className="form-buttons-top">
                <button onClick={handleAddOrder}>Добавить</button>
                <button onClick={handleDeleteOrder}>Удалить</button>
                <button onClick={fetchOrders}>Обновить</button>
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
                  <tr key={order.id} onClick={() => setSelectedOrderId(order.id)}>
                    <td>{order.order_number}</td>
                    <td onClick={(e) => handlePopupOpen(e, order.description)}>{order.description}</td>
                    <td onClick={(e) => handlePopupOpen(e, order.field)}>{order.field}</td>
                    <td>{order.date_performed}</td>
                    <td>{order.executor}</td>
                    <td onClick={(e) => handlePopupOpen(e, order.note)}>{order.note}</td>
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

      {showPopup && (
          <Popup
              title="Полный текст"
              content={<p style={{whiteSpace: 'pre-wrap'}}>{popupContent}</p>}
              onClose={handlePopupClose}
          />
      )}

      {showDialog && (
          <Popup
              title="Выходные формы"
              content={<p>Здесь можно добавить содержимое для диалогового окна.</p>}
              onClose={() => setShowDialog(false)}
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
