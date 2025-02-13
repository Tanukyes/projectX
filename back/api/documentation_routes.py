from flask import Blueprint, jsonify, request
from ..models import Documentation, User
from ..extensions import db
from datetime import datetime, timedelta, timezone
from flask_jwt_extended import jwt_required, get_jwt_identity

# Определяем московскую временную зону (UTC+3) – если потребуется для datetime.now()
moscow_tz = timezone(timedelta(hours=3))

documentation_blueprint = Blueprint('documentation', __name__, url_prefix='/api/documentation')


@documentation_blueprint.route('/documentation', methods=['GET'])
@jwt_required()
def get_all_documentation():
    try:
        # Фильтрация по дате (используем поле last_date)
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')

        query = Documentation.query

        if date_from:
            # Преобразуем строку в дату; поскольку поле хранит только дату,
            # используем .date()
            query = query.filter(Documentation.last_date >= datetime.strptime(date_from, '%Y-%m-%d').date())
        if date_to:
            query = query.filter(Documentation.last_date <= datetime.strptime(date_to, '%Y-%m-%d').date())

        docs = query.all()
        return jsonify([doc.to_dict() for doc in docs]), 200
    except Exception as e:
        return jsonify({'error': f'Ошибка сервера: {str(e)}'}), 500


@documentation_blueprint.route('/documentation', methods=['POST'])
@jwt_required()
def add_documentation():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Отсутствуют данные в запросе'}), 400

        user_id = get_jwt_identity()
        user = User.query.get(user_id)
        if not user:
            return jsonify({'error': 'Пользователь не найден'}), 404

        new_doc = Documentation(
            esp_number=data.get('esp_number'),
            easd_number=data.get('easd_number'),
            document_title=data.get('document_title'),
            last_date=datetime.strptime(data.get('last_date'), '%Y-%m-%d').date() if data.get('last_date') else None,
            check_date=datetime.strptime(data.get('check_date'), '%Y-%m-%d').date() if data.get('check_date') else None,
            comments=data.get('comments'),
            link_comments=data.get('link_comments'),
            elimination_date=datetime.strptime(data.get('elimination_date'), '%Y-%m-%d').date() if data.get('elimination_date') else None,
            note=data.get('note')
        )
        db.session.add(new_doc)
        db.session.commit()
        return jsonify(new_doc.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при добавлении записи: {str(e)}'}), 500


@documentation_blueprint.route('/documentation/<int:id>', methods=['PUT'])
@jwt_required()
def update_documentation(id):
    try:
        data = request.get_json()
        doc = Documentation.query.get(id)
        if not doc:
            return jsonify({'error': 'Запись не найдена'}), 404

        # Обновляем поля; если данные для поля отсутствуют или пустые, устанавливаем None
        doc.esp_number = data.get('esp_number', doc.esp_number)
        doc.easd_number = data.get('easd_number', doc.easd_number)
        doc.document_title = data.get('document_title', doc.document_title)
        doc.last_date = datetime.strptime(data.get('last_date'), '%Y-%m-%d').date() if data.get('last_date') else None
        doc.check_date = datetime.strptime(data.get('check_date'), '%Y-%m-%d').date() if data.get('check_date') else None
        doc.comments = data.get('comments', doc.comments)
        doc.link_comments = data.get('link_comments', doc.link_comments)
        doc.elimination_date = datetime.strptime(data.get('elimination_date'), '%Y-%m-%d').date() if data.get('elimination_date') else None
        doc.note = data.get('note', doc.note)

        db.session.commit()
        return jsonify(doc.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при обновлении записи: {str(e)}'}), 500


@documentation_blueprint.route('/documentation/<int:id>', methods=['DELETE'])
@jwt_required()
def delete_documentation(id):
    try:
        doc = Documentation.query.get(id)
        if not doc:
            return jsonify({'error': 'Запись не найдена'}), 404

        db.session.delete(doc)
        db.session.commit()
        return jsonify({'message': 'Запись удалена'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Ошибка при удалении записи: {str(e)}'}), 500