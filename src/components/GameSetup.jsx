import { useState, useEffect } from 'react'
import ScenarioEditor from './ScenarioEditor'
import ScenarioManager from './ScenarioManager'
import { loadCustomScenarios, saveCustomScenarios } from '../utils/scenarioStorage'

const GameSetup = ({ onStartGame, roles, scenarios }) => {
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [gameMode, setGameMode] = useState('single') // 'single' or 'multiplayer'
  const [customScenarios, setCustomScenarios] = useState([])
  const [showScenarioEditor, setShowScenarioEditor] = useState(false)
  const [scenarioFilter, setScenarioFilter] = useState('all') // 'all', 'default', 'custom'

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const handleStartGame = () => {
    if (selectedRoles.length === 0 || !selectedScenario || !playerName) {
      alert('Please select at least one role, a scenario, and enter your name.')
      return
    }
    onStartGame(selectedRoles, selectedScenario, playerName)
  }

  const selectAllRoles = () => {
    setSelectedRoles(roles.map(role => role.id))
  }

  const clearRoles = () => {
    setSelectedRoles([])
  }

  useEffect(() => {
    setCustomScenarios(loadCustomScenarios())
  }, [])

  const handleImportScenarios = (importedScenarios) => {
    const existingScenarios = loadCustomScenarios()
    const mergedScenarios = [...existingScenarios]
    
    importedScenarios.forEach(imported => {
      const exists = existingScenarios.find(existing => existing.id === imported.id)
      if (!exists) {
        mergedScenarios.push({
          ...imported,
          id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          isCustom: true,
          createdAt: new Date().toISOString()
        })
      }
    })
    
    saveCustomScenarios(mergedScenarios)
    setCustomScenarios(mergedScenarios)
  }

  const getAllScenarios = () => {
    const defaultScenarios = scenarios.map(s => ({ ...s, isCustom: false }))
    const allScenarios = [...defaultScenarios, ...customScenarios]
    
    switch (scenarioFilter) {
      case 'default':
        return defaultScenarios
      case 'custom':
        return customScenarios
      default:
        return allScenarios
    }
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CyberSecurity Fire Drill</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Practice cybersecurity incident response through role-playing scenarios. 
          Select your organizational roles, choose a scenario, and work through realistic cyber incidents 
          using the NIST Cybersecurity Framework.
        </p>
      </div>

      {/* Player Setup */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Player Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Mode
            </label>
            <select
              value={gameMode}
              onChange={(e) => setGameMode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">Single Player (Play multiple roles)</option>
              <option value="multiplayer">Multiplayer (Coming soon)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Select Your Organizational Roles</h3>
          <div className="space-x-2">
            <button
              onClick={selectAllRoles}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
            >
              Select All
            </button>
            <button
              onClick={clearRoles}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {roles.map(role => (
            <div
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRoles.includes(role.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-2xl">{role.icon}</span>
                <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
              </div>
              <p className="text-xs text-gray-600">{role.description}</p>
              {selectedRoles.includes(role.id) && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Selected roles: {selectedRoles.length} / {roles.length}
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Choose a Scenario</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowScenarioEditor(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
            >
              + Create Custom
            </button>
          </div>
        </div>

        {/* Scenario Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setScenarioFilter('all')}
              className={`px-3 py-1 rounded-md text-sm ${
                scenarioFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All ({getAllScenarios().length})
            </button>
            <button
              onClick={() => setScenarioFilter('default')}
              className={`px-3 py-1 rounded-md text-sm ${
                scenarioFilter === 'default' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Default ({scenarios.length})
            </button>
            <button
              onClick={() => setScenarioFilter('custom')}
              className={`px-3 py-1 rounded-md text-sm ${
                scenarioFilter === 'custom' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Custom ({customScenarios.length})
            </button>
          </div>
        </div>

        {/* Team Sharing */}
        {customScenarios.length > 0 && (
          <ScenarioManager 
            customScenarios={customScenarios}
            onImport={handleImportScenarios}
          />
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {getAllScenarios().map(scenario => (
            <div
              key={scenario.id}
              onClick={() => setSelectedScenario(scenario)}
              className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
                selectedScenario?.id === scenario.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900">{scenario.name}</h4>
                  {scenario.isCustom && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                      Custom
                    </span>
                  )}
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  scenario.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                  scenario.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {scenario.severity}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{scenario.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <span className="mr-2">⏱️</span>
                  Estimated time: {scenario.estimatedTime}
                </div>
                
                <div className="text-sm text-gray-700">
                  <span className="font-medium">Learning objectives:</span>
                  <ul className="mt-1 ml-4 list-disc list-inside text-xs space-y-1">
                    {scenario.objectives.slice(0, 3).map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                    {scenario.objectives.length > 3 && (
                      <li className="text-gray-500">+{scenario.objectives.length - 3} more...</li>
                    )}
                  </ul>
                </div>
              </div>

              {selectedScenario?.id === scenario.id && (
                <div className="mt-4">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    ✓ Selected
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Start Game Button */}
      <div className="text-center">
        <button
          onClick={handleStartGame}
          disabled={selectedRoles.length === 0 || !selectedScenario || !playerName}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Start Cybersecurity Training
        </button>
        
        {(selectedRoles.length === 0 || !selectedScenario || !playerName) && (
          <p className="mt-2 text-sm text-gray-500">
            Please complete all setup steps to begin
          </p>
        )}
      </div>

      {/* Scenario Editor Modal */}
      {showScenarioEditor && (
        <ScenarioEditor
          onClose={() => setShowScenarioEditor(false)}
          onSave={() => {
            setCustomScenarios(loadCustomScenarios())
            setShowScenarioEditor(false)
          }}
        />
      )}
    </div>
  )
}

export default GameSetup
