from back.extensions import db
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timedelta, timezone
from back.models import User
from back.models.time_logs import TimeLog

time_logs_blueprint = Blueprint('time_logs', __name__, url_prefix='/api')

@time_logs_blueprint.route('/time_logs', methods=['GET'])
@jwt_required()
def get_time_logs():
    try:
        current_user_id = get_jwt_identity()
        if isinstance(current_user_id, str):
            current_user_id = int(current_user_id)
        # Получить текущего пользователя
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"msg": "Пользователь не найден"}), 404
        # Проверить роль пользователя
        user_role = str(current_user.role).strip()
        if user_role in ['powUser', 'powT-user']:
            # Если пользователь имеет права, возвращаем все логи
            logs = TimeLog.query.all()
        else:
            # Иначе только логи текущего пользователя
            logs = TimeLog.query.filter_by(user_id=current_user_id).all()
        total_time_seconds = 0
        logs_data = []
        for log in logs:
            duration_seconds = (log.end_time - log.start_time).total_seconds()
            if log.log_type == 'work_time':
                total_time_seconds += duration_seconds
            elif log.log_type == 'time_off':
                total_time_seconds -= duration_seconds
            elif log.log_type == 'polyclinic':
                pass
            logs_data.append({
                "user_id": log.user_id,  # Добавляем user_id для связи с именем
                "log_date": log.log_date.strftime('%d.%m.%Y'),
                "start_time": log.start_time.strftime('%H:%M'),
                "end_time": log.end_time.strftime('%H:%M'),
                "calculated_time": f"{int(duration_seconds // 3600)}ч {int((duration_seconds % 3600) // 60)}м",
                "note": log.note if log.log_type != 'polyclinic' else f"(не учитывается)",
                "log_type": log.log_type
            })
        hours = int(abs(total_time_seconds) // 3600)
        minutes = int(abs(total_time_seconds) % 3600) // 60
        time_label = f"{hours} час{'а' if 1 < hours < 5 else '' if hours == 1 else 'ов'} {minutes} минут{'ы' if 1 < minutes < 5 else '' if minutes == 1 else ''}"
        if total_time_seconds >= 0:
            summary = f"Есть {time_label} на отгулы"
        else:
            summary = f"Необходимо отработать {time_label}"
        logs_data.sort(key=lambda x: datetime.strptime(x['log_date'], '%d.%m.%Y'), reverse=True)
        return jsonify({"logs": logs_data, "summary": summary}), 200
    except Exception as e:
        return jsonify({"error": str(e), "msg": "Ошибка сервера"}), 500

@time_logs_blueprint.route('/statistics', methods=['GET'])
@jwt_required()
def get_statistics():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        role = str(current_user.role).replace('<Role ', '').replace('>','').strip()

        if role in ['powUser', 'powT-user']:
            room_users = User.query.all()
        else:
            room_users = User.query.filter_by(room=current_user.room).all()

        statistics = []

        for user in room_users:
            logs = TimeLog.query.filter_by(user_id=user.id).all()

            total_time_seconds = 0
            user_logs = []

            for log in logs:
                duration_seconds = (log.end_time - log.start_time).total_seconds()

                if log.log_type == 'work_time':
                    total_time_seconds += duration_seconds
                elif log.log_type == 'time_off':
                    total_time_seconds -= duration_seconds
                elif log.log_type == 'polyclinic':

                    pass

                user_logs.append({
                    "log_date": log.log_date.strftime('%d.%m.%Y'),
                    "start_time": log.start_time.strftime('%H:%M'),
                    "end_time": log.end_time.strftime('%H:%M'),
                    "log_type": log.log_type if log.log_type != 'polyclinic' else 'Поликлиника',
                    "calculated_time": f"{int(duration_seconds // 3600)}ч {int((duration_seconds % 3600) // 60)}м",
                    "note": log.note if log.log_type != 'polyclinic' else f"(не учитывается)"
                })

            hours = int(abs(total_time_seconds) // 3600)
            minutes = int((abs(total_time_seconds) % 3600) // 60)
            time_label = f"{hours} час{'а' if 1 < hours < 5 else '' if hours == 1 else 'ов'} {minutes} минут{'ы' if 1 < minutes < 5 else '' if minutes == 1 else ''}"

            if total_time_seconds >= 0:
                available_time = f" {time_label} на отгулы"
            else:
                available_time = f"Необходимо отработать {time_label}"

            statistics.append({
                "user_id": user.id,
                "fio": user.fio,
                "available_hours": available_time,
                "logs": user_logs
            })

        return jsonify(statistics), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка получения статистики", "error": str(e)}), 500

@time_logs_blueprint.route('/user_logs/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_logs(user_id):
    try:
        logs = TimeLog.query.filter_by(user_id=user_id).all()
        logs_data = []

        for log in logs:
            duration_seconds = (log.end_time - log.start_time).total_seconds()

            logs_data.append({
                "user_id": log.user_id,  # Теперь user_id добавляется в каждый лог
                "log_date": log.log_date.strftime('%d.%m.%Y'),
                "start_time": log.start_time.strftime('%H:%M'),
                "end_time": log.end_time.strftime('%H:%M'),
                "log_type": log.log_type if log.log_type != 'polyclinic' else 'Поликлиника',
                "calculated_time": f"{int(duration_seconds // 3600)}ч {int((duration_seconds % 3600) // 60)}м",
                "note": log.note if log.log_type != 'polyclinic' else f"(не учитывается)"
            })

        logs_data.sort(key=lambda x: datetime.strptime(x['log_date'], '%d.%m.%Y'), reverse=True)

        return jsonify(logs_data), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка получения данных", "error": str(e)}), 500

@time_logs_blueprint.route('/time_logs', methods=['POST'])
@jwt_required()
def add_time_log():
    try:
        data = request.get_json()
        log_date = datetime.strptime(data['log_date'], '%Y-%m-%d').date()
        start_time = datetime.strptime(data['start_time'], '%H:%M')
        end_time = datetime.strptime(data['end_time'], '%H:%M')

        if start_time >= end_time:
            return jsonify({"msg": "Время окончания должно быть позже времени начала"}), 400
        if log_date > datetime.now(timezone.utc).date():
            return jsonify({"msg": "Дата не может быть в будущем"}), 400
        new_log = TimeLog(
            user_id=data['user_id'],
            log_date=log_date,
            start_time=start_time,
            end_time=end_time,
            log_type=data['log_type'],
            note=data.get('note', ''),
            created_by=get_jwt_identity()
        )
        db.session.add(new_log)
        db.session.commit()
        return jsonify({
            "msg": "Запись успешно добавлена",
            "new_log": {
                "log_date": log_date.strftime('%d.%m.%Y'),
                "start_time": start_time.strftime('%H:%M'),
                "end_time": end_time.strftime('%H:%M'),
                "log_type": data['log_type'],
                "note": data.get('note', '')
            }
        }), 201
    except Exception as e:
        return jsonify({"error": str(e), "msg": "Ошибка сервера"}), 500

@time_logs_blueprint.route('/users', methods=['GET'])
@jwt_required()
def get_users():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)

        if not current_user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        users = User.query.all()
        users_data = [{"id": user.id, "fio": user.fio} for user in users]

        return jsonify(users_data), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка при загрузке пользователей", "error": str(e)}), 500

@time_logs_blueprint.route('/rooms_with_users', methods=['GET'])
@jwt_required()
def get_rooms_with_users():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"msg": "Пользователь не найден"}), 404
        # Получить роль пользователя
        role = str(current_user.role).replace('<Role ', '').replace('>', '').strip()
        print(f"Role: {role}, Type: {type(current_user.role)}")
        # Проверить роль
        if role not in ['powUser', 'powT-user']:
            return jsonify({"msg": "У вас нет доступа к просмотру всех комнат"}), 403
        # Получение всех комнат и пользователей
        rooms = {}
        users = User.query.all()
        for user in users:
            if user.room not in rooms:
                rooms[user.room] = {"room_id": user.room, "room_name": f"Комната {user.room}", "users": []}
            rooms[user.room]["users"].append({"user_id": user.id, "fio": user.fio})
        return jsonify({"rooms": list(rooms.values())}), 200
    except Exception as e:
        print(f"Ошибка: {e}")
        return jsonify({"msg": "Ошибка при получении комнат и пользователей", "error": str(e)}), 500

from sqlalchemy.orm import aliased

@time_logs_blueprint.route('/time_logs/last', methods=['GET'])
@jwt_required()
def get_last_time_logs():
    try:
        current_user_id = get_jwt_identity()
        current_user = User.query.get(current_user_id)
        if not current_user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        role = str(current_user.role).replace('<Role ', '').replace('>', '').strip()

        # Проверяем роль пользователя, чтобы предоставить доступ ко всем записям
        if role not in ['powUser', 'powT-user']:
            return jsonify({"msg": "У вас нет прав для просмотра записей всех пользователей"}), 403

        # Получаем текущую дату и дату месяц назад
        current_date = datetime.now(timezone.utc)
        one_month_ago = current_date - timedelta(days=30)

        # Создаем алиасы для таблицы User
        user_alias = aliased(User)
        created_by_alias = aliased(User)

        # Основной запрос, объединяющий данные пользователей, авторов и записи за последний месяц
        logs = db.session.query(
            TimeLog,
            user_alias.fio.label('user_fio'),
            created_by_alias.fio.label('created_by_fio'),
        ).join(
            user_alias, TimeLog.user_id == user_alias.id
        ).join(
            created_by_alias, TimeLog.created_by == created_by_alias.id
        ).filter(
            TimeLog.created_at >= one_month_ago,  # Фильтруем записи начиная с месяца назад
            TimeLog.created_at <= current_date    # До текущей даты
        ).all()

        logs_data = []
        for log, user_fio, created_by_fio in logs:
            duration_seconds = (log.end_time - log.start_time).total_seconds()
            logs_data.append({
                "id": log.id,
                "user_id": log.user_id,
                "fio": user_fio,
                "created_by": created_by_fio,
                "log_date": log.log_date.strftime('%d.%m.%Y'),
                "start_time": log.start_time.strftime('%H:%M'),
                "end_time": log.end_time.strftime('%H:%M'),
                "calculated_time": f"{int(duration_seconds // 3600)}ч {int((duration_seconds % 3600) // 60)}м",
                "note": log.note if log.log_type != 'polyclinic' else f"(не учитывается)",
                "log_type": log.log_type,
                "created_at": log.created_at.strftime('%d.%m.%Y %H:%M')  # Форматируем created_at
            })

        # Сортируем записи по времени добавления (created_at), чтобы последние записи были сверху
        logs_data.sort(key=lambda x: x["created_at"], reverse=True)

        return jsonify({"logs": logs_data}), 200
    except Exception as e:
        return jsonify({"error": str(e), "msg": "Ошибка сервера"}), 500

@time_logs_blueprint.route('/time_logs/<int:id>', methods=['PUT'])
@jwt_required()
def update_time_log(id):
    try:
        data = request.get_json()
        log = TimeLog.query.get(id)
        if not log:
            return jsonify({"msg": "Запись не найдена"}), 404

        log.start_time = datetime.strptime(data['start_time'], '%H:%M')
        log.end_time = datetime.strptime(data['end_time'], '%H:%M')
        log.log_date = datetime.strptime(data['log_date'], '%Y-%m-%d').date()
        log.log_type = data['log_type']  # Убедитесь, что log_type обновляется
        log.note = data.get('note', '')

        db.session.commit()
        return jsonify({"msg": "Запись обновлена", "updated_log": log.to_dict()}), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка обновления", "error": str(e)}), 500


@time_logs_blueprint.route('/time_logs/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_time_log(id):
    try:
        log = TimeLog.query.get(id)
        if not log:
            return jsonify({"msg": "Запись не найдена"}), 404
        db.session.delete(log)
        db.session.commit()
        return jsonify({"msg": "Запись удалена"}), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка удаления", "error": str(e)}), 500

@time_logs_blueprint.route('/user_summary/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user_summary(user_id):
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"msg": "Пользователь не найден"}), 404

        logs = TimeLog.query.filter_by(user_id=user_id).all()
        total_time_seconds = sum(
            (log.end_time - log.start_time).total_seconds() * (1 if log.log_type == 'work_time' else -1 if log.log_type == 'time_off' else 0)
            for log in logs
        )

        hours = int(abs(total_time_seconds) // 3600)
        minutes = int((abs(total_time_seconds) % 3600) // 60)
        time_label = f"{hours} час{'а' if 1 < hours < 5 else '' if hours == 1 else 'ов'} {minutes} минут{'ы' if 1 < minutes < 5 else '' if minutes == 1 else ''}"

        summary = f"Есть {time_label} на отгулы" if total_time_seconds >= 0 else f"Необходимо отработать {time_label}"

        return jsonify({"summary": summary}), 200
    except Exception as e:
        return jsonify({"msg": "Ошибка получения summary", "error": str(e)}), 500
