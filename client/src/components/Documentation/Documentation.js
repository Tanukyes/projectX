import React, { useState, useEffect } from 'react';
import './Documentation.css';
import { FaSync, FaFileExcel } from 'react-icons/fa';
import { jwtDecode } from 'jwt-decode';
import { BsDatabaseFillAdd } from "react-icons/bs";
import { TbDatabaseEdit } from "react-icons/tb";
import { MdDelete, MdFilterAltOff } from "react-icons/md";
import Popup from "../Popup";
import DocExportPopup from "./DocExportPopup"; // новый файл экспорта для документации
import { IconContext } from "react-icons";

function Documentation() {
  const [docs, setDocs] = useState([]);
  const [formData, setFormData] = useState({
    document_title: '',
    esp_number: '',
    easd_number: '',
    last_date: '',      // можно оставить пустым, если дата не введена
    check_date: '',
    comments: '-',      // значение по умолчанию для select
    link_comments: '\\\\rzd-share-02\\ОУП\\SOOI_Doc\\',
    elimination_date: '',
    note: ''
  });
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedRow, setSelectedRow] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showTextPopup, setShowTextPopup] = useState(false);
  const [popupContent, setPopupContent] = useState("");
  const [searchQuery, setSearchQuery] = useState('');
  const [searchColumn, setSearchColumn] = useState('document_title');
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Состояния для попапа ссылки на замечания
  const [showLinkPopup, setShowLinkPopup] = useState(false);
  const [linkPopupContent, setLinkPopupContent] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      jwtDecode(token);
    }
    fetchDocs();
  }, []);

  const fetchDocs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch('http://localhost:5000/api/documentation', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Ошибка загрузки данных');
      }
      const data = await response.json();
      setDocs(data);
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
      document_title: '',
      esp_number: '',
      easd_number: '',
      last_date: '',
      check_date: '',
      comments: '-', // значение по умолчанию
      link_comments: '\\\\rzd-share-02\\ОУП\\SOOI_Doc\\',
      elimination_date: '',
      note: ''
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    // Если поле типа date и значение пустое, сохраняем null, иначе значение
    const newValue = (type === 'date' && value === '') ? null : value;
    setFormData({ ...formData, [name]: newValue });
  };

  // Добавление записи
  const handleAddDoc = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch('http://localhost:5000/api/documentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Ошибка при добавлении записи');
      }
      fetchDocs();
      setShowPopup(false);
      resetForm();
      setIsEditing(false);
      setSelectedRow(null);
      setSelectedDocId(null);
    } catch (error) {
      console.error('Ошибка при добавлении записи:', error);
    }
  };

  // Обновление записи
  const handleUpdateDoc = async () => {
    if (!selectedDocId) {
      alert('Сначала выберите запись для редактирования');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/documentation/${selectedDocId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        throw new Error('Ошибка при обновлении записи');
      }
      fetchDocs();
      setShowPopup(false);
      resetForm();
      setIsEditing(false);
      setSelectedRow(null);
      setSelectedDocId(null);
    } catch (error) {
      console.error('Ошибка при обновлении записи:', error);
    }
  };

  // Удаление записи
  const handleDeleteDocConfirmed = async () => {
    if (!selectedDocId) {
      alert('Сначала выберите запись для удаления');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('Ошибка: отсутствует токен авторизации');
        return;
      }
      const response = await fetch(`http://localhost:5000/api/documentation/${selectedDocId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Ошибка при удалении записи');
      }
      fetchDocs();
      setSelectedDocId(null);
      setSelectedRow(null);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Ошибка при удалении записи:', error);
    }
  };

  const handleRowClick = (docId) => {
    setSelectedDocId(docId);
    setSelectedRow(docId);
  };

  // Открытие попапа для длинного текста
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

  // Открытие попапа для ссылки на замечания
  const handleLinkPopupOpen = (e, link) => {
    if (link) {
      setLinkPopupContent(link);
      setShowLinkPopup(true);
    }
  };

  const handleLinkPopupClose = () => {
    setLinkPopupContent('');
    setShowLinkPopup(false);
  };

  // Копирование ссылки в буфер обмена
  const handleCopyLink = () => {
    if (linkPopupContent) {
      navigator.clipboard.writeText(linkPopupContent)
        .then(() => {
          alert("Ссылка скопирована в буфер обмена");
          setShowLinkPopup(false);
        })
        .catch((error) => {
          console.error("Ошибка при копировании ссылки:", error);
          alert("Не удалось скопировать ссылку");
        });
    }
  };

  const handleEditDoc = () => {
    if (!selectedDocId) {
      alert('Сначала выберите запись для редактирования');
      return;
    }
    const docToEdit = docs.find(doc => doc.id === selectedDocId);
    if (docToEdit) {
      setFormData({
        document_title: docToEdit.document_title || '',
        esp_number: docToEdit.esp_number || '',
        easd_number: docToEdit.easd_number || '',
        last_date: docToEdit.last_date || '',
        check_date: docToEdit.check_date || '',
        comments: docToEdit.comments || '-',  // если пусто, используем дефолт
        link_comments: docToEdit.link_comments || '',
        elimination_date: docToEdit.elimination_date || '',
        note: docToEdit.note || ''
      });
      setIsEditing(true);
      setShowPopup(true);
    }
  };

  // Убираем проверку обязательных дат, чтобы пустое значение было допустимо
  const handlePopupSubmit = () => {
    if (isEditing) {
      handleUpdateDoc();
    } else {
      handleAddDoc();
    }
  };

  // Фильтрация по поиску, затем сортировка по убыванию id (новые записи сверху)
  const filteredDocs = docs.filter(doc =>
    doc[searchColumn]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedFilteredDocs = filteredDocs.sort((a, b) => b.id - a.id);

  const handleReset = () => setSearchQuery('');

  return (
    <div className="change-log-container">
      <div style={{ flexGrow: 1 }}>
        <div className="search-container">
          <select value={searchColumn} onChange={(e) => setSearchColumn(e.target.value)}>
            <option value="document_title">Название документа</option>
            <option value="last_date">Крайний срок</option>
            <option value="comments">Замечания</option>
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
            <IconContext.Provider value={{ size: 24 }}>
              <MdFilterAltOff />
            </IconContext.Provider>
          </button>
          <button onClick={() => { setShowPopup(true); resetForm(); setIsEditing(false); }} title="Добавить" className="add-button">
            <BsDatabaseFillAdd />
          </button>
          <button onClick={handleEditDoc} title="Редактировать" className="edit-button">
            <TbDatabaseEdit />
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} title="Удалить" className="delete-button">
            <MdDelete />
          </button>
          <button onClick={fetchDocs} title="Обновить" className="change-refresh-button">
            <FaSync />
          </button>
          <button onClick={() => setShowExportDialog(true)} title="Экспорт" className="excel-button">
            <FaFileExcel />
          </button>
        </div>

        <div className="docs-table">
          <table>
            <thead>
              <tr>
                <th className="bold-text">Название документа</th>
                <th className="bold-text doc-th-esp-number">Номер ЕСПП</th>
                <th className="bold-text doc-th-easd-number">Номер ЕАСД</th>
                <th className="bold-text doc-th-last-date">Крайний срок</th>
                <th className="bold-text doc-th-check-date">Дата проверки</th>
                <th className="bold-text doc-th-comments">Замечания</th>
                <th className="bold-text doc-th-link-comments">Ссылка на замечания</th>
                <th className="bold-text doc-th-elimination-date">Дата устранения</th>
                <th className="bold-text doc-th-note">Примечание</th>
              </tr>
            </thead>
            <tbody>
              {sortedFilteredDocs.map(doc => (
                <tr
                  key={doc.id}
                  className={`${doc.id === selectedRow ? 'docs-selected-row' : ''} ${doc.comments === '+' ? 'highlight-red' : ''}`}
                  onClick={() => handleRowClick(doc.id)}
                >
                  <td className="centered-text" onClick={(e) => handlePopupOpen(e, doc.document_title)}>
                    {doc.document_title}
                  </td>
                  <td className="centered-text">{doc.esp_number}</td>
                  <td className="centered-text">{doc.easd_number}</td>
                  <td className="centered-text">{formatDate(doc.last_date)}</td>
                  <td className="centered-text">{formatDate(doc.check_date)}</td>
                  <td className="centered-text">{doc.comments}</td>
                  <td className="centered-text" onClick={(e) => handleLinkPopupOpen(e, doc.link_comments)}>
                    {doc.link_comments}
                  </td>
                  <td className="centered-text">{formatDate(doc.elimination_date)}</td>
                  <td className="centered-text">{doc.note}</td>
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
              <label>Название документа:</label>
              <input type="text" name="document_title" value={formData.document_title} onChange={handleInputChange} />
              <label>Номер ЕСПП:</label>
              <input type="text" name="esp_number" value={formData.esp_number} onChange={handleInputChange} />
              <label>Номер ЕАСД:</label>
              <input type="text" name="easd_number" value={formData.easd_number} onChange={handleInputChange} />
              <label>Крайний срок:</label>
              <input type="date" name="last_date" value={formData.last_date || ''} onChange={handleInputChange} />
              <label>Дата проверки:</label>
              <input type="date" name="check_date" value={formData.check_date || ''} onChange={handleInputChange} />
              <label1>Замечания:
                <select name="comments" value={formData.comments} onChange={handleInputChange}>
                <option value="+">+</option>
                <option value="-">-</option>
              </select>
              </label1>
              {/* Используем select для поля "Замечания" */}

              <label>Ссылка на замечания:</label>
              <textarea name="link_comments" value={formData.link_comments} onChange={handleInputChange}></textarea>
              <label>Дата устранения:</label>
              <input type="date" name="elimination_date" value={formData.elimination_date || ''} onChange={handleInputChange} />
              <label>Примечание:</label>
              <textarea name="note" value={formData.note} onChange={handleInputChange}></textarea>
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
              <button onClick={handleDeleteDocConfirmed} className="delete-confirm-button">
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
        <DocExportPopup
          docs={docs}
          onClose={() => setShowExportDialog(false)}
        />
      )}

      {showLinkPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h2>Полная ссылка на замечания</h2>
            </div>
            <div className="popup-body">
              <input
                type="text"
                readOnly
                value={linkPopupContent}
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            <div className="popup-footer">
              <button className="save-button" onClick={handleCopyLink}>Копировать</button>
              <button className="cancel-button" onClick={handleLinkPopupClose}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Documentation;
