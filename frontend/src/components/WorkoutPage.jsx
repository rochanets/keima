import React, { useState } from 'react';
import './WorkoutPage.css';

const WorkoutPage = ({ onNavigate }) => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [sets, setSets] = useState([]);

  const workoutTemplates = [
    {
      id: 'push',
      name: 'Treino A - Push',
      description: 'Peito, Ombros e Tríceps',
      exercises: [
        { name: 'Supino Reto', sets: 4, reps: '8-12', rest: '90s' },
        { name: 'Supino Inclinado', sets: 3, reps: '10-12', rest: '90s' },
        { name: 'Desenvolvimento', sets: 3, reps: '10-12', rest: '90s' },
        { name: 'Elevação Lateral', sets: 3, reps: '12-15', rest: '60s' },
        { name: 'Tríceps Testa', sets: 3, reps: '10-12', rest: '60s' }
      ],
      duration: '45-60 min'
    },
    {
      id: 'pull',
      name: 'Treino B - Pull',
      description: 'Costas e Bíceps',
      exercises: [
        { name: 'Puxada Frontal', sets: 4, reps: '8-12', rest: '90s' },
        { name: 'Remada Curvada', sets: 3, reps: '10-12', rest: '90s' },
        { name: 'Remada Unilateral', sets: 3, reps: '10-12', rest: '90s' },
        { name: 'Rosca Direta', sets: 3, reps: '10-12', rest: '60s' },
        { name: 'Rosca Martelo', sets: 3, reps: '12-15', rest: '60s' }
      ],
      duration: '45-60 min'
    },
    {
      id: 'legs',
      name: 'Treino C - Legs',
      description: 'Pernas e Glúteos',
      exercises: [
        { name: 'Agachamento', sets: 4, reps: '8-12', rest: '120s' },
        { name: 'Leg Press', sets: 3, reps: '12-15', rest: '90s' },
        { name: 'Stiff', sets: 3, reps: '10-12', rest: '90s' },
        { name: 'Extensora', sets: 3, reps: '12-15', rest: '60s' },
        { name: 'Flexora', sets: 3, reps: '12-15', rest: '60s' }
      ],
      duration: '60-75 min'
    }
  ];

  const startWorkout = (workout) => {
    setActiveWorkout(workout);
    setCurrentExercise(0);
    setSets([]);
  };

  const addSet = (weight, reps, rpe) => {
    const newSet = {
      exercise: currentExercise,
      weight: parseFloat(weight) || 0,
      reps: parseInt(reps) || 0,
      rpe: parseInt(rpe) || 0,
      timestamp: new Date()
    };
    setSets([...sets, newSet]);
  };

  const nextExercise = () => {
    if (currentExercise < activeWorkout.exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
    } else {
      // Finalizar treino
      alert('Treino finalizado! Parabéns! 🎉');
      setActiveWorkout(null);
      setCurrentExercise(0);
      setSets([]);
    }
  };

  if (activeWorkout) {
    const exercise = activeWorkout.exercises[currentExercise];
    const exerciseSets = sets.filter(set => set.exercise === currentExercise);

    return (
      <div className="workout-page">
        {/* Header do Treino Ativo */}
        <div className="workout-header">
          <button 
            className="back-btn"
            onClick={() => setActiveWorkout(null)}
          >
            ← Voltar
          </button>
          <div className="workout-info">
            <h1>{activeWorkout.name}</h1>
            <p>Exercício {currentExercise + 1} de {activeWorkout.exercises.length}</p>
          </div>
        </div>

        {/* Exercício Atual */}
        <div className="current-exercise">
          <h2>{exercise.name}</h2>
          <div className="exercise-meta">
            <span>🎯 {exercise.sets} séries</span>
            <span>🔢 {exercise.reps} reps</span>
            <span>⏱️ {exercise.rest} descanso</span>
          </div>
        </div>

        {/* Séries Registradas */}
        <div className="sets-section">
          <h3>Séries ({exerciseSets.length}/{exercise.sets})</h3>
          {exerciseSets.map((set, index) => (
            <div key={index} className="set-record">
              <span className="set-number">{index + 1}</span>
              <span>{set.weight}kg × {set.reps} reps</span>
              <span className="rpe">RPE {set.rpe}</span>
            </div>
          ))}
        </div>

        {/* Adicionar Série */}
        <div className="add-set-section">
          <h3>Nova Série</h3>
          <form onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            addSet(
              formData.get('weight'),
              formData.get('reps'),
              formData.get('rpe')
            );
            e.target.reset();
          }}>
            <div className="input-row">
              <input
                type="number"
                name="weight"
                placeholder="Peso (kg)"
                step="0.5"
                required
              />
              <input
                type="number"
                name="reps"
                placeholder="Reps"
                min="1"
                required
              />
              <input
                type="number"
                name="rpe"
                placeholder="RPE"
                min="1"
                max="10"
                required
              />
            </div>
            <button type="submit" className="add-set-btn">
              Adicionar Série
            </button>
          </form>
        </div>

        {/* Próximo Exercício */}
        {exerciseSets.length >= exercise.sets && (
          <button className="next-exercise-btn" onClick={nextExercise}>
            {currentExercise < activeWorkout.exercises.length - 1 
              ? 'Próximo Exercício →' 
              : 'Finalizar Treino 🎉'
            }
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="workout-page">
      {/* Aurora Boreal Header */}
      <div className="aurora-header">
        <h1>Treinos</h1>
        <p>Escolha seu treino de hoje</p>
      </div>

      {/* Botões de Ação */}
      <div className="action-buttons">
        <button 
          className="action-btn primary"
          onClick={() => onNavigate('catalog')}
        >
          <span className="btn-icon">💪</span>
          <div className="btn-content">
            <h3>Criar Treino</h3>
            <p>Monte seu treino personalizado</p>
          </div>
        </button>

        <button className="action-btn secondary">
          <span className="btn-icon">🤖</span>
          <div className="btn-content">
            <h3>IA Gerar Treino</h3>
            <p>Deixe a IA criar para você</p>
          </div>
        </button>
      </div>

      {/* Templates de Treino */}
      <div className="workout-templates">
        <h2>Templates Prontos</h2>
        {workoutTemplates.map(workout => (
          <div key={workout.id} className="workout-card">
            <div className="workout-info">
              <h3>{workout.name}</h3>
              <p>{workout.description}</p>
              <div className="workout-meta">
                <span>📋 {workout.exercises.length} exercícios</span>
                <span>⏱️ {workout.duration}</span>
              </div>
            </div>
            <button 
              className="start-workout-btn"
              onClick={() => startWorkout(workout)}
            >
              Iniciar
            </button>
          </div>
        ))}
      </div>

      {/* Histórico Rápido */}
      <div className="recent-workouts">
        <h2>Últimos Treinos</h2>
        <div className="recent-item">
          <div className="recent-info">
            <h4>Treino A - Push</h4>
            <p>Ontem • 52 min • 5 exercícios</p>
          </div>
          <span className="recent-status">✅</span>
        </div>
        <div className="recent-item">
          <div className="recent-info">
            <h4>Treino B - Pull</h4>
            <p>2 dias atrás • 48 min • 5 exercícios</p>
          </div>
          <span className="recent-status">✅</span>
        </div>
      </div>

      {/* Footer */}
      <div className="aurora-footer">
        <p>made by: nUnity</p>
      </div>
    </div>
  );
};

export default WorkoutPage;

