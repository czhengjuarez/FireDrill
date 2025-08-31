import { useState } from 'react'
import './App.css'
import GameSetup from './components/GameSetup'
import GameBoard from './components/GameBoard'
import { roles, scenarios } from './data/gameData'
import { loadCustomScenarios } from './utils/scenarioStorage'

function App() {
  const [gameState, setGameState] = useState('setup') // 'setup', 'playing', 'completed'
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [currentInject, setCurrentInject] = useState(0)
  const [gameLog, setGameLog] = useState([])
  const [playerName, setPlayerName] = useState('')

  const startGame = (roles, scenario, name) => {
    setSelectedRoles(roles)
    setSelectedScenario(scenario)
    setPlayerName(name)
    setGameState('playing')
    setCurrentInject(0)
    setGameLog([])
  }

  const resetGame = () => {
    setGameState('setup')
    setSelectedRoles([])
    setSelectedScenario(null)
    setCurrentInject(0)
    setGameLog([])
    setPlayerName('')
  }

  const addToGameLog = (entry) => {
    setGameLog(prev => [...prev, { ...entry, timestamp: new Date().toLocaleTimeString() }])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">🛡️</div>
              <h1 className="text-2xl font-bold text-gray-900">CyberSecurity Fire Drill</h1>
            </div>
            <div className="text-sm text-gray-500">
              Cybersecurity Incident Response Training
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gameState === 'setup' && (
          <GameSetup 
            onStartGame={startGame}
            roles={roles}
            scenarios={scenarios}
          />
        )}
        
        {gameState === 'playing' && (
          <GameBoard
            selectedRoles={selectedRoles}
            selectedScenario={selectedScenario}
            currentInject={currentInject}
            setCurrentInject={setCurrentInject}
            gameLog={gameLog}
            addToGameLog={addToGameLog}
            onResetGame={resetGame}
            playerName={playerName}
          />
        )}
      </main>
    </div>
  )
}

export default App
