import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Send, Crown } from 'lucide-react'
import '../App.css'

const DietPage = () => {
  const navigate = useNavigate()
  const [isPremium] = useState(false) // Simular usuário não premium
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'keima',
      text: 'Olá, João! Bora tirar dúvidas ou ajustar sua dieta hoje? Lembre-se, meu foco atual é manter seu objetivo de perda de peso. 😊',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')

  const suggestions = [
    'Quero trocar um alimento do almoço',
    'Estou com muita fome, posso comer mais?',
    'Não gostei de um prato, tem substituto?',
    'Como está meu progresso?'
  ]

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return

    const newMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: inputMessage,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, newMessage])
    setInputMessage('')

    // Simular resposta da IA
    setTimeout(() => {
      const aiResponse = {
        id: messages.length + 2,
        sender: 'keima',
        text: 'Entendi sua solicitação! Como usuário premium, posso te ajudar com ajustes personalizados na sua dieta. Que tal me contar mais detalhes?',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, aiResponse])
    }, 1000)
  }

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion)
  }

  if (!isPremium) {
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

        {/* Conteúdo Premium */}
        <div className="flex-1 container-keima flex flex-col justify-center">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mx-auto flex items-center justify-center">
              <Crown size={40} className="text-white" />
            </div>

            <div>
              <h2 className="text-2xl text-ultra-thin text-gray-800 mb-4">
                Módulo de Dieta Premium
              </h2>
              <p className="text-gray-600 text-thin leading-relaxed">
                Tenha acesso à IA KEIMA para ajustes personalizados de dieta em tempo real!
              </p>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm text-gray-700 text-thin">Chat com a IA KEIMA</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm text-gray-700 text-thin">Planos de dieta personalizados</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-700 text-thin">Ajustes baseados no progresso</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-gray-700 text-thin">Substituições inteligentes</span>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6">
              <div className="text-center">
                <span className="text-3xl font-thin text-gray-800">R$ 29,90</span>
                <span className="text-sm text-gray-600 text-thin ml-2">/mês</span>
              </div>
            </div>

            <button className="btn-keima w-full">
              Assinar Premium
            </button>
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
        <h1 className="text-lg font-thin text-white">KEIMA</h1>
        <div></div>
      </div>

      {/* Chat */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 p-6 space-y-4 overflow-y-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <p className="text-sm text-thin">{message.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Sugestões */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-full hover:bg-gray-200 transition-colors text-thin"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Digite sua mensagem..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-thin"
            />
            <button
              onClick={handleSendMessage}
              className="w-12 h-12 bg-red-500 text-white rounded-xl flex items-center justify-center hover:bg-red-600 transition-colors"
            >
              <Send size={20} />
            </button>
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

export default DietPage

