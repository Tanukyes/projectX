# back/api/pattern_routes.py
from flask import Blueprint, jsonify, request
import json

pattern_blueprint = Blueprint('patterns', __name__)

@pattern_blueprint.route('/api/get_patterns', methods=['GET'])
def get_patterns():
    with open('client/src/components/Dobrodel/patterns.json', 'r') as f:
        data = json.load(f)
    return jsonify(data), 200

@pattern_blueprint.route('/api/save_patterns', methods=['POST'])
def save_patterns():
    patterns = request.json.get('patterns', [])
    with open('client/src/components/Dobrodel/patterns.json', 'w') as f:
        json.dump({"patterns": patterns}, f, ensure_ascii=False, indent=2)
    return jsonify({"msg": "Шаблоны успешно сохранены"}), 200
