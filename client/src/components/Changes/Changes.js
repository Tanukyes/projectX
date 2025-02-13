import React, { useState, useEffect } from 'react';
import './Changes.css';
import {FaSync, FaFileExcel} from 'react-icons/fa';
import {jwtDecode} from 'jwt-decode';
import { BsDatabaseFillAdd } from "react-icons/bs";
import { TbDatabaseEdit } from "react-icons/tb";
import { MdDelete, MdFilterAltOff } from "react-icons/md";
import Popup from "../Popup";
import ExcelPopup from "./ExcelPopup"; // новое окно экспорта
import {IconContext} from "react-icons";

function ChangeLog() {
  const [changes, setChanges] = useState([]);
  const [formData, setFormData] = useState({
    esp_number: '',
    received_date: new Date().toISOString().split('T')[0], // текущая дата по умолчанию
    ec: '',
    task: '',
    responsible: '',
    completion_date: '',
    planned_date: '',
    note: '',
    description: ''
  });
  const [selectedChangeId, setSelectedChangeId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('esp_number');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      jwtDecode(token);
    }
    fetchChanges();
  }, []);

  const fetchChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch('http://localhost:5000/api/change_log', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      const data = await response.json();
      setChanges(data);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  };

  // Преобразование даты из "YYYY-MM-DD" в "DD.MM.YYYY"
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
  };

  const resetForm = () => {
    setFormData({
      esp_number: '',
      received_date: new Date().toISOString().split('T')[0],
      ec: '',
      task: '',
      responsible: '',
      completion_date: '',
      planned_date: '',
      note: '',
      description: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    const newValue = (type === 'date' && value === '') ? null : value;
    setFormData({ ...formData, [name]: newValue });
  };

  // Добавление записи
  const handleAddChange = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch('http://localhost:5000/api/change_log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Ошибка при добавлении записи');
      }
      fetchChanges();
      setShowPopup(false);
      resetForm();
      setIsEditing(false);
      setSelectedRow(null);
      setSelectedChangeId(null);
    } catch (error) {
      console.error('Ошибка при добавлении записи:', error);
    }
  };

  // Обновление записи
  const handleUpdateChange = async () => {
    if (!selectedChangeId) {
      alert('Сначала выберите запись для редактирования');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/change_log/${selectedChangeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error('Ошибка при обновлении записи');
      }
      fetchChanges();
      setShowPopup(false);
      resetForm();
      setIsEditing(false);
      setSelectedRow(null);
      setSelectedChangeId(null);
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
    }
  };

  // Удаление записи (вызовется после подтверждения)
  const handleDeleteChangeConfirmed = async () => {
    if (!selectedChangeId) {
      alert('Сначала выберите запись для удаления');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/change_log/${selectedChangeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error('Ошибка при удалении записи');
      }
      fetchChanges();
      setSelectedChangeId(null);
      setSelectedRow(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Ошибка удаления записи:', error);
    }
  };

  const handleRowClick = (changeId) => {
    setSelectedChangeId(changeId);
    setSelectedRow(changeId);
  };

  const handlePopupOpen = (e, text) => {
    if (e.target.scrollWidth > e.target.clientWidth) {
      setPopupContent(text);
      setShowTextPopup(true);
    }
  };

  const handlePopupClose = () => {
    setPopupContent("");
    setShowTextPopup(false);
  };

  const handleEditChange = () => {
    if (!selectedChangeId) {
      alert('Сначала выберите запись для редактирования');
      return;
    }
    const changeToEdit = changes.find(change => change.id === selectedChangeId);
    if (changeToEdit) {
      setFormData({
        esp_number: changeToEdit.esp_number || '',
        received_date: changeToEdit.received_date || new Date().toISOString().split('T')[0],
        ec: changeToEdit.ec || '',
        task: changeToEdit.task || '',
        responsible: changeToEdit.responsible || '',
        completion_date: changeToEdit.completion_date || '',
        planned_date: changeToEdit.planned_date || '',
        note: changeToEdit.note || '',
        description: changeToEdit.description || ''
      });
      setIsEditing(true);
      setShowPopup(true);
    }
  };

  const handlePopupSubmit = () => {
    if (isEditing) {
      handleUpdateChange();
    } else {
      handleAddChange();
    }
  };

  // Фильтрация по поиску, затем сортировка по убыванию id (новые записи сверху)
  const filteredChanges = changes.filter(change =>
    change[searchColumn]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedFilteredChanges = filteredChanges.sort((a, b) => b.id - a.id);

  const handleReset = () => setSearchQuery('');

  return (
    <div className="change-log-container">
      <div style={{ flexGrow: 1 }}>
        <div className="search-container">
          <select value={searchColumn} onChange={(e) => setSearchColumn(e.target.value)}>
            <option value="esp_number">Номер в ЕСПП</option>
            <option value="received_date">Дата получения</option>
            <option value="ec">ЭК</option>
            <option value="task">Задание</option>
            <option value="responsible">Исполнитель</option>
            <option value="completion_date">Дата выполнения</option>
            <option value="planned_date">Планируемая дата</option>
          </select>
          <input
              type="text"
              placeholder="Введите текст для поиска..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
              className="my-reset-button"
              onClick={handleReset}
              title="Сбросить фильтр"
          >
            <IconContext.Provider value={{size: 24}}>
              <>
                <MdFilterAltOff/>
              </>
            </IconContext.Provider>
          </button>
          <button onClick={() => {
            setShowPopup(true);
            resetForm();
            setIsEditing(false);
          }} title="Добавить" className="add-button">
            <BsDatabaseFillAdd/>
          </button>
          <button onClick={handleEditChange} title="Редактировать" className="edit-button">
            <TbDatabaseEdit/>
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} title="Удалить" className="delete-button">
            <MdDelete/>
          </button>
          <button onClick={fetchChanges} title="Обновить" className="change-refresh-button">
            <FaSync/>
          </button>
          <button onClick={() => setShowExportDialog(true)} title="Экспорт" className="excel-button">
            <FaFileExcel/>
          </button>
        </div>

        <div className="changes-table">
          <table>
            <thead>
            <tr>
              <th className="bold-text">Номер в ЕСПП</th>
              <th className="bold-text">Дата получения</th>
              <th className="bold-text">ЭК</th>
              <th className="bold-text">Задание</th>
              <th className="bold-text">Описание</th>
              <th className="bold-text">Исполнитель</th>
                <th className="bold-text">Дата выполнения</th>
                <th className="bold-text">Планируемая дата</th>
                <th className="bold-text">Примечание</th>
                <th className="bold-text">Кто изменил</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredChanges.map(change => (
                <tr
                  key={change.id}
                  className={change.id === selectedRow ? 'change-selected-row' : ''}
                  onClick={() => handleRowClick(change.id)}
                >
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.esp_number)}>
                    {change.esp_number}
                  </td>
                  <td className="centered-text">{formatDate(change.received_date)}</td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.ec)}>
                    {change.ec}
                  </td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.task)}>
                    {change.task}
                  </td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.description)}>
                    {change.description}
                  </td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.responsible)}>{change.responsible}</td>
                  <td className="centered-text">{formatDate(change.completion_date)}</td>
                  <td className="centered-text">{formatDate(change.planned_date)}</td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.note)}>
                    {change.note}
                  </td>
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, change.last_modified_by)}>{change.last_modified_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showTextPopup && (
        <Popup
          title="Полный текст"
          content={
            <p style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
              {popupContent}
            </p>
          }
          onClose={handlePopupClose}
        />
      )}

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>{isEditing ? "Редактировать запись" : "Добавить запись"}</h2>
            </div>

            <div className="popup-body">
              <label>Номер в ЕСПП:</label>
              <input type="text" name="esp_number" value={formData.esp_number} onChange={handleInputChange}/>

              <label>Дата получения изменения:</label>
              <input type="date" name="received_date" value={formData.received_date} onChange={handleInputChange}/>

              <label>ЭК:</label>
              <input type="text" name="ec" value={formData.ec} onChange={handleInputChange}/>

              <label>Задание:</label>
              <input name="task" value={formData.task} onChange={handleInputChange}/>

              <label>Описание:</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange}></textarea>

              <label>Ответственный за ИЗМ:</label>
              <input type="text" name="responsible" value={formData.responsible} onChange={handleInputChange}/>

              <label>Планируемая дата:</label>
              <input type="date" name="planned_date" value={formData.planned_date} onChange={handleInputChange}/>

              <label>Дата выполнения:</label>
              <input type="date" name="completion_date" value={formData.completion_date} onChange={handleInputChange}/>

              <label>Примечание:</label>
              <input type="text" name="note" value={formData.note} onChange={handleInputChange}/>
            </div>

            <div className="popup-footer">
              <button className="save-button" onClick={handlePopupSubmit}>
                {isEditing ? "Сохранить изменения" : "Сохранить"}
              </button>
              <button className="cancel-button" onClick={() => { setShowPopup(false); resetForm(); setIsEditing(false); }}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <Popup
          title="Подтверждение удаления"
          content={<p>Вы уверены, что хотите удалить выбранную запись?</p>}
          controls={
            <>
              <button onClick={handleDeleteChangeConfirmed} className="delete-confirm-button">
                Подтвердить
              </button>
              <button onClick={() => setShowDeleteConfirm(false)} className="delete-cancel-button">
                Отмена
              </button>
            </>
          }
          onClose={() => setShowDeleteConfirm(false)}
        />
      )}

      {showExportDialog && (
        <ExcelPopup
          changes={changes}
          onClose={() => setShowExportDialog(false)}
        />
      )}
    </div>
  );
}

export default ChangeLog;