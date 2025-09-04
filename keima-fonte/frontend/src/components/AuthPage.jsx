import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthPage.css';

const AuthPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const { login, register } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        // Login
        const result = await login(formData.email, formData.password);
        if (result.success) {
          setMessage('Login realizado com sucesso!');
          setTimeout(() => {
            onAuthSuccess();
          }, 1000);
        } else {
          setMessage(result.message);
        }
      } else {
        // Registro
        if (formData.password !== formData.confirmPassword) {
          setMessage('As senhas não coincidem');
          setLoading(false);
          return;
        }

        const result = await register(formData.name, formData.email, formData.password);
        if (result.success) {
          setMessage('Conta criada com sucesso! Faça login para continuar.');
          setIsLogin(true);
          setFormData({
            name: '',
            email: formData.email,
            password: '',
            confirmPassword: ''
          });
        } else {
          setMessage(result.message);
        }
      }
    } catch (error) {
      setMessage('Erro inesperado. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setMessage('');
    setFormData({
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Keima</h1>
          <p>Nossa inteligência, seu progresso</p>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button 
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
            >
              Entrar
            </button>
            <button 
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
            >
              Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nome Completo</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Seu nome completo"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Senha</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Sua senha"
                required
                minLength="6"
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label htmlFor="confirmPassword">Confirmar Senha</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirme sua senha"
                  required={!isLogin}
                  minLength="6"
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="auth-submit-btn">
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          {message && (
            <div className={`auth-message ${message.includes('sucesso') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}

          <div className="auth-switch">
            <p>
              {isLogin ? 'Não tem uma conta?' : 'Já tem uma conta?'}
              <button type="button" onClick={toggleMode} className="switch-btn">
                {isLogin ? 'Criar conta' : 'Fazer login'}
              </button>
            </p>
          </div>
        </div>

        <div className="auth-footer">
          <p>made by: nUnity</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;

