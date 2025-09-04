import React, { useState, useEffect } from 'react';
import './ExerciseCatalog.css';

const ExerciseCatalog = () => {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    level: '',
    equipment: '',
    limit: 20,
    offset: 0
  });
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [stats, setStats] = useState(null);

  // Carregar exercícios
  const fetchExercises = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`http://localhost:3001/api/exercises?${queryParams}`);
      const data = await response.json();
      
      if (filters.offset === 0) {
        setExercises(data.exercises);
      } else {
        setExercises(prev => [...prev, ...data.exercises]);
      }
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/exercises/stats/summary');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }
  };

  useEffect(() => {
    fetchExercises();
    fetchStats();
  }, []);

  useEffect(() => {
    if (filters.offset === 0) {
      fetchExercises();
    }
  }, [filters.search, filters.level, filters.equipment]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const loadMore = () => {
    setFilters(prev => ({ ...prev, offset: prev.offset + prev.limit }));
    fetchExercises();
  };

  const openExerciseModal = async (exerciseId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/exercises/${exerciseId}`);
      const exercise = await response.json();
      setSelectedExercise(exercise);
    } catch (error) {
      console.error('Erro ao carregar detalhes do exercício:', error);
    }
  };

  const translateLevel = (level) => {
    const translations = {
      'beginner': 'Iniciante',
      'intermediate': 'Intermediário', 
      'advanced': 'Avançado'
    };
    return translations[level] || level;
  };

  const translateEquipment = (equipment) => {
    const translations = {
      'body only': 'Peso Corporal',
      'dumbbell': 'Halter',
      'barbell': 'Barra',
      'machine': 'Máquina',
      'cable': 'Cabo',
      'kettlebell': 'Kettlebell',
      'bands': 'Elástico',
      'medicine ball': 'Medicine Ball',
      'foam roll': 'Rolo',
      'e-z curl bar': 'Barra W'
    };
    return translations[equipment] || equipment;
  };

  return (
    <div className="exercise-catalog">
      {/* Header com Aurora Boreal */}
      <div className="aurora-header">
        <h1>Catálogo de Exercícios</h1>
        <p>{stats ? `${stats.total} exercícios` : 'Carregando...'} para seu treino perfeito</p>
      </div>

      {/* Estatísticas Rápidas */}
      {stats && (
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{stats.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.byLevel.beginner || 0}</span>
            <span className="stat-label">Iniciante</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.byLevel.intermediate || 0}</span>
            <span className="stat-label">Intermediário</span>
          </div>
          <div className="stat-item">
            <span className="stat-number">{stats.byLevel.advanced || 0}</span>
            <span className="stat-label">Avançado</span>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filters-section">
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Buscar exercícios..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-chips">
          <select
            value={filters.level}
            onChange={(e) => handleFilterChange('level', e.target.value)}
            className="filter-select"
          >
            <option value="">💪 Todos os níveis</option>
            <option value="beginner">Iniciante</option>
            <option value="intermediate">Intermediário</option>
            <option value="advanced">Avançado</option>
          </select>

          <select
            value={filters.equipment}
            onChange={(e) => handleFilterChange('equipment', e.target.value)}
            className="filter-select"
          >
            <option value="">🏋️ Todos equipamentos</option>
            <option value="body only">Peso Corporal</option>
            <option value="dumbbell">Halter</option>
            <option value="barbell">Barra</option>
            <option value="machine">Máquina</option>
            <option value="cable">Cabo</option>
            <option value="kettlebell">Kettlebell</option>
          </select>
        </div>
      </div>

      {/* Grid de Exercícios */}
      <div className="exercises-grid">
        {exercises.map(exercise => (
          <div key={exercise.id} className="exercise-card">
            <div className="exercise-image">
              <img 
                src={exercise.images[0]} 
                alt={exercise.name}
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDIwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik04NSA2MEg5NVY5MEg4NVY2MFoiIGZpbGw9IiNEQ0RDREMiLz4KPHBhdGggZD0iTTEwNSA2MEgxMTVWOTBIMTA1VjYwWiIgZmlsbD0iI0RDRENEQyIvPgo8L3N2Zz4K';
                }}
              />
              <div className="exercise-level-badge">
                {translateLevel(exercise.level)}
              </div>
            </div>
            
            <div className="exercise-info">
              <h3>{exercise.name}</h3>
              <div className="exercise-meta">
                <span className="muscle-tag">
                  🎯 {exercise.primaryMuscles[0]}
                </span>
                <span className="equipment-tag">
                  🏋️ {translateEquipment(exercise.equipment)}
                </span>
              </div>
              
              <div className="exercise-actions">
                <button 
                  onClick={() => openExerciseModal(exercise.id)}
                  className="btn-details"
                >
                  Ver Detalhes
                </button>
                <button className="btn-add-workout">
                  + Treino
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Botão Carregar Mais */}
      {!loading && exercises.length > 0 && (
        <div className="load-more-section">
          <button onClick={loadMore} className="btn-load-more">
            {loading ? 'Carregando...' : 'Carregar Mais Exercícios'}
          </button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="loading-section">
          <div className="loading-spinner"></div>
          <p>Carregando exercícios...</p>
        </div>
      )}

      {/* Modal de Detalhes */}
      {selectedExercise && (
        <div className="exercise-modal-overlay" onClick={() => setSelectedExercise(null)}>
          <div className="exercise-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedExercise.name}</h2>
              <button 
                onClick={() => setSelectedExercise(null)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              <div className="exercise-images">
                {selectedExercise.images.map((img, index) => (
                  <img 
                    key={index} 
                    src={img} 
                    alt={`${selectedExercise.name} ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ))}
              </div>
              
              <div className="exercise-details">
                <div className="detail-section">
                  <h4>🎯 Músculos Trabalhados</h4>
                  <p><strong>Principais:</strong> {selectedExercise.primaryMuscles.join(', ')}</p>
                  {selectedExercise.secondaryMuscles.length > 0 && (
                    <p><strong>Secundários:</strong> {selectedExercise.secondaryMuscles.join(', ')}</p>
                  )}
                </div>
                
                <div className="detail-section">
                  <h4>ℹ️ Informações</h4>
                  <p><strong>Equipamento:</strong> {translateEquipment(selectedExercise.equipment)}</p>
                  <p><strong>Nível:</strong> {translateLevel(selectedExercise.level)}</p>
                  <p><strong>Categoria:</strong> {selectedExercise.category}</p>
                </div>
                
                <div className="detail-section">
                  <h4>📋 Como Executar</h4>
                  <ol>
                    {selectedExercise.instructions.map((instruction, index) => (
                      <li key={index}>{instruction}</li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-add-to-workout">
                + Adicionar ao Treino
              </button>
              <button className="btn-favorite">
                ❤️ Favoritar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="aurora-footer">
        <p>made by: nUnity</p>
      </div>
    </div>
  );
};

export default ExerciseCatalog;

