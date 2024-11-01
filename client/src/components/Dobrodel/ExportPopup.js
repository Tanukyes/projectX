import React, { useState } from 'react';
import './ExportPopup.css';
import { FaFileExcel } from 'react-icons/fa';

function ExportPopup({ onClose, onExport }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [executor, setExecutor] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="export-popup-overlay">
      <div className="export-popup-content">
        <button onClick={onClose} className="export-popup-close">×</button>
        <h3>Экспорт данных</h3>
        <div className="filter-container">
          <label>Дата с:</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <label>Дата по:</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <label>Поиск по исполнителю:</label>
          <input type="text" value={executor} onChange={(e) => setExecutor(e.target.value)} />
          <label>Поиск по описанию/заданию:</label>
          <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <button onClick={() => onExport({ startDate, endDate, executor, searchTerm })} className="export-excel-button">
          <FaFileExcel /> Выгрузить в Excel
        </button>
      </div>
    </div>
  );
}

export default ExportPopup;
