from flask import Blueprint, jsonify, request
import json
import os

pattern_blueprint = Blueprint('patterns', __name__)
patterns_file_path = os.path.join('client', 'src', 'components', 'Dobrodel', 'patterns.json')

@pattern_blueprint.route('/get_patterns', methods=['GET'])
def get_patterns():
    with open(patterns_file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return jsonify(data), 200

@pattern_blueprint.route('/save_patterns', methods=['POST'])
def save_patterns():
    patterns = request.json.get('patterns', [])
    with open(patterns_file_path, 'w', encoding='utf-8') as f:
        json.dump({"patterns": patterns}, f, ensure_ascii=False, indent=2)
    return jsonify({"msg": "Шаблоны успешно сохранены"}), 200
