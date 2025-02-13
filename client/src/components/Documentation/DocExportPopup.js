import React, { useState, useMemo } from 'react';
import './DocExportPopup.css';
import * as XLSX from 'xlsx';

function DocExportPopup({ docs, onClose }) {
  // Фильтры: диапазон дат по полю "Крайний срок" и фильтр по названию документа
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [docTitleFilter, setDocTitleFilter] = useState('');

  // Вычисляем отфильтрованные документы
  const filteredDocs = useMemo(() => {
    let filtered = docs;
    if (startDate) {
      filtered = filtered.filter(doc => new Date(doc.last_date) >= new Date(startDate));
    }
    if (endDate) {
      filtered = filtered.filter(doc => new Date(doc.last_date) <= new Date(endDate));
    }
    if (docTitleFilter) {
      filtered = filtered.filter(doc =>
        doc.document_title.toLowerCase().includes(docTitleFilter.toLowerCase())
      );
    }
    return filtered;
  }, [docs, startDate, endDate, docTitleFilter]);

  const handleExport = () => {
    if (filteredDocs.length === 0) {
      alert("Нет данных для выгрузки");
      return;
    }

    const exportData = filteredDocs.map(doc => ({
      "Название документа": doc.document_title,
      "Номер ЕСПП": doc.esp_number,
      "Номер ЕАСД": doc.easd_number,
      "Крайний срок": doc.last_date,
      "Дата проверки": doc.check_date,
      "Замечания": doc.comments,
      "Ссылка на замечания": doc.link_comments,
      "Дата устранения": doc.elimination_date,
      "Примечание": doc.note,
      "Кто изменил": doc.last_modified_by
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Documentation");

    let fileName = "Документация.xlsx";
    if (startDate || endDate || docTitleFilter) {
      fileName = `Документация_${startDate || 'start'}_${endDate || 'end'}_${docTitleFilter || 'all'}.xlsx`;
    }
    XLSX.writeFile(workbook, fileName);
    onClose();
  };

  return (
    <div className="doc-export-popup-overlay">
      <div className="doc-export-popup-content">
        <div className="doc-export-popup-header">
          <h3>Экспорт документации</h3>
          <button className="doc-export-popup-close" onClick={onClose}>×</button>
        </div>
        <div className="doc-export-popup-body">
          <div className="doc-export-filters">
            <div className="doc-export-filter-item">
              <label>Крайний срок - С:</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="doc-export-filter-item">
              <label>Крайний срок - По:</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="doc-export-filter-item">
              <label>Название документа:</label>
              <input
                type="text"
                placeholder="Введите название..."
                value={docTitleFilter}
                onChange={(e) => setDocTitleFilter(e.target.value)}
              />
            </div>
          </div>
          {/* Таблица предварительного просмотра отфильтрованных данных */}
          <div className="doc-export-preview-table">
            <table>
              <thead>
                <tr>
                  <th>Название документа</th>
                  <th>Номер ЕСПП</th>
                  <th>Номер ЕАСД</th>
                  <th>Крайний срок</th>
                  <th>Дата проверки</th>
                  <th>Замечания</th>
                  <th>Ссылка на замечания</th>
                  <th>Дата устранения</th>
                  <th>Примечание</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, index) => (
                  <tr key={index}>
                    <td>{doc.document_title}</td>
                    <td>{doc.esp_number}</td>
                    <td>{doc.easd_number}</td>
                    <td>{doc.last_date}</td>
                    <td>{doc.check_date}</td>
                    <td>{doc.comments}</td>
                    <td>{doc.link_comments}</td>
                    <td>{doc.elimination_date}</td>
                    <td>{doc.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="doc-export-popup-footer">
          <button className="doc-export-excel-button" onClick={handleExport}>
            Экспортировать в Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocExportPopup;
