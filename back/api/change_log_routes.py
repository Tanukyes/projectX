from flask import Blueprint, jsonify, request
from ..models import ChangeLog, User
from ..extensions import db
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import jwt_required, get_jwt_identity

moscow_tz = timezone(timedelta(hours=3))

change_log_blueprint = Blueprint('change_log', __name__, url_prefix='/api')


@change_log_blueprint.route('/change_log', methods=['GET'])
@jwt_required()
def get_all_changes():
    try:
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')

        query = ChangeLog.query

        if date_from:
            query = query.filter(ChangeLog.received_date >= datetime.strptime(date_from, '%Y-%m-%d'))
        if date_to:
            query = query.filter(ChangeLog.received_date <= datetime.strptime(date_to, '%Y-%m-%d'))

        changes = query.all()
        return jsonify([change.to_dict() for change in changes]), 200
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500


@change_log_blueprint.route('/change_log', methods=['POST'])
@jwt_required()
def add_change():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Отсутствуют данные в запросе'}), 400

        user_id = get_jwt_identity()
        user = User.query.get(user_id)

        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        new_change = ChangeLog(
            esp_number=data.get('esp_number'),
            received_date=datetime.strptime(data.get('received_date'), '%Y-%m-%d') if data.get('received_date') else None,
            ec=data.get('ec'),
            task=data.get('task'),
            responsible=data.get('responsible'),
            added_by=user.id,
            completion_date=datetime.strptime(data.get('completion_date'), '%Y-%m-%d') if data.get('completion_date') else None,
            planned_date=datetime.strptime(data.get('planned_date'), '%Y-%m-%d') if data.get('planned_date') else None,
            note=data.get('note'),
            description=data.get('description')
        )
        db.session.add(new_change)
        db.session.commit()
        return jsonify(new_change.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при добавлении записи: {str(e)}'}), 500


@change_log_blueprint.route('/change_log/<int:id>', methods=['PUT'])
@jwt_required()
def update_change(id):
    try:
        data = request.get_json()
        change = ChangeLog.query.get(id)
        if not change:
            return jsonify({'error': 'Запись не найдена'}), 404
        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404
        change.esp_number = data.get('esp_number', change.esp_number)
        change.received_date = datetime.strptime(data.get('received_date'), '%Y-%m-%d') if data.get('received_date') else None
        change.ec = data.get('ec', change.ec)
        change.task = data.get('task', change.task)
        change.responsible = data.get('responsible', change.responsible)
        change.completion_date = datetime.strptime(data.get('completion_date'), '%Y-%m-%d') if data.get('completion_date') else None
        change.planned_date = datetime.strptime(data.get('planned_date'), '%Y-%m-%d') if data.get('planned_date') else None
        change.note = data.get('note', change.note)
        change.description = data.get('description', change.description)
        change.last_modified_by = user.id
        # Записываем время последнего изменения по московскому времени (UTC+3)
        change.last_modified_at = datetime.now(moscow_tz)
        db.session.commit()
        return jsonify(change.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при обновлении записи: {str(e)}'}), 500


@change_log_blueprint.route('/change_log/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_change(id):
    try:
        change = ChangeLog.query.get(id)

        if not change:
            return jsonify({'error': 'Запись не найдена'}), 404

        db.session.delete(change)
        db.session.commit()
        return jsonify({'message': 'Запись удалена'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при удалении записи: {str(e)}'}), 500