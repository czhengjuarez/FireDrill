import { useState } from 'react'
import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import UserProfile from './components/UserProfile'
import GameSetup from './components/GameSetup'
import GameBoard from './components/GameBoard'
import MultiplayerSetup from './components/MultiplayerSetup'
import CustomMultiplayerSetup from './components/CustomMultiplayerSetup'
import FacilitatorDashboard from './components/FacilitatorDashboard'
import ParticipantInterface from './components/ParticipantInterface'
import Icon from './components/Icon'
import { roles, scenarios } from './data/gameData'

const AppContent = () => {
  const { user, loading } = useAuth();
  const [gameState, setGameState] = useState('setup') // 'setup', 'playing', 'completed', 'multiplayer-setup', 'custom-multiplayer-setup', 'facilitator', 'participant'
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [currentInject, setCurrentInject] = useState(0)
  const [gameLog, setGameLog] = useState([])
  const [playerName, setPlayerName] = useState('')
  const [currentSession, setCurrentSession] = useState(null)
  const [participantData, setParticipantData] = useState(null)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

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

  const startCustomMultiplayerSetup = () => {
    setGameState('custom-multiplayer-setup')
  }

  const startFacilitatorSession = (session, availableRoles) => {
    setCurrentSession(session)
    setGameState('facilitator')
  }

  const startCustomFacilitatorSession = (sessionData) => {
    // Create session object compatible with FacilitatorDashboard
    const session = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      facilitator_name: sessionData.facilitatorName,
      scenario_data: sessionData.selectedScenario,
      available_roles: sessionData.selectedRoles,
      participants: [],
      status: 'waiting',
      created_at: new Date().toISOString(),
      isCustomProject: true
    }
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
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="#8E1F5A"/>
              </svg>
              <h1 className="text-2xl font-bold text-gray-900">Fire Drill</h1>
            </div>
            <div className="flex items-center space-x-4">
              <UserProfile />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gameState === 'setup' && (
          <GameSetup 
            onStartGame={startGame}
            onStartMultiplayer={startMultiplayerSetup}
            onStartCustomMultiplayer={startCustomMultiplayerSetup}
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
            onStartGame={startFacilitatorSession}
            onJoinSession={joinParticipantSession}
            roles={roles}
            scenarios={scenarios}
          />
        )}

        {gameState === 'custom-multiplayer-setup' && (
          <CustomMultiplayerSetup
            onStartSession={startCustomFacilitatorSession}
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

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App
