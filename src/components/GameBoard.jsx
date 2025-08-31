import { useState, useEffect } from 'react'
import { injectCards, roles, nistFramework } from '../data/gameData'
import InjectCard from './InjectCard'
import ResponsePanel from './ResponsePanel'
import GameLog from './GameLog'

const GameBoard = ({ 
  selectedRoles, 
  selectedScenario, 
  currentInject, 
  setCurrentInject, 
  gameLog, 
  addToGameLog, 
  onResetGame,
  playerName 
}) => {
  const [activeInjects, setActiveInjects] = useState([])
  const [responses, setResponses] = useState({})
  const [gamePhase, setGamePhase] = useState('briefing') // 'briefing', 'active', 'debrief'
  const [timer, setTimer] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)

  // Get inject cards for the selected scenario (default or custom)
  const getScenarioInjects = () => {
    if (selectedScenario.isCustom) {
      const customInjects = JSON.parse(localStorage.getItem('cybersecurity_fire_drill_custom_injects') || '{}')
      return customInjects[selectedScenario.id] || []
    }
    return injectCards[selectedScenario.id] || []
  }
  
  const scenarioInjects = getScenarioInjects()

  // Get role details for selected roles
  const playerRoles = roles.filter(role => selectedRoles.includes(role.id))

  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startGame = () => {
    setGamePhase('active')
    setIsTimerRunning(true)
    addToGameLog({
      type: 'game_start',
      message: `${playerName} started ${selectedScenario.name} scenario`,
      roles: selectedRoles
    })
  }

  const nextInject = () => {
    if (currentInject < scenarioInjects.length - 1) {
      const newInjectIndex = currentInject + 1
      setCurrentInject(newInjectIndex)
      addToGameLog({
        type: 'inject_revealed',
        message: `New inject revealed: ${scenarioInjects[newInjectIndex].title}`,
        targetRole: scenarioInjects[newInjectIndex].targetRole,
        inject: scenarioInjects[newInjectIndex]
      })
    }
  }

  const submitResponse = (injectId, response, nistCategory) => {
    setResponses(prev => ({
      ...prev,
      [injectId]: { response, nistCategory, timestamp: new Date().toLocaleTimeString() }
    }))
    
    addToGameLog({
      type: 'response_submitted',
      message: `Response submitted for ${scenarioInjects.find(i => i.id === injectId)?.title}`,
      response,
      nistCategory,
      injectId
    })
  }

  const endGame = () => {
    setGamePhase('debrief')
    setIsTimerRunning(false)
    addToGameLog({
      type: 'game_end',
      message: `Game completed in ${formatTime(timer)}`,
      totalTime: timer,
      responsesCount: Object.keys(responses).length
    })
  }

  if (gamePhase === 'briefing') {
    return (
      <div className="space-y-6">
        {/* Game Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedScenario.name}</h2>
              <p className="text-gray-600 mb-4">{selectedScenario.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Player: {playerName}</span>
                <span>•</span>
                <span>Roles: {selectedRoles.length}</span>
                <span>•</span>
                <span>Estimated time: {selectedScenario.estimatedTime}</span>
              </div>
            </div>
            <button
              onClick={onResetGame}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Back to Setup
            </button>
          </div>
        </div>

        {/* Your Roles */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Assigned Roles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {playerRoles.map(role => (
              <div key={role.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-xl">{role.icon}</span>
                  <h4 className="font-semibold text-gray-900">{role.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{role.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* NIST Framework Reference */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">NIST Cybersecurity Framework</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {Object.entries(nistFramework).map(([key, framework]) => (
              <div key={key} className={`p-4 rounded-lg text-white ${framework.color}`}>
                <h4 className="font-semibold mb-2">{framework.name}</h4>
                <p className="text-sm opacity-90">{framework.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Learning Objectives</h3>
          <ul className="space-y-2">
            {selectedScenario.objectives.map((objective, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className="text-blue-500 mt-1">•</span>
                <span className="text-gray-700">{objective}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Start Game */}
        <div className="text-center">
          <button
            onClick={startGame}
            className="px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Begin Incident Response
          </button>
        </div>
      </div>
    )
  }

  if (gamePhase === 'active') {
    const currentInjectData = scenarioInjects[currentInject]
    const hasMoreInjects = currentInject < scenarioInjects.length - 1

    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Game Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Game Status */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <h2 className="text-xl font-bold text-gray-900">{selectedScenario.name}</h2>
                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                  ACTIVE INCIDENT
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-lg font-mono text-gray-900">
                  {formatTime(timer)}
                </div>
                <button
                  onClick={endGame}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                >
                  End Exercise
                </button>
              </div>
            </div>
          </div>

          {/* Current Inject */}
          {currentInjectData && (
            <InjectCard
              inject={currentInjectData}
              playerRoles={playerRoles}
              onSubmitResponse={submitResponse}
              existingResponse={responses[currentInjectData.id]}
            />
          )}

          {/* Inject Navigation */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Inject {currentInject + 1} of {scenarioInjects.length}
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => setCurrentInject(Math.max(0, currentInject - 1))}
                  disabled={currentInject === 0}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentInject(Math.min(scenarioInjects.length - 1, currentInject + 1))}
                  disabled={currentInject >= scenarioInjects.length - 1}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next Inject
                </button>
                {currentInject >= scenarioInjects.length - 1 && (
                  <button
                    onClick={endGame}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    Complete Exercise
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Response Panel */}
          <ResponsePanel
            responses={responses}
            scenarioInjects={scenarioInjects}
            nistFramework={nistFramework}
          />

          {/* Game Log */}
          <GameLog gameLog={gameLog} />
        </div>
      </div>
    )
  }

  if (gamePhase === 'debrief') {
    const responseCount = Object.keys(responses).length
    const completionRate = (responseCount / scenarioInjects.length) * 100

    return (
      <div className="space-y-6">
        {/* Exercise Complete */}
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Exercise Complete!</h2>
          <p className="text-gray-600 mb-4">
            You have successfully completed the {selectedScenario.name} cybersecurity training exercise.
          </p>
          <div className="flex justify-center space-x-8 text-sm text-gray-600">
            <div>Total Time: {formatTime(timer)}</div>
            <div>Responses: {responseCount}/{scenarioInjects.length}</div>
            <div>Completion: {completionRate.toFixed(0)}%</div>
          </div>
        </div>

        {/* Response Summary */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Response Summary</h3>
          <div className="space-y-4">
            {scenarioInjects.map(inject => {
              const response = responses[inject.id]
              return (
                <div key={inject.id} className="border-l-4 border-gray-200 pl-4">
                  <h4 className="font-semibold text-gray-900">{inject.title}</h4>
                  <p className="text-sm text-gray-600 mb-2">{inject.content}</p>
                  {response ? (
                    <div className="bg-green-50 p-3 rounded-md">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${nistFramework[response.nistCategory]?.color} text-white`}>
                          {nistFramework[response.nistCategory]?.name}
                        </span>
                        <span className="text-xs text-gray-500">{response.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-700">{response.response}</p>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-500 italic">No response provided</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="text-center space-x-4">
          <button
            onClick={onResetGame}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Another Scenario
          </button>
          <button
            onClick={() => window.print()}
            className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Print Summary
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default GameBoard
