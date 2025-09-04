import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

// Contexto de autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Componentes das páginas
import OnboardingPage from './components/OnboardingPage'
import HomePage from './components/HomePage'
import WorkoutPage from './components/WorkoutPage'
import DietPage from './components/DietPage'
import ProgressPage from './components/ProgressPage'
import ExerciseCatalog from './components/ExerciseCatalog'
import WeightPage from './components/WeightPage'
import AuthPage from './components/AuthPage'
import BottomNav from './components/BottomNav'

// Componente principal da aplicação
function AppContent() {
  const [currentPage, setCurrentPage] = useState('catalog')
  const { user, loading, isAuthenticated } = useAuth()

  // Mostrar loading enquanto verifica autenticação
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner">
          <h2>Keima</h2>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  // Se não estiver autenticado, mostrar tela de login
  if (!isAuthenticated) {
    return <AuthPage onAuthSuccess={() => setCurrentPage('home')} />
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'onboarding':
        return <OnboardingPage onComplete={() => setCurrentPage('home')} />
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />
      case 'weight':
        return <WeightPage onNavigate={setCurrentPage} />
      case 'workout':
        return <WorkoutPage onNavigate={setCurrentPage} />
      case 'diet':
        return <DietPage onNavigate={setCurrentPage} />
      case 'progress':
        return <ProgressPage onNavigate={setCurrentPage} />
      case 'catalog':
        return <ExerciseCatalog onNavigate={setCurrentPage} />
      default:
        return <ExerciseCatalog onNavigate={setCurrentPage} />
    }
  }

  return (
    <div className="app-container">
      {renderPage()}
      
      {/* Navegação inferior (se não estiver no onboarding) */}
      {currentPage !== 'onboarding' && (
        <BottomNav currentPage={currentPage} onNavigate={setCurrentPage} />
      )}
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
