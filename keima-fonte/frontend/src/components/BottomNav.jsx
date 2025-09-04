import React from 'react';
import './BottomNav.css';

const BottomNav = ({ currentPage, onNavigate }) => {
  const navItems = [
    { id: 'home', icon: '🏠', label: 'Home' },
    { id: 'weight', icon: '⚖️', label: 'Peso' },
    { id: 'catalog', icon: '💪', label: 'Exercícios' },
    { id: 'workout', icon: '🏋️', label: 'Treino' },
    { id: 'diet', icon: '🥗', label: 'Dieta' },
    { id: 'progress', icon: '📊', label: 'Progresso' }
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(item => (
        <button
          key={item.id}
          className={currentPage === item.id ? 'active' : ''}
          onClick={() => onNavigate(item.id)}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;

