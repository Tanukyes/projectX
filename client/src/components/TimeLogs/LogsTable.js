import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './LogsTable.css';
import {FaSyncAlt, FaFileExcel, FaEdit, FaTrashAlt} from 'react-icons/fa';
import * as XLSX from 'xlsx';
import {MdFilterAltOff} from "react-icons/md";
import {IconContext} from "react-icons";

function LogsTable({refreshTrigger}) {
    const [logs, setLogs] = useState([]);
    const [error, setError] = useState('');
    const [searchCategory, setSearchCategory] = useState('fio'); // Категория поиска
    const [searchQuery, setSearchQuery] = useState(''); // Значение поиска
    const [selectedLog, setSelectedLog] = useState(null);
    const [selectedRow, setSelectedRow] = useState(null);
    const [editPopupOpen, setEditPopupOpen] = useState(false);
    const [deletePopupOpen, setDeletePopupOpen] = useState(false);
    const [editLogData, setEditLogData] = useState(null);
    const [buttonPosition, setButtonPosition] = useState({ top: 0, left: 0 });


    // Функция для получения логов
    const fetchLogs = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/time_logs/last', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            const logsData = response.data.logs.map((log) => ({
                ...log,
                log_type: log.log_type === 'work_time'
                    ? 'Переработка'
                    : log.log_type === 'time_off'
                    ? 'Отгул'
                    : log.log_type === 'polyclinic'
                    ? 'Поликлиника'
                    : 'Неизвестный тип',
            }));

            setLogs(logsData);
        } catch (err) {
            console.error('Ошибка загрузки логов:', err);
            setError('Ошибка загрузки данных');
        }
    };


    useEffect(() => {
        fetchLogs();
    }, [refreshTrigger]);


    // Обработка фильтрации
    const filteredLogs = logs.filter((log) => {
        if (!searchQuery) return true; // Если поле пустое, ничего не фильтруем
        const value = log[searchCategory]?.toString().toLowerCase() || '';
        return value.includes(searchQuery.toLowerCase());
    });

    const handleReset = () => setSearchQuery('');

    // Функция для выгрузки данных в Excel
    const handleExportToExcel = () => {
        if (!filteredLogs.length) {
            alert('Нет данных для экспорта.');
            return;
        }

        const worksheetData = filteredLogs.map((log) => ({
            'ФИО': log.fio,
            'Дата заявления': log.log_date,
            'Время с': log.start_time,
            'Время по': log.end_time,
            'Количество времени': log.calculated_time,
            'Тип': log.log_type,
            'Примечание': log.note,
            'Добавлено': log.created_at,
            'Кем добавлено': log.created_by,
        }));

        const worksheet = XLSX.utils.json_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Логи');

        // Скачивание файла
        XLSX.writeFile(workbook, 'Логи_записей.xlsx');
    };

    const openEditPopup = () => {
        if (!selectedLog) return;
        const formattedDate = selectedLog.log_date.split('.').reverse().join('-')
        setEditLogData({ ...selectedLog, log_date: formattedDate,});
        setEditPopupOpen(true);
    };
    const closeEditPopup = () => {
        setEditPopupOpen(false);
        setEditLogData(null);
    };
    const openDeletePopup = () => {
        setDeletePopupOpen(true);
    };
    const closeDeletePopup = () => {
        setDeletePopupOpen(false);
    };

    const handleRowClick = (log, event) => {
    if (selectedRow === log.id) {
        setSelectedRow(null); // Если клик по уже выделенной строке — убираем выделение
        setSelectedLog(null);
    } else {
        setSelectedRow(log.id);
        setSelectedLog(log);
        // Получаем координаты строки для позиционирования кнопок
        const rect = event.currentTarget.getBoundingClientRect();
        setButtonPosition({
            top: rect.top + window.scrollY - 40, // Поднимаем кнопки выше строки
            left: rect.left + rect.width - 50 // Размещаем справа от строки
        });
    }
};

    const handleSaveEdit = async () => {
    try {
        const typeMapping = {
            "Переработка": "work_time",
            "Отгул": "time_off",
            "Поликлиника": "polyclinic"
        };

        const updatedData = {
            ...editLogData,
            log_date: new Date(editLogData.log_date.split('.').reverse().join('-'))
                .toISOString()
                .split('T')[0], // Форматируем дату в YYYY-MM-DD
            log_type: typeMapping[editLogData.log_type] || editLogData.log_type // Если нет в mapping, оставляем как есть
        };


        await axios.put(`http://localhost:5000/api/time_logs/${selectedLog.id}`, updatedData, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });

        alert('Запись успешно обновлена!');
        closeEditPopup();
        fetchLogs(); // Перезагружаем данные
    } catch (err) {
        console.error('Ошибка при редактировании записи:', err);
        alert('Ошибка при редактировании записи');
    }
};


    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/api/time_logs/${selectedLog.id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
            });

            alert('Запись успешно удалена!');
            setSelectedLog(null);
            closeDeletePopup();
            fetchLogs();
        } catch (err) {
            console.error('Ошибка при удалении записи:', err);
            alert('Ошибка при удалении записи');
        }
    };

    return (
        <div className="logs-table-container">
            <h3>Добавленые записей (за месяц)</h3>

            {error && <p className="error">{error}</p>}

            {/* Поисковый контейнер */}
            <div className="search-container">
                <label>Поиск:</label>
                <select
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                >
                    <option value="fio">ФИО</option>
                    <option value="log_date">Дата заявления</option>
                    <option value="log_type">Тип</option>
                    <option value="created_at">Добавлено</option>
                    <option value="created_by">Кем добавлено</option>
                </select>
                <input
                    type="text"
                    placeholder="Введите текст для поиска..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button
                    className="my-refresh-button"
                    onClick={fetchLogs}
                    title="Обновить"
                >
                    <IconContext.Provider value={{size: 20}}>
                        <>
                            <FaSyncAlt/>
                        </>
                    </IconContext.Provider>
                </button>
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
                <button
                    className="my-export-excel-button"
                    onClick={handleExportToExcel}
                    title="Выгрузить в Excel"
                >
                    <IconContext.Provider value={{size: 20}}>
                        <>
                            <FaFileExcel/>
                        </>
                    </IconContext.Provider>
                </button>
            </div>

            {/* Таблица */}
            <div className="table-container">
                <table>
                    <thead>
                    <tr>
                        <th>ФИО</th>
                        <th>Дата заявления</th>
                        <th>Время с</th>
                        <th>Время по</th>
                        <th>Количество времени</th>
                        <th>Тип</th>
                        <th>Добавлено</th>
                        <th>Кем добавлено</th>
                        <th>Примечание</th>
                    </tr>
                    </thead>
                    <tbody>
                    {logs.map((log) => (
                        <tr key={log.id}
                            className={log.id === selectedRow ? 'selected-row' : ''}
                            onClick={(event) => handleRowClick(log, event)}
                        >
                            <td>{log.fio}</td>
                            <td>{log.log_date}</td>
                            <td>{log.start_time}</td>
                            <td>{log.end_time}</td>
                            <td>{log.calculated_time}</td>
                            <td>{log.log_type}</td>
                            <td>{log.created_at}</td>
                            <td>{log.created_by}</td>
                            <td>{log.note}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {selectedLog && (
                <div className="overlay-buttons" >
                    <button onClick={openEditPopup} title="Редактировать"><FaEdit /></button>
                    <button onClick={openDeletePopup} title="Удалить"><FaTrashAlt /></button>
                </div>
            )}

            {editPopupOpen && (
                <div className="my-popup-overlay">
                    <div className="my-popup-content">
                        <h3>Редактировать запись</h3>
                        <label>Дата:</label>
                        <input
                            type="date"
                            value={editLogData.log_date}
                            onChange={(e) => setEditLogData({...editLogData, log_date: e.target.value})}
                        />

                        <label>Время с:</label>
                        <input
                            type="time"
                            value={editLogData.start_time}
                            onChange={(e) => setEditLogData({...editLogData, start_time: e.target.value})}
                        />

                        <label>Время по:</label>
                        <input
                            type="time"
                            value={editLogData.end_time}
                            onChange={(e) => setEditLogData({...editLogData, end_time: e.target.value})}
                        />

                        <label>Тип:</label>
                        <select
                            value={editLogData.log_type}
                            onChange={(e) => {
                                setEditLogData({...editLogData, log_type: e.target.value});
                            }}
                        >
                            <option value="Переработка">Переработка</option>
                            <option value="Отгул">Отгул</option>
                            <option value="Поликлиника">Поликлиника</option>
                        </select>

                        <label>Примечание:</label>
                        <textarea
                            value={editLogData.note}
                            onChange={(e) => setEditLogData({...editLogData, note: e.target.value})}
                        />
                        <div className="popup-buttons">
                            <button onClick={handleSaveEdit}>Сохранить</button>
                            <button onClick={closeEditPopup}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}

            {deletePopupOpen && (
                <div className="my-popup-overlay">
                    <div className="my-popup-content">
                        <h3>Подтверждение удаления</h3>
                        <p>Вы уверены, что хотите удалить запись?</p>
                        <div className="popup-buttons">
                            <button onClick={handleDelete}>Удалить</button>
                            <button onClick={closeDeletePopup}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default LogsTable;