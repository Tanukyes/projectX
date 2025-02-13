import React, { useState, useEffect } from 'react';
import './ExportPopup.css';

function ExportPopup({ orders, onClose, onExport }) {
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [taskFilter, setTaskFilter] = useState('');
  const [performerFilter, setPerformerFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
  let updatedOrders = orders;

  if (taskFilter) {
    updatedOrders = updatedOrders.filter(order =>
      order.field && order.field.toLowerCase().includes(taskFilter.toLowerCase())
    );
  }
  if (performerFilter) {
    updatedOrders = updatedOrders.filter(order =>
      order.executor && order.executor.toLowerCase().includes(performerFilter.toLowerCase())
    );
  }
  if (startDate && endDate) {
    updatedOrders = updatedOrders.filter(order => {
      const orderDate = new Date(order.date_performed);
      return orderDate >= new Date(startDate) && orderDate <= new Date(endDate);
    });
  }

  setFilteredOrders(updatedOrders);
}, [orders, taskFilter, performerFilter, startDate, endDate]);

  const formatDate = dateString => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  return (
    <div className="export-popup-overlay">
      <div className="export-popup-content">
        <div className="export-popup-header">
          <h3>Экспорт данных</h3>
          <button className="export-popup-close" onClick={onClose}>×</button>
        </div>

        <div className="filter-container">
          <input
            type="text"
            value={taskFilter}
            onChange={(e) => setTaskFilter(e.target.value)}
            placeholder="По заданию"
            className="filter-input"
          />
          <input
            type="text"
            value={performerFilter}
            onChange={(e) => setPerformerFilter(e.target.value)}
            placeholder="По исполнителю"
            className="filter-input"
          />
          <div className="date-picker-container">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={today}
              className="date-picker"
              placeholder="Начало периода"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              max={today}
              className="date-picker"
              placeholder="Конец периода"
            />
          </div>
        </div>

        <div className="export-popup-table">
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
              {filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.order_number}</td>
                  <td title={order.description}>{order.description}</td>
                  <td title={order.field}>{order.field}</td>
                  <td>{formatDate(order.date_performed)}</td>
                  <td>{order.executor}</td>
                  <td title={order.note}>{order.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="export-button-container">
          <button
            onClick={() => onExport(filteredOrders)}
            className="export-excel-button"
            disabled={filteredOrders.length === 0}
          >
            Экспортировать в Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExportPopup;