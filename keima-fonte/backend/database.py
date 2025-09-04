import sqlite3
import hashlib
import secrets
from datetime import datetime
import os

DATABASE_PATH = 'keima.db'

def get_db_connection():
    """Cria conexão com o banco de dados SQLite"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_database():
    """Inicializa o banco de dados com as tabelas necessárias"""
    conn = get_db_connection()
    
    # Tabela de usuários
    conn.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            salt TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_login TIMESTAMP,
            is_active BOOLEAN DEFAULT 1
        )
    ''')
    
    # Tabela de sessões
    conn.execute('''
        CREATE TABLE IF NOT EXISTS sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token TEXT UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NOT NULL,
            is_active BOOLEAN DEFAULT 1,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Tabela de dados de peso (vinculada ao usuário)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS weight_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            weight REAL NOT NULL,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    # Tabela de treinos (vinculada ao usuário)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS workout_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            exercise_id TEXT NOT NULL,
            exercise_name TEXT NOT NULL,
            sets INTEGER,
            reps INTEGER,
            weight REAL,
            duration INTEGER,
            date DATE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    ''')
    
    conn.commit()
    conn.close()

def hash_password(password, salt=None):
    """Gera hash seguro da senha com salt"""
    if salt is None:
        salt = secrets.token_hex(32)
    
    password_hash = hashlib.pbkdf2_hmac('sha256', 
                                       password.encode('utf-8'), 
                                       salt.encode('utf-8'), 
                                       100000)
    return password_hash.hex(), salt

def verify_password(password, password_hash, salt):
    """Verifica se a senha está correta"""
    computed_hash, _ = hash_password(password, salt)
    return computed_hash == password_hash

def create_user(name, email, password):
    """Cria um novo usuário"""
    conn = get_db_connection()
    
    # Verificar se email já existe
    existing_user = conn.execute(
        'SELECT id FROM users WHERE email = ?', (email,)
    ).fetchone()
    
    if existing_user:
        conn.close()
        return None, "Email já está em uso"
    
    # Criar hash da senha
    password_hash, salt = hash_password(password)
    
    try:
        cursor = conn.execute('''
            INSERT INTO users (name, email, password_hash, salt)
            VALUES (?, ?, ?, ?)
        ''', (name, email, password_hash, salt))
        
        user_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return user_id, "Usuário criado com sucesso"
    except Exception as e:
        conn.close()
        return None, f"Erro ao criar usuário: {str(e)}"

def authenticate_user(email, password):
    """Autentica usuário com email e senha"""
    conn = get_db_connection()
    
    user = conn.execute('''
        SELECT id, name, email, password_hash, salt, is_active
        FROM users WHERE email = ? AND is_active = 1
    ''', (email,)).fetchone()
    
    if not user:
        conn.close()
        return None, "Email ou senha incorretos"
    
    if not verify_password(password, user['password_hash'], user['salt']):
        conn.close()
        return None, "Email ou senha incorretos"
    
    # Atualizar último login
    conn.execute('''
        UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?
    ''', (user['id'],))
    conn.commit()
    conn.close()
    
    return {
        'id': user['id'],
        'name': user['name'],
        'email': user['email']
    }, "Login realizado com sucesso"

def create_session(user_id):
    """Cria uma nova sessão para o usuário"""
    conn = get_db_connection()
    
    # Gerar token único
    session_token = secrets.token_urlsafe(32)
    
    # Sessão expira em 30 dias
    expires_at = datetime.now().timestamp() + (30 * 24 * 60 * 60)
    expires_at_str = datetime.fromtimestamp(expires_at).isoformat()
    
    try:
        conn.execute('''
            INSERT INTO sessions (user_id, session_token, expires_at)
            VALUES (?, ?, ?)
        ''', (user_id, session_token, expires_at_str))
        
        conn.commit()
        conn.close()
        
        return session_token
    except Exception as e:
        conn.close()
        return None

def get_user_by_session(session_token):
    """Obtém usuário pela sessão"""
    conn = get_db_connection()
    
    user = conn.execute('''
        SELECT u.id, u.name, u.email
        FROM users u
        JOIN sessions s ON u.id = s.user_id
        WHERE s.session_token = ? 
        AND s.is_active = 1 
        AND s.expires_at > CURRENT_TIMESTAMP
        AND u.is_active = 1
    ''', (session_token,)).fetchone()
    
    conn.close()
    
    if user:
        return {
            'id': user['id'],
            'name': user['name'],
            'email': user['email']
        }
    return None

def invalidate_session(session_token):
    """Invalida uma sessão (logout)"""
    conn = get_db_connection()
    
    conn.execute('''
        UPDATE sessions SET is_active = 0 WHERE session_token = ?
    ''', (session_token,))
    
    conn.commit()
    conn.close()

def get_user_weight_records(user_id, limit=50, offset=0):
    """Obtém registros de peso do usuário"""
    conn = get_db_connection()
    
    records = conn.execute('''
        SELECT id, weight, date, created_at
        FROM weight_records
        WHERE user_id = ?
        ORDER BY date DESC, created_at DESC
        LIMIT ? OFFSET ?
    ''', (user_id, limit, offset)).fetchall()
    
    total = conn.execute('''
        SELECT COUNT(*) as count FROM weight_records WHERE user_id = ?
    ''', (user_id,)).fetchone()['count']
    
    conn.close()
    
    return [dict(record) for record in records], total

def add_user_weight_record(user_id, weight, date):
    """Adiciona registro de peso para o usuário"""
    conn = get_db_connection()
    
    try:
        cursor = conn.execute('''
            INSERT INTO weight_records (user_id, weight, date)
            VALUES (?, ?, ?)
        ''', (user_id, weight, date))
        
        record_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return record_id, "Peso registrado com sucesso"
    except Exception as e:
        conn.close()
        return None, f"Erro ao registrar peso: {str(e)}"

def get_user_latest_weight(user_id):
    """Obtém o peso mais recente do usuário"""
    conn = get_db_connection()
    
    record = conn.execute('''
        SELECT id, weight, date, created_at
        FROM weight_records
        WHERE user_id = ?
        ORDER BY date DESC, created_at DESC
        LIMIT 1
    ''', (user_id,)).fetchone()
    
    conn.close()
    
    if record:
        return dict(record)
    return None

# Inicializar banco de dados ao importar o módulo
if __name__ == "__main__":
    init_database()
    print("Banco de dados inicializado com sucesso!")

