from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime
from database import (
    init_database, create_user, authenticate_user, create_session,
    get_user_by_session, invalidate_session, get_user_weight_records,
    add_user_weight_record, get_user_latest_weight
)

app = Flask(__name__)
CORS(app)

# Inicializar banco de dados
init_database()

# Carregar exercícios
with open('exercises.json', 'r', encoding='utf-8') as f:
    exercises_data = json.load(f)

# Middleware para autenticação
def get_current_user():
    """Obtém usuário atual da sessão"""
    auth_header = request.headers.get('Authorization')
    if not auth_header or not auth_header.startswith('Bearer '):
        return None
    
    session_token = auth_header.split(' ')[1]
    return get_user_by_session(session_token)

def require_auth():
    """Decorator para rotas que requerem autenticação"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Acesso negado. Faça login primeiro.'}), 401
    return user

# ENDPOINTS DE AUTENTICAÇÃO

@app.route('/api/auth/register', methods=['POST'])
def register():
    """Registra um novo usuário"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['name', 'email', 'password']):
            return jsonify({'error': 'Nome, email e senha são obrigatórios'}), 400
        
        name = data['name'].strip()
        email = data['email'].strip().lower()
        password = data['password']
        
        # Validações básicas
        if len(name) < 2:
            return jsonify({'error': 'Nome deve ter pelo menos 2 caracteres'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Senha deve ter pelo menos 6 caracteres'}), 400
        
        if '@' not in email or '.' not in email:
            return jsonify({'error': 'Email inválido'}), 400
        
        user_id, message = create_user(name, email, password)
        
        if user_id:
            return jsonify({
                'success': True,
                'message': message,
                'user_id': user_id
            }), 201
        else:
            return jsonify({'error': message}), 400
            
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/login', methods=['POST'])
def login():
    """Autentica usuário"""
    try:
        data = request.get_json()
        
        if not data or not all(k in data for k in ['email', 'password']):
            return jsonify({'error': 'Email e senha são obrigatórios'}), 400
        
        email = data['email'].strip().lower()
        password = data['password']
        
        user, message = authenticate_user(email, password)
        
        if user:
            session_token = create_session(user['id'])
            if session_token:
                return jsonify({
                    'success': True,
                    'message': message,
                    'user': user,
                    'session_token': session_token
                })
            else:
                return jsonify({'error': 'Erro ao criar sessão'}), 500
        else:
            return jsonify({'error': message}), 401
            
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    """Faz logout do usuário"""
    try:
        auth_header = request.headers.get('Authorization')
        if auth_header and auth_header.startswith('Bearer '):
            session_token = auth_header.split(' ')[1]
            invalidate_session(session_token)
        
        return jsonify({
            'success': True,
            'message': 'Logout realizado com sucesso'
        })
        
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/auth/me', methods=['GET'])
def get_current_user_info():
    """Obtém informações do usuário atual"""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'Não autenticado'}), 401
    
    return jsonify({
        'success': True,
        'user': user
    })

# ENDPOINTS DE PESO (COM AUTENTICAÇÃO)

@app.route('/api/weight', methods=['POST'])
def add_weight():
    """Adiciona um novo registro de peso (requer autenticação)"""
    user = require_auth()
    if isinstance(user, tuple):  # É uma resposta de erro
        return user
    
    try:
        data = request.get_json()
        
        if not data or 'weight' not in data:
            return jsonify({'error': 'Peso é obrigatório'}), 400
        
        weight = data.get('weight')
        date = data.get('date', datetime.now().strftime('%Y-%m-%d'))
        
        # Validar peso
        try:
            weight = float(weight)
            if weight <= 0 or weight > 1000:
                return jsonify({'error': 'Peso deve estar entre 0 e 1000 kg'}), 400
        except ValueError:
            return jsonify({'error': 'Peso deve ser um número válido'}), 400
        
        # Validar data
        try:
            datetime.strptime(date, '%Y-%m-%d')
        except ValueError:
            return jsonify({'error': 'Data deve estar no formato YYYY-MM-DD'}), 400
        
        record_id, message = add_user_weight_record(user['id'], weight, date)
        
        if record_id:
            return jsonify({
                'success': True,
                'message': message,
                'record_id': record_id
            }), 201
        else:
            return jsonify({'error': message}), 500
            
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/weight', methods=['GET'])
def get_weight_history():
    """Retorna o histórico de peso do usuário (requer autenticação)"""
    user = require_auth()
    if isinstance(user, tuple):
        return user
    
    try:
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        records, total = get_user_weight_records(user['id'], limit, offset)
        
        return jsonify({
            'success': True,
            'data': records,
            'total': total,
            'limit': limit,
            'offset': offset,
            'hasMore': offset + limit < total
        })
        
    except Exception as e:
        return jsonify({'error': 'Erro ao carregar histórico'}), 500

@app.route('/api/weight/latest', methods=['GET'])
def get_latest_weight():
    """Retorna o peso mais recente do usuário (requer autenticação)"""
    user = require_auth()
    if isinstance(user, tuple):
        return user
    
    try:
        latest = get_user_latest_weight(user['id'])
        
        return jsonify({
            'success': True,
            'data': latest,
            'message': 'Peso mais recente' if latest else 'Nenhum peso registrado'
        })
        
    except Exception as e:
        return jsonify({'error': 'Erro ao carregar peso mais recente'}), 500

@app.route('/health')
def health():
    return jsonify({
        "status": "OK",
        "message": "Keima Backend funcionando!",
        "exercises": len(exercises_data)
    })

@app.route('/api/exercises')
def get_exercises():
    # Parâmetros de query
    search = request.args.get('search', '').lower()
    level = request.args.get('level', '')
    equipment = request.args.get('equipment', '')
    limit = int(request.args.get('limit', 20))
    offset = int(request.args.get('offset', 0))
    
    # Filtrar exercícios
    filtered_exercises = []
    
    for exercise in exercises_data:
        # Filtro de busca
        if search and search not in exercise.get('name', '').lower():
            continue
            
        # Filtro de nível
        if level and exercise.get('level', '').lower() != level.lower():
            continue
            
        # Filtro de equipamento
        if equipment and exercise.get('equipment', '').lower() != equipment.lower():
            continue
            
        # Traduzir campos para português
        exercise_pt = {
            'id': exercise.get('id'),
            'name': exercise.get('name'),
            'level': translate_level(exercise.get('level', '')),
            'equipment': translate_equipment(exercise.get('equipment', '')),
            'primaryMuscles': translate_muscles(exercise.get('primaryMuscles', [])),
            'secondaryMuscles': translate_muscles(exercise.get('secondaryMuscles', [])),
            'instructions': exercise.get('instructions', []),
            'images': exercise.get('images', [])
        }
        
        filtered_exercises.append(exercise_pt)
    
    # Paginação
    total = len(filtered_exercises)
    paginated = filtered_exercises[offset:offset + limit]
    
    return jsonify({
        'exercises': paginated,
        'total': total,
        'limit': limit,
        'offset': offset,
        'hasMore': offset + limit < total
    })

@app.route('/api/exercises/<exercise_id>')
def get_exercise(exercise_id):
    for exercise in exercises_data:
        if exercise.get('id') == exercise_id:
            exercise_pt = {
                'id': exercise.get('id'),
                'name': exercise.get('name'),
                'level': translate_level(exercise.get('level', '')),
                'equipment': translate_equipment(exercise.get('equipment', '')),
                'primaryMuscles': translate_muscles(exercise.get('primaryMuscles', [])),
                'secondaryMuscles': translate_muscles(exercise.get('secondaryMuscles', [])),
                'instructions': exercise.get('instructions', []),
                'images': exercise.get('images', [])
            }
            return jsonify(exercise_pt)
    
    return jsonify({'error': 'Exercício não encontrado'}), 404

@app.route('/api/exercises/stats/summary')
def get_stats():
    levels = {}
    equipment = {}
    
    for exercise in exercises_data:
        level = translate_level(exercise.get('level', ''))
        equip = translate_equipment(exercise.get('equipment', ''))
        
        levels[level] = levels.get(level, 0) + 1
        equipment[equip] = equipment.get(equip, 0) + 1
    
    return jsonify({
        'total': len(exercises_data),
        'byLevel': levels,
        'byEquipment': equipment
    })

def translate_level(level):
    translations = {
        'beginner': 'Iniciante',
        'intermediate': 'Intermediário', 
        'expert': 'Avançado'
    }
    return translations.get(level.lower(), level)

def translate_equipment(equipment):
    translations = {
        'body weight': 'Peso Corporal',
        'dumbbell': 'Halter',
        'barbell': 'Barra',
        'machine': 'Máquina',
        'cable': 'Cabo',
        'kettlebells': 'Kettlebell',
        'other': 'Outro',
        'foam roll': 'Rolo'
    }
    return translations.get(equipment.lower(), equipment)

def translate_muscles(muscles):
    translations = {
        'abdominals': 'abdominais',
        'hamstrings': 'posteriores',
        'adductors': 'adutores',
        'biceps': 'bíceps',
        'quadriceps': 'quadríceps',
        'shoulders': 'ombros',
        'middle back': 'costas médias',
        'chest': 'peito',
        'calves': 'panturrilhas',
        'glutes': 'glúteos',
        'lower back': 'lombar',
        'lats': 'dorsais',
        'triceps': 'tríceps',
        'traps': 'trapézio',
        'forearms': 'antebraços'
    }
    return [translations.get(muscle.lower(), muscle) for muscle in muscles]

# Servir arquivos estáticos do frontend
@app.route('/')
def serve_frontend():
    return send_from_directory('frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    try:
        return send_from_directory('frontend', path)
    except:
        # Para rotas SPA, retornar index.html
        return send_from_directory('frontend', 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)

