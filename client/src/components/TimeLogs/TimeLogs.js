import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import './TimeLogs.css';
import { AuthContext } from "../../contexts/authContext";
import { FaFileExcel } from "react-icons/fa";
import * as XLSX from 'xlsx';
import LogsTable from "./LogsTable";

function TimeLogs() {
    const [logs, setLogs] = useState([]);
    const [summary, setSummary] = useState('');
    const [error, setError] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [showStatistics, setShowStatistics] = useState(false);
    const [statistics, setStatistics] = useState([]);
    const [selectedUserLogs, setSelectedUserLogs] = useState([]);
    const [showUserDetails, setShowUserDetails] = useState(false);
    const [userDetailsStartDate, setUserDetailsStartDate] = useState('');
    const [userDetailsEndDate, setUserDetailsEndDate] = useState('');
    const [selectedUserFio, setSelectedUserFio] = useState('');
    const { userRole, handleLogout } = useContext(AuthContext);
    const [showAddRecordPopup, setShowAddRecordPopup] = useState(false);
    const [newRecord, setNewRecord] = useState({
        user_id: '',
        log_date: '',
        start_time: '',
        end_time: '',
        log_type: 'time_off',
        note: ''
    });
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [showMyTime, setShowMyTime] = useState(false);
    const [refreshTable, setRefreshTable] = useState(false);



        const fetchLogs = async () => {
    try {

        const response = await axios.get('http://localhost:5000/api/time_logs', {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const transformedLogs = response.data.logs
            .map((log) => ({
                ...log,
                note: log.log_type === 'polyclinic'
                    ? `(не учитывается)`
                    : log.note,
                log_type: log.log_type === 'work_time'
                    ? 'Переработка'
                    : log.log_type === 'time_off'
                    ? 'Отгул'
                    : log.log_type === 'polyclinic'
                    ? 'Поликлиника'
                    : log.log_type
            }))
            .sort((a, b) => {
                const dateA = new Date(a.log_date.split('.').reverse().join('-'));
                const dateB = new Date(b.log_date.split('.').reverse().join('-'));
                return dateB - dateA;
            });


        setLogs(transformedLogs);
        setFilteredLogs(transformedLogs);
        setSummary(response.data.summary);
    } catch (err) {
        console.error('Ошибка загрузки данных:', err);
    }
};

    useEffect(() => {
        fetchLogs();
    }, []);


    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/rooms_with_users', {
                    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                if (Array.isArray(response.data.rooms)) {
                    setRooms(response.data.rooms);
                }else{
                    console.error('', response.data.rooms);
                }

            } catch (err) {
                if (err.response && err.response.status === 403){
                    console.warn("Нет доступа к комнатам");
                }else{
                    console.error("Ошибка при загрузке комнат и пользователей:", err.response?.data || err.message());
                    setError('Ошибка при загрузке данных.');
                }
            }
        };
        fetchRooms();
    }, []);

    const handleAddRecord = async () => {
        try {
            await axios.post('http://localhost:5000/api/time_logs', newRecord, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });


            setRefreshTable(prev => !prev); // Триггерим обновление

            setNewRecord({
                user_id: '',
                log_date: '',
                start_time: '',
                end_time: '',
                log_type: 'time_off',
                note: '',
            });

            setShowAddRecordPopup(false);
            alert('Запись успешно добавлена');
        } catch (err) {
            console.error('Ошибка при добавлении записи:', err);
            alert('Ошибка при добавлении записи');
        }
    };

    const handleFilter = () => {
        const filtered = logs.filter((log) => {
            const logDate = new Date(log.log_date.split('.').reverse().join('-'));
            const start = startDate ? new Date(startDate) : null;
            const end = endDate ? new Date(endDate) : null;

            if (start && logDate < start) return false;
            if (end && logDate > end) return false;

            return true;
        });

        setFilteredLogs(filtered);
    };

    const fetchStatistics = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/statistics', {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            setStatistics(response.data);
        } catch (err) {
            console.error('Ошибка получения статистики', err.response ? err.response.data : err.message);
        }
    };

    const handleStatisticsClick = () => {
        fetchStatistics();
        setShowStatistics(true);
    };

    const handleUserClick = async (userId, userFio) => {
    try {
        setSelectedUserFio(userFio);
        const response = await axios.get(`http://localhost:5000/api/user_logs/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const logs = Array.isArray(response.data) ? response.data : [];

        if (!logs.length) {
            console.warn("Нет данных для пользователя", userId);
            alert("Нет данных для отображения.");
            return;
        }

        const transformedUserLogs = logs.map((log) => ({
            ...log,
            user_id: userId, // Теперь user_id явно добавляется в каждый лог
            log_type: log.log_type === 'work_time'
                ? 'Переработка'
                : log.log_type === 'time_off'
                ? 'Отгул'
                : log.log_type === 'polyclinic'
                ? 'Поликлиника'
                : log.log_type,
            note: log.log_type === 'polyclinic'
                ? `${log.note} (не учитывается)`
                : log.note
        })).sort((a, b) => {
            const dateA = new Date(a.log_date.split('.').reverse().join('-'));
            const dateB = new Date(b.log_date.split('.').reverse().join('-'));
            return dateB - dateA;
        });

        setSelectedUserLogs(transformedUserLogs);
        setShowUserDetails(true);
    } catch (err) {
        console.error("Ошибка получения данных пользователя", err);
        alert("Ошибка при загрузке данных.");
    }
};


    const filterUserDetails = () => {
        const filtered = selectedUserLogs.filter((log) => {
            const logDate = new Date(log.log_date.split('.').reverse().join('-'));
            const start = userDetailsStartDate ? new Date(userDetailsStartDate) : null;
            const end = userDetailsEndDate ? new Date(userDetailsEndDate) : null;

            if (start && logDate < start) return false;
            if (end && logDate > end) return false;

            return true;
        });

        setSelectedUserLogs(filtered);
    };

    const exportToExcel = async () => {
    if (!selectedUserLogs.length) {
        alert("Нет данных для экспорта.");
        return;
    }

    // Получаем user_id из логов
    const userId = selectedUserLogs[0]?.user_id;

    if (!userId) {
        console.error("Ошибка: user_id не найден в selectedUserLogs.");
        alert("Ошибка при формировании отчета: user_id отсутствует.");
        return;
    }

    try {
        // Запрос на получение summary для конкретного пользователя
        const response = await axios.get(`http://localhost:5000/api/user_summary/${userId}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        const userSummary = response.data.summary || "Нет данных";

        // Формирование данных для Excel
        const worksheetData = [
            [{ v: `${selectedUserFio}: ${userSummary}`, s: { alignment: { horizontal: 'center' } } }],
            ["Дата", "Время с", "Время по", "Тип", "Количество времени", "Причина"], // Заголовки
            ...selectedUserLogs.map((log) => [
                log.log_date,
                log.start_time,
                log.end_time,
                log.log_type,
                log.calculated_time,
                log.note
            ])
        ];

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

        // Объединение ячеек для заголовка (первая строка)
        if (worksheet["!merges"] === undefined) worksheet["!merges"] = [];
        worksheet["!merges"].push({
            s: { r: 0, c: 0 }, // Начало объединения
            e: { r: 0, c: 5 }  // Конец объединения
        });

        // Создание книги и добавление листа
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Детальная статистика');
        XLSX.writeFile(workbook, `${selectedUserFio}_детальная_статистика.xlsx`);
    } catch (err) {
        console.error("Ошибка при получении summary пользователя:", err);
        alert("Ошибка при формировании отчета.");
    }
};

    return (
        <div className="time-logs-container">

            {['t-user', 'powT-user'].includes(userRole) && (
                <button className="time-logs-logout-button" onClick={handleLogout}>Выход</button>
            )}

            <h2>Журнал отгулов</h2>

            {error && <p className="error">{error}</p>}

            {['user', 't-user', 'upUser', 'smena', 'upSmena'].includes(userRole) && (
                <div className="summary-box">
                    <p>{summary}</p>
                </div>
            )}

            {['user', 't-user', 'upUser', 'smena', 'upSmena'].includes(userRole) && (
                <div className="time-filter-container">
                    <label htmlFor="start-date">Начало периода:</label>
                    <input
                        type="date"
                        id="start-date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <label htmlFor="end-date">Конец периода:</label>
                    <input
                        type="date"
                        id="end-date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <button onClick={handleFilter}>Применить</button>
                </div>
            )}

            {['powUser', 'powT-user'].includes(userRole) && (
                <button className="add-record-button" onClick={() => setShowAddRecordPopup(true)}>
                    Добавить запись
                </button>
            )}

            {showAddRecordPopup && (
                <div className="overlay">
                    <div className="add-record-popup">
                        <h3>Добавить запись</h3>
                        <div className="fio-dropdown">
                            <label>ФИО:</label>
                            <div className="dropdown">
                                <button className="dropdown-button"
                                    onClick={() => setDropdownVisible(!dropdownVisible)}>
                                    {newRecord.user_id
                                        ? rooms
                                            .flatMap((room) => room.users)
                                            .find((user) => user.user_id === newRecord.user_id)?.fio || "Выбрать пользователя"
                                        : "Выбрать пользователя"}
                                </button>
                                {dropdownVisible && (
                                    <div className="dropdown-menu2">
                                        {rooms.map((room) => (
                                            <div key={room.room_id} className="dropdown-room">
                                                <span
                                                    onClick={() =>
                                                        setSelectedRoom(selectedRoom === room.room_id ? null : room.room_id)
                                                    }
                                                    className="room-name"
                                                >
                                                    {room.room_name}
                                                </span>
                                                {selectedRoom === room.room_id && (
                                                    <div className="dropdown-users">
                                                        {room.users.map((user) => (
                                                            <div
                                                                key={user.user_id}
                                                                className="dropdown-user"
                                                                onClick={() => {
                                                                    setNewRecord({ ...newRecord, user_id: user.user_id });
                                                                    setDropdownVisible(false);
                                                                    setSelectedRoom(null);
                                                                }}
                                                            >
                                                                {user.fio}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        <label>Дата:</label>
                        <input
                            type="date"
                            value={newRecord.log_date}
                            onChange={(e) => setNewRecord({ ...newRecord, log_date: e.target.value })}
                        />

                        <label>Время с:</label>
                        <input
                            type="time"
                            value={newRecord.start_time}
                            onChange={(e) => setNewRecord({ ...newRecord, start_time: e.target.value })}
                        />

                        <label>Время по:</label>
                        <input
                            type="time"
                            value={newRecord.end_time}
                            onChange={(e) => setNewRecord({ ...newRecord, end_time: e.target.value })}
                        />

                        <label>Тип:</label>
                        <select
                            value={newRecord.log_type}
                            onChange={(e) => setNewRecord({ ...newRecord, log_type: e.target.value })}
                        >
                            <option value="time_off">Отгул</option>
                            <option value="work_time">Переработка</option>
                            <option value="polyclinic">Поликлиника</option>
                        </select>

                        <label>Причина:</label>
                        <textarea
                            value={newRecord.note}
                            onChange={(e) => setNewRecord({ ...newRecord, note: e.target.value })}
                        />

                        <div className="button-group">
                            <button onClick={handleAddRecord}>Сохранить</button>
                            <button onClick={() => setShowAddRecordPopup(false)}>Отмена</button>
                        </div>
                    </div>
                </div>
            )}

            {['powUser', 'powT-user'].includes(userRole) && (
                <button className="statistics-button" onClick={handleStatisticsClick}>Статистика</button>
            )}

            {['upUser', 'upSmena'].includes(userRole) && (
                <button className="statistics-button" onClick={handleStatisticsClick}>Статистика</button>
            )}

            {['user', 't-user', 'upUser', 'smena', 'upSmena'].includes(userRole) && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Время с</th>
                                <th>Время по</th>
                                <th>Количество времяни</th>
                                <th>Примечание</th>
                                <th>Тип</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.log_date}</td>
                                    <td>{log.start_time}</td>
                                    <td>{log.end_time}</td>
                                    <td>{log.calculated_time}</td>
                                    <td>{log.note}</td>
                                    <td>{log.log_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {['powT-user', 'powUser'].includes(userRole) && (
                <div>
                    <LogsTable refreshTrigger={refreshTable} />
                    <h3
                        onClick={() => setShowMyTime(!showMyTime)}
                        style={{ cursor: 'pointer', color: '#007bff', textDecoration: 'underline' }}>
                        Мое время
                    </h3>
                    {showMyTime && (
                        <div className="my-time-container">
                            <div className="summary-box">
                                <p>{summary}</p>
                            </div>
                            <div className="time-filter-container">
                                <label htmlFor="start-date">Начало периода:</label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                                <label htmlFor="end-date">Конец периода:</label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                                <button onClick={handleFilter}>Применить</button>
                            </div>
                            <div className="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Дата</th>
                                            <th>Время с</th>
                                            <th>Время по</th>
                                            <th>Количество времяни</th>
                                            <th>Примечание</th>
                                            <th>Тип</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredLogs.map((log, index) => (
                                            <tr key={index}>
                                                <td>{log.log_date}</td>
                                                <td>{log.start_time}</td>
                                                <td>{log.end_time}</td>
                                                <td>{log.calculated_time}</td>
                                                <td>{log.note}</td>
                                                <td>{log.log_type}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {[!'powUser', !'powT-user'].includes(userRole) && (
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Дата</th>
                                <th>Время с</th>
                                <th>Время по</th>
                                <th>Количество времяни</th>
                                <th>Примечание</th>
                                <th>Тип</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log, index) => (
                                <tr key={index}>
                                    <td>{log.log_date}</td>
                                    <td>{log.start_time}</td>
                                    <td>{log.end_time}</td>
                                    <td>{log.calculated_time}</td>
                                    <td>{log.note}</td>
                                    <td>{log.log_type}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {['upUser', 'upSmena'].includes(userRole) && showStatistics && (
                <div className="overlay">
                    <div className="statistics-popup">
                        <h3>Статистика по пользователям комнаты</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Имя</th>
                                    <th>Доступное время</th>
                                </tr>
                            </thead>
                            <tbody>
                                {statistics.map((stat, index) => (
                                    <tr key={index} onClick={() => handleUserClick(stat.user_id, stat.fio)}>
                                        <td>{stat.fio}</td>
                                        <td>{stat.available_hours}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={() => setShowStatistics(false)}>Закрыть</button>
                    </div>
                </div>
            )}

            {['powUser', 'powT-user'].includes(userRole) && showStatistics && (
                <div className="overlay">
                    <div className="statistics-popup">
                        <h3>Статистика по всем комнатам</h3>
                        <div className="rooms-container">
                            {rooms.map((room) => (
                                <div key={room.room_id} className="room-container">
                                    <span
                                        className="room-name"
                                        onClick={() => setSelectedRoom(selectedRoom === room.room_id ? null : room.room_id)}>
                                        {room.room_name}
                                    </span>
                                    {selectedRoom === room.room_id && (
                                        <div className="room-details">
                                            <table className="users-table">
                                                <thead>
                                                    <tr>
                                                        <th>Имя</th>
                                                        <th>Доступное время</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {room.users.map((user) => {
                                                        const userStatistics = statistics.find((stat) => stat.user_id === user.user_id);
                                                        return (
                                                            <tr key={user.user_id}
                                                                onClick={() => handleUserClick(user.user_id, user.fio)}>
                                                                <td>{user.fio}</td>
                                                                <td>{userStatistics ? userStatistics.available_hours : "Нет данных"}</td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setShowStatistics(false)} className="apply-button">Закрыть</button>
                    </div>
                </div>
            )}

            {showUserDetails && (
                <div className="overlay">
                    <div className="user-details-popup">
                        <h3>{selectedUserFio}</h3>
                        <div className="filter-container">
                            <label htmlFor="user-details-start-date">Начало периода:</label>
                            <input
                                type="date"
                                id="user-details-start-date"
                                value={userDetailsStartDate}
                                onChange={(e) => setUserDetailsStartDate(e.target.value)}
                            />

                            <label htmlFor="user-details-end-date">Конец периода:</label>
                            <input
                                type="date"
                                id="user-details-end-date"
                                value={userDetailsEndDate}
                                onChange={(e) => setUserDetailsEndDate(e.target.value)}
                            />

                            <button onClick={filterUserDetails} className="apply-button">Применить</button>
                            <button onClick={exportToExcel} className="export-button">
                                <FaFileExcel />
                            </button>
                        </div>
                        <div className="table-container-flex">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Дата</th>
                                        <th>Время с</th>
                                        <th>Время по</th>
                                        <th>Тип</th>
                                        <th>Количество времени</th>
                                        <th>Примечание</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedUserLogs.map((log, index) => (
                                        <tr key={index}>
                                            <td>{log.log_date}</td>
                                            <td>{log.start_time}</td>
                                            <td>{log.end_time}</td>
                                            <td>{log.log_type === 'polyclinic' ? 'Поликлиника' : log.log_type}</td>
                                            <td>{log.calculated_time}</td>
                                            <td>{log.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={() => setShowUserDetails(false)} className="apply-button">Закрыть</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TimeLogs;
