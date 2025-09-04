import { useState } from 'react'
import './App.css'
import GameSetup from './components/GameSetup'
import GameBoard from './components/GameBoard'
import MultiplayerSetup from './components/MultiplayerSetup'
import FacilitatorDashboard from './components/FacilitatorDashboard'
import ParticipantInterface from './components/ParticipantInterface'
import Icon from './components/Icon'
import { roles, scenarios } from './data/gameData'

function App() {
  const [gameState, setGameState] = useState('setup') // 'setup', 'playing', 'completed', 'multiplayer-setup', 'facilitator', 'participant'
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [currentInject, setCurrentInject] = useState(0)
  const [gameLog, setGameLog] = useState([])
  const [playerName, setPlayerName] = useState('')
  const [currentSession, setCurrentSession] = useState(null)
  const [participantData, setParticipantData] = useState(null)

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
    setCurrentSession(null)
    setParticipantData(null)
  }

  const addToGameLog = (entry) => {
    setGameLog(prev => [...prev, { ...entry, timestamp: new Date().toLocaleTimeString() }])
  }

  const startMultiplayerSetup = () => {
    setGameState('multiplayer-setup')
  }

  const startFacilitatorSession = (session, availableRoles) => {
    setCurrentSession(session)
    setGameState('facilitator')
  }

  const joinParticipantSession = (session, participantName) => {
    setCurrentSession(session)
    setParticipantData({
      userId: `participant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: participantName
    })
    setGameState('participant')
  }

  const updateSession = (sessionData) => {
    setCurrentSession(prev => ({ ...prev, ...sessionData }))
  }

  const endSession = () => {
    setCurrentSession(null)
    setParticipantData(null)
    setGameState('setup')
  }

  return (
    <div className="min-h-screen">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div 
              onClick={resetGame}
              className="flex items-center space-x-3 cursor-pointer"
            >
              <Icon name="shield" className="w-8 h-8 text-primary-500" />
              <h1 className="text-2xl font-bold text-gray-900">Fire Drill</h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Header navigation removed - projects managed in GameSetup */}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gameState === 'setup' && (
          <GameSetup 
            onStartGame={startGame}
            onStartMultiplayer={startMultiplayerSetup}
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

        {gameState === 'multiplayer-setup' && (
          <MultiplayerSetup
            onStartSession={startFacilitatorSession}
            onJoinSession={joinParticipantSession}
            roles={roles}
            scenarios={scenarios}
          />
        )}

        {gameState === 'facilitator' && currentSession && (
          <FacilitatorDashboard
            session={currentSession}
            onUpdateSession={updateSession}
            onEndSession={endSession}
          />
        )}

        {gameState === 'participant' && currentSession && participantData && (
          <ParticipantInterface
            session={currentSession}
            participantData={participantData}
            onLeaveSession={endSession}
            roles={roles}
          />
        )}
      </main>
    </div>
  )
}

export default App
