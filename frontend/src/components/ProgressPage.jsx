import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, TrendingDown, Calendar, Scale } from 'lucide-react'
import '../App.css'

const ProgressPage = () => {
  const navigate = useNavigate()
  const [currentWeight, setCurrentWeight] = useState('')
  const [showWeightInput, setShowWeightInput] = useState(false)

  const weightHistory = [
    { date: '01/08', weight: 75.0 },
    { date: '08/08', weight: 74.5 },
    { date: '15/08', weight: 73.8 },
    { date: '22/08', weight: 73.2 }
  ]

  const stats = [
    {
      label: 'Peso Atual',
      value: '73.2 kg',
      change: '-1.8 kg',
      icon: Scale,
      color: 'text-green-500'
    },
    {
      label: 'Treinos',
      value: '24 sessões',
      change: '+8 este mês',
      icon: TrendingDown,
      color: 'text-red-500'
    },
    {
      label: 'Sequência',
      value: '3 dias',
      change: 'Atual',
      icon: Calendar,
      color: 'text-blue-500'
    }
  ]

  const handleWeightSubmit = () => {
    if (currentWeight) {
      // Simular salvamento
      setShowWeightInput(false)
      setCurrentWeight('')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Aurora Boreal Header */}
      <div className="aurora-header h-20 flex items-center justify-between px-6">
        <button 
          onClick={() => navigate('/home')}
          className="text-white p-2"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-lg font-thin text-white">Keima</h1>
        <div></div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 container-keima">
        <div className="text-center mb-8">
          <h2 className="text-2xl text-ultra-thin text-gray-800">
            SEU PROGRESSO
          </h2>
        </div>

        <div className="space-y-8">
          {/* Estatísticas */}
          <div className="space-y-4">
            {stats.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center ${stat.color}`}>
                      <IconComponent size={20} />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 text-thin">{stat.label}</p>
                      <p className="text-lg text-thin text-gray-800">{stat.value}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm text-thin ${stat.color}`}>
                      {stat.change}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Gráfico de Peso Simplificado */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h3 className="text-lg text-thin text-gray-800 mb-6">Evolução do Peso</h3>
            
            <div className="space-y-4">
              {weightHistory.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 text-thin">{entry.date}</span>
                  <div className="flex items-center space-x-3">
                    <div 
                      className="h-2 bg-red-500 rounded-full"
                      style={{ 
                        width: `${Math.max(20, (76 - entry.weight) * 20)}px` 
                      }}
                    ></div>
                    <span className="text-sm text-thin text-gray-800 w-12 text-right">
                      {entry.weight}kg
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Check-in de Peso */}
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg text-thin text-gray-800">Check-in Semanal</h3>
              <span className="text-sm text-gray-600 text-thin">Faltam 3 dias</span>
            </div>

            {!showWeightInput ? (
              <button
                onClick={() => setShowWeightInput(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 text-thin hover:border-red-500 hover:text-red-500 transition-colors"
              >
                Registrar peso de hoje
              </button>
            ) : (
              <div className="space-y-4">
                <input
                  type="number"
                  step="0.1"
                  placeholder="73.0"
                  value={currentWeight}
                  onChange={(e) => setCurrentWeight(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-center text-lg"
                />
                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowWeightInput(false)}
                    className="flex-1 py-3 border border-gray-300 text-gray-600 rounded-xl text-thin hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleWeightSubmit}
                    className="flex-1 py-3 bg-red-500 text-white rounded-xl text-thin hover:bg-red-600 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Aurora Boreal Footer */}
      <div className="aurora-footer h-12 flex items-center justify-center">
        <p className="text-white text-xs text-thin">
          made by: <span className="font-medium">nUnity</span>
        </p>
      </div>
    </div>
  )
}

export default ProgressPage

