import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import './HomePage.css';

const HomePage = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const userName = user?.name?.split(' ')[0] || 'Usuário'; // Pega apenas o primeiro nome

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await logout();
    }
  };

  const mainActions = [
    {
      id: 'workout',
      title: 'Peito e Tríceps',
      subtitle: 'Treino A - Hoje',
      icon: '🏋️',
      color: '#dc267f',
      onClick: () => onNavigate('workout')
    },
    {
      id: 'catalog',
      title: 'Catálogo de Exercícios',
      subtitle: '873 exercícios disponíveis',
      icon: '💪',
      color: '#ff6b6b',
      onClick: () => onNavigate('catalog')
    },
    {
      id: 'weight',
      title: 'Controle de Peso',
      subtitle: 'Acompanhe sua evolução',
      icon: '⚖️',
      color: '#ff8e53',
      onClick: () => onNavigate('weight')
    },
    {
      id: 'diet',
      title: 'Almoço 450 kcal',
      subtitle: 'Próxima refeição',
      icon: '🥗',
      color: '#4ecdc4',
      onClick: () => onNavigate('diet')
    },
    {
      id: 'progress',
      title: 'Faltam 3 dias',
      subtitle: 'Check-in de peso',
      icon: '📊',
      color: '#6c5ce7',
      onClick: () => onNavigate('progress')
    }
  ];

  const quickStats = [
    { label: 'Treinos', value: '12', icon: '🏋️' },
    { label: 'Semana', value: '3/4', icon: '📅' },
    { label: 'Peso', value: '75kg', icon: '⚖️' },
    { label: 'Meta', value: '-2kg', icon: '🎯' }
  ];

  return (
    <div className="home-page">
      {/* Aurora Boreal Header */}
      <div className="aurora-header">
        <div className="header-content">
          <div className="header-title">
            <h1>Keima</h1>
            <p>Nossa inteligência, seu progresso</p>
          </div>
          <button onClick={handleLogout} className="logout-btn" title="Sair">
            🚪
          </button>
        </div>
      </div>

      {/* Saudação */}
      <div className="welcome-section">
        <h2>Olá, {userName}! 👋</h2>
        <p>Pronto para mais um dia de evolução?</p>
      </div>

      {/* Stats Rápidas */}
      <div className="quick-stats">
        {quickStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <span className="stat-icon">{stat.icon}</span>
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Ações Principais */}
      <div className="main-actions">
        <h3>Suas Atividades</h3>
        {mainActions.map((action) => (
          <button
            key={action.id}
            onClick={action.onClick}
            className="action-card"
            style={{ '--accent-color': action.color }}
          >
            <div className="action-icon">
              {action.icon}
            </div>
            <div className="action-content">
              <h4>{action.title}</h4>
              <p>{action.subtitle}</p>
            </div>
            <div className="action-arrow">
              →
            </div>
          </button>
        ))}
      </div>

      {/* Progresso Rápido */}
      <div className="progress-section">
        <h3>Progresso da Semana</h3>
        <div className="progress-card">
          <div className="progress-info">
            <span className="progress-label">Treinos Concluídos</span>
            <span className="progress-value">3 de 4</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: '75%' }}></div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="aurora-footer">
        <p>made by: nUnity</p>
      </div>
    </div>
  );
};

export default HomePage;

