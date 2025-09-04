import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scale, Dumbbell, Target } from 'lucide-react'
import '../App.css'

const OnboardingPage = () => {
  const [selectedGoal, setSelectedGoal] = useState('')
  const navigate = useNavigate()

  const goals = [
    {
      id: 'perder_peso',
      name: 'Perder Peso',
      icon: Scale,
      color: 'text-red-500'
    },
    {
      id: 'ganhar_massa',
      name: 'Ganhar Massa',
      icon: Dumbbell,
      color: 'text-orange-500'
    },
    {
      id: 'manter_peso',
      name: 'Manter Peso',
      icon: Target,
      color: 'text-green-500'
    }
  ]

  const handleGoalSelect = (goalId) => {
    setSelectedGoal(goalId)
    // Simular navegação após seleção
    setTimeout(() => {
      navigate('/home')
    }, 1000)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Aurora Boreal Header */}
      <div className="aurora-header h-32 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-thin text-white mb-2">Keima</h1>
          <div className="w-16 h-1 bg-white/30 mx-auto rounded-full"></div>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 container-keima">
        <div className="text-center mb-12">
          <p className="text-gray-400 text-lg text-thin">
            Nossa inteligência, seu progresso
          </p>
        </div>

        <div className="spacing-keima">
          <div className="text-center mb-8">
            <h2 className="text-2xl text-ultra-thin text-gray-800 mb-2">
              Qual é seu objetivo?
            </h2>
          </div>

          <div className="space-y-4">
            {goals.map((goal) => {
              const IconComponent = goal.icon
              return (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal.id)}
                  className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 flex items-center space-x-4 ${
                    selectedGoal === goal.id
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-100 bg-white hover:border-gray-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center ${goal.color}`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-lg text-thin text-gray-800">
                    {goal.name}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Aurora Boreal Footer */}
      <div className="aurora-footer h-16 flex items-center justify-center">
        <p className="text-white text-sm text-thin">
          made by: <span className="font-medium">nUnity</span>
        </p>
      </div>
    </div>
  )
}

export default OnboardingPage

