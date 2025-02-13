import React, { useState } from 'react';
import './ExcelPopup.css';
import * as XLSX from 'xlsx';

function ExcelPopup({ changes, onClose }) {
  // Варианты экспорта:
  // «Дата выполнения по "Заданию"» – value: "export_by_task"
  // «Не выполненные на текущую дату» – value: "export_not_completed"
  // «Все изменения» – value: "export_all"
  // «Планируемые изменения – На текущую дату» – value: "planned_today"
  // «Планируемые изменения – После текущей даты» – value: "planned_after"
  const [selectedOption, setSelectedOption] = useState('export_by_task');
  // Для всех вариантов, кроме "export_all", требуется выбрать дату
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  // Для варианта "export_by_task" – выбор задания (если пустая строка, значит «все задания»)
  const [selectedTask, setSelectedTask] = useState('');

  // Извлекаем уникальные задания из переданных записей
  const tasksList = Array.from(
    new Set(changes.map(change => change.task).filter(task => !!task))
  );
  // Отсортированный по алфавиту список заданий (порядок всегда ASC)
  const sortedTasksList = [...tasksList].sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: 'base' })
  );

  const handleExport = () => {
    let dataToExport = [];
    switch (selectedOption) {
      case 'export_by_task': {
        // Фильтрация по дате выполнения (completion_date) равной выбранной.
        // Если задание выбрано – дополнительно фильтруем по нему.
        dataToExport = changes.filter(change => {
          return change.completion_date === selectedDate &&
            (selectedTask ? change.task === selectedTask : true);
        });
        break;
      }
      case 'export_not_completed': {
        // Фильтрация: записи, у которых НЕ заполнена дата выполнения,
        // и планируемая дата равна выбранной.
        dataToExport = changes.filter(change => {
          return (!change.completion_date || change.completion_date === '') &&
                 change.planned_date === selectedDate;
        });
        break;
      }
      case 'export_all': {
        dataToExport = changes;
        break;
      }
      case 'planned_today': {
        // Фильтрация записей по планируемой дате, равной выбранной,
        // и исключаем записи, где уже проставлена дата выполнения.
        dataToExport = changes.filter(change =>
          change.planned_date === selectedDate &&
          (!change.completion_date || change.completion_date === '')
        );
        break;
      }
      case 'planned_after': {
        // Фильтрация: записи, у которых планируемая дата больше выбранной,
        // и где дата выполнения отсутствует.
        dataToExport = changes.filter(change => {
          return change.planned_date && change.planned_date > selectedDate &&
                 (!change.completion_date || change.completion_date === '');
        });
        break;
      }
      default:
        dataToExport = changes;
    }

    // Если данных для выгрузки нет, выводим сообщение и завершаем выполнение
    if (dataToExport.length === 0) {
      alert("Нет данных для выгрузки");
      return;
    }

    const exportData = dataToExport.map(change => ({
      'Номер в ЕСПП': change.esp_number,
      'Дата получения': change.received_date,
      'ЭК': change.ec,
      'Задание': change.task,
      'Описание': change.description,
      'Ответственный': change.responsible,
      'Дата выполнения': change.completion_date,
      'Планируемая дата': change.planned_date,
      'Примечание': change.note,
      'Кто добавил': change.added_by,       // Новое поле: ФИО добавившего запись
      'Кто изменил': change.last_modified_by,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Changes");

    let fileName = "changes.xlsx";
    switch (selectedOption) {
      case 'export_by_task':
        fileName = selectedTask
          ? `Изменения_${selectedTask}_${selectedDate}.xlsx`
          : `Изменения_по_дате_${selectedDate}.xlsx`;
        break;
      case 'export_not_completed':
        fileName = `Не_выполненные_${selectedDate}.xlsx`;
        break;
      case 'export_all':
        fileName = "Все_изменения.xlsx";
        break;
      case 'planned_today':
        fileName = `Планируемые_на_${selectedDate}.xlsx`;
        break;
      case 'planned_after':
        fileName = `Планируемые_после_${selectedDate}.xlsx`;
        break;
      default:
        fileName = "changes.xlsx";
    }

    XLSX.writeFile(workbook, fileName);
    onClose();
  };

  return (
    <div className="export-popup-overlay">
      <div className="export-popup-content">
        <div className="export-popup-header">
          <h3>Экспорт в Excel</h3>
          <button className="export-popup-close" onClick={onClose}>×</button>
        </div>

        <div className="export-popup-body">
          <p>Выберите вариант экспорта:</p>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <optgroup label="Экспорт изменений">
              <option value="export_by_task">Выполненные</option>
              <option value="export_not_completed">Не выполненные</option>
              <option value="export_all">Все изменения</option>
            </optgroup>
            <optgroup label="Планируемые изменения">
              <option value="planned_today">На текущую дату</option>
              <option value="planned_after">После текущей даты</option>
            </optgroup>
          </select>

          {/* Если выбран вариант, отличный от "export_all", показываем календарь */}
          {selectedOption !== 'export_all' && (
            <div className="export-date">
              <label>Выберите дату:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          )}

          {/* Если выбран вариант "export_by_task", показываем отсортированный список заданий */}
          {selectedOption === 'export_by_task' && (
            <div className="export-task">
              <label>Выберите задание:</label>
              <select
                value={selectedTask}
                onChange={(e) => setSelectedTask(e.target.value)}
              >
                <option value="">Все задания</option>
                {sortedTasksList.map(task => (
                  <option key={task} value={task}>{task}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="export-popup-footer">
          <button className="export-excel-button" onClick={handleExport}>
            Экспортировать в Excel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExcelPopup;