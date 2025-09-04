import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './WeightPage.css';

const WeightPage = ({ onNavigate }) => {
  const { getAuthHeaders } = useAuth();
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weightHistory, setWeightHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [latestWeight, setLatestWeight] = useState(null);

  useEffect(() => {
    loadWeightHistory();
    loadLatestWeight();
  }, []);

  const loadWeightHistory = async () => {
    try {
      const response = await fetch('/api/weight', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success) {
        setWeightHistory(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
    }
  };

  const loadLatestWeight = async () => {
    try {
      const response = await fetch('/api/weight/latest', {
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setLatestWeight(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar peso mais recente:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!weight || weight <= 0) {
      setMessage('Por favor, insira um peso válido');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/weight', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          weight: parseFloat(weight),
          date: date
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Peso registrado com sucesso!');
        setWeight('');
        setDate(new Date().toISOString().split('T')[0]);
        loadWeightHistory();
        loadLatestWeight();
      } else {
        setMessage(data.error || 'Erro ao registrar peso');
      }
    } catch (error) {
      setMessage('Erro de conexão');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const calculateWeightDifference = () => {
    if (weightHistory.length < 2) return null;
    
    const latest = weightHistory[0];
    const previous = weightHistory[1];
    const diff = latest.weight - previous.weight;
    
    return {
      value: Math.abs(diff).toFixed(1),
      type: diff > 0 ? 'gain' : diff < 0 ? 'loss' : 'same'
    };
  };

  const weightDiff = calculateWeightDifference();

  return (
    <div className="weight-page">
      <div className="weight-header">
        <h1>Controle de Peso</h1>
        <p>Acompanhe sua evolução</p>
      </div>

      {/* Peso Atual */}
      {latestWeight && (
        <div className="current-weight-card">
          <div className="current-weight">
            <span className="weight-value">{latestWeight.weight}</span>
            <span className="weight-unit">kg</span>
          </div>
          <div className="weight-date">
            Última medição: {formatDate(latestWeight.date)}
          </div>
          {weightDiff && (
            <div className={`weight-change ${weightDiff.type}`}>
              {weightDiff.type === 'gain' && '↗️ +'}{weightDiff.type === 'loss' && '↘️ -'}
              {weightDiff.value} kg
            </div>
          )}
        </div>
      )}

      {/* Formulário de Entrada */}
      <div className="weight-form-card">
        <h2>Registrar Peso</h2>
        <form onSubmit={handleSubmit} className="weight-form">
          <div className="form-group">
            <label htmlFor="weight">Peso (kg)</label>
            <input
              type="number"
              id="weight"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Ex: 70.5"
              step="0.1"
              min="1"
              max="1000"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? 'Salvando...' : 'Registrar Peso'}
          </button>
        </form>

        {message && (
          <div className={`message ${message.includes('sucesso') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Histórico */}
      <div className="weight-history-card">
        <h2>Histórico</h2>
        {weightHistory.length === 0 ? (
          <p className="no-data">Nenhum registro encontrado</p>
        ) : (
          <div className="history-list">
            {weightHistory.slice(0, 10).map((record) => (
              <div key={record.id} className="history-item">
                <div className="history-weight">
                  <span className="value">{record.weight}</span>
                  <span className="unit">kg</span>
                </div>
                <div className="history-date">
                  {formatDate(record.date)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WeightPage;

