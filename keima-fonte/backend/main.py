from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import json
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

# Carregar exercícios
with open('exercises.json', 'r', encoding='utf-8') as f:
    exercises_data = json.load(f)

# Arquivo para dados de peso
WEIGHT_DATA_FILE = 'weight_data.json'

def load_weight_data():
    """Carrega dados de peso do arquivo JSON"""
    if os.path.exists(WEIGHT_DATA_FILE):
        try:
            with open(WEIGHT_DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except:
            return []
    return []

def save_weight_data(data):
    """Salva dados de peso no arquivo JSON"""
    try:
        with open(WEIGHT_DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except:
        return False

@app.route('/api/weight', methods=['POST'])
def add_weight():
    """Adiciona um novo registro de peso"""
    try:
        data = request.get_json()
        
        # Validação dos dados
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
        
        # Carregar dados existentes
        weight_data = load_weight_data()
        
        # Criar novo registro
        new_record = {
            'id': len(weight_data) + 1,
            'weight': weight,
            'date': date,
            'timestamp': datetime.now().isoformat()
        }
        
        # Adicionar e salvar
        weight_data.append(new_record)
        
        if save_weight_data(weight_data):
            return jsonify({
                'success': True,
                'message': 'Peso registrado com sucesso',
                'data': new_record
            }), 201
        else:
            return jsonify({'error': 'Erro ao salvar dados'}), 500
            
    except Exception as e:
        return jsonify({'error': 'Erro interno do servidor'}), 500

@app.route('/api/weight', methods=['GET'])
def get_weight_history():
    """Retorna o histórico de peso"""
    try:
        weight_data = load_weight_data()
        
        # Ordenar por data (mais recente primeiro)
        weight_data.sort(key=lambda x: x['date'], reverse=True)
        
        # Parâmetros de query
        limit = int(request.args.get('limit', 50))
        offset = int(request.args.get('offset', 0))
        
        # Paginação
        total = len(weight_data)
        paginated = weight_data[offset:offset + limit]
        
        return jsonify({
            'success': True,
            'data': paginated,
            'total': total,
            'limit': limit,
            'offset': offset,
            'hasMore': offset + limit < total
        })
        
    except Exception as e:
        return jsonify({'error': 'Erro ao carregar histórico'}), 500

@app.route('/api/weight/latest', methods=['GET'])
def get_latest_weight():
    """Retorna o peso mais recente"""
    try:
        weight_data = load_weight_data()
        
        if not weight_data:
            return jsonify({
                'success': True,
                'data': None,
                'message': 'Nenhum peso registrado'
            })
        
        # Ordenar por data e pegar o mais recente
        weight_data.sort(key=lambda x: x['date'], reverse=True)
        latest = weight_data[0]
        
        return jsonify({
            'success': True,
            'data': latest
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

