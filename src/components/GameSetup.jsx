import { useState, useEffect } from 'react'
import ScenarioEditor from './ScenarioEditor'
import ScenarioManager from './ScenarioManager'
import CustomRoleManager from './CustomRoleManager'
import Icon from './Icon'
import { loadCustomScenarios, saveCustomScenarios } from '../utils/scenarioStorage'

const GameSetup = ({ onStartGame, onStartMultiplayer, roles, scenarios }) => {
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [playerName, setPlayerName] = useState('')
  const [projectType, setProjectType] = useState('default') // 'default' or 'custom'
  const [gameMode, setGameMode] = useState('single') // 'single' or 'multiplayer'
  const [savedProjects, setSavedProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [showSaveProject, setShowSaveProject] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [customScenarios, setCustomScenarios] = useState([])
  const [customRoles, setCustomRoles] = useState([])
  const [showScenarioEditor, setShowScenarioEditor] = useState(false)
  const [showRoleManager, setShowRoleManager] = useState(false)
  const [scenarioFilter, setScenarioFilter] = useState('all') // 'all', 'default', 'custom'
  const [loadingProjects, setLoadingProjects] = useState(false)

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
    
    // For custom projects, show save option if not already saved
    if (projectType === 'custom' && !selectedProject) {
      setShowSaveProject(true)
      return
    }
    
    onStartGame(selectedRoles, selectedScenario, playerName)
  }

  const getAllRoles = () => {
    return [...roles, ...customRoles]
  }

  const selectAllRoles = () => {
    setSelectedRoles(getAllRoles().map(role => role.id))
  }

  const clearRoles = () => {
    setSelectedRoles([])
  }

  useEffect(() => {
    setCustomScenarios(loadCustomScenarios())
    loadCustomRoles()
    loadSavedProjects()
  }, [])

  const loadCustomRoles = async () => {
    try {
      const apiUrl = '/api/custom-roles'
      const response = await fetch(apiUrl)
      if (response.ok) {
        const roles = await response.json()
        setCustomRoles(roles)
      }
    } catch (error) {
      console.error('Failed to load custom roles:', error)
    }
  }

  const loadSavedProjects = async () => {
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/projects');
      if (response.ok) {
        const projects = await response.json();
        console.log('Loaded projects:', projects);
        setSavedProjects(projects);
        // If we have projects and user hasn't selected custom yet, suggest it
        if (projects.length > 0 && projectType === 'default') {
          console.log('Found saved projects, consider switching to custom project type');
        }
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoadingProjects(false);
    }
  }

  const saveCurrentProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return
    }

    // Debug logging
    console.log('Saving project with:', {
      selectedRoles,
      selectedScenario,
      projectName
    })

    if (selectedRoles.length === 0 || !selectedScenario) {
      alert('Please select at least one role and a scenario before saving.')
      return
    }

    const projectData = {
      name: projectName,
      description: `Project with ${selectedRoles.length} roles and scenario: ${selectedScenario?.name || 'Unknown'}`,
      scenarios: [selectedScenario].filter(Boolean),
      custom_cards: [],
      selected_roles: selectedRoles.map(roleId => {
        const role = getAllRoles().find(r => r.id === roleId)
        return role ? {
          id: role.id,
          name: role.name,
          description: role.description,
          responsibilities: role.responsibilities || [],
          icon: role.icon || 'user',
          isCustom: role.isCustom || false
        } : null
      }).filter(Boolean)
    }

    console.log('Project data to save:', projectData)

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        const savedProject = await response.json()
        console.log('Project saved successfully:', savedProject)
        alert('Project saved successfully!')
        setShowSaveProject(false)
        setProjectName('')
        loadSavedProjects() // Refresh the list
        // Start the game after saving
        onStartGame(selectedRoles, selectedScenario, playerName)
      } else {
        const errorText = await response.text()
        console.error('Failed to save project:', response.status, errorText)
        alert(`Failed to save project: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
    }
  }

  const deleteProject = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"?`)) {
      return
    }

    try {
      const apiUrl = `/api/projects/${projectId}`
      const response = await fetch(apiUrl, {
        method: 'DELETE'
      })

      if (response.ok) {
        alert('Project deleted successfully!')
        loadSavedProjects() // Refresh the list
        if (selectedProject?.id === projectId) {
          setSelectedProject(null)
          setSelectedRoles([])
          setSelectedScenario(null)
        }
      } else {
        alert('Failed to delete project')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Failed to delete project')
    }
  }


  const loadProject = (project) => {
    console.log('Loading project:', project)
    
    // Extract role IDs from saved project data
    const roleIds = (project.selected_roles || []).map(role => role.id)
    console.log('Extracted role IDs:', roleIds)
    setSelectedRoles(roleIds)
    
    // Extract scenario from saved project data
    const scenario = project.scenarios && project.scenarios.length > 0 ? project.scenarios[0] : null
    console.log('Extracted scenario:', scenario)
    setSelectedScenario(scenario)
    
    setSelectedProject(project)
    console.log('Project loaded successfully')
  }

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

      {/* Project Type and Mode Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Training Setup</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Type
            </label>
            <select
              value={projectType}
              onChange={(e) => {
                setProjectType(e.target.value)
                if (e.target.value === 'default') {
                  setSelectedProject(null)
                  setSelectedRoles([])
                  setSelectedScenario(null)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="default">Default Project</option>
              <option value="custom">Custom Project</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {projectType === 'default' 
                ? 'Use predefined roles and scenarios'
                : 'Load saved projects or create new ones'
              }
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Training Mode
            </label>
            <select
              value={gameMode}
              onChange={(e) => {
                const newMode = e.target.value;
                setGameMode(newMode);
                // Only redirect to multiplayer if it's default project type
                if (newMode === 'multiplayer' && projectType === 'default') {
                  onStartMultiplayer();
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-gray-900"
            >
              <option value="single">Single Player Training</option>
              <option value="multiplayer">Multiplayer Session (Facilitator)</option>
            </select>
            <p className="mt-2 text-sm text-gray-500">
              {gameMode === 'single' 
                ? 'Practice scenarios individually at your own pace'
                : 'Create and facilitate multiplayer training sessions'
              }
            </p>
          </div>
        </div>
        
        {/* Show multiplayer custom project message */}
        {projectType === 'custom' && gameMode === 'multiplayer' && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Custom Multiplayer Projects Coming Soon
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Custom multiplayer project creation is not yet available. Please use Default Project for multiplayer sessions.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Only show setup sections for single player mode or custom multiplayer (not implemented) */}
      {(gameMode === 'single' || (gameMode === 'multiplayer' && projectType === 'custom')) && (
        <>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-900"
              placeholder="Enter your name"
            />
          </div>
        </div>
      </div>

      {/* Saved Projects Notification */}
      {projectType === 'default' && savedProjects.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                You have {savedProjects.length} saved project{savedProjects.length !== 1 ? 's' : ''}
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Switch to "Custom Project" to load your saved configurations.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Project Options */}
      {projectType === 'custom' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Custom Project Options</h3>
          
          {savedProjects.length > 0 ? (
            <>
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Load Existing Project</h4>
                <p className="text-gray-600 mb-4">
                  Select a saved project to load its configuration and start training.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {savedProjects.map(project => (
                  <div
                    key={project.id}
                    onClick={() => loadProject(project)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedProject?.id === project.id
                        ? 'border-blue-400 bg-blue-50'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900">{project.name}</h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteProject(project.id, project.name)
                        }}
                        className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        title="Delete project"
                      >
                        <Icon name="delete" className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Roles: {project.selected_roles ? project.selected_roles.length : 0}</div>
                      <div>Scenarios: {project.scenarios ? project.scenarios.length : 0}</div>
                      <div>Cards: {project.custom_cards ? project.custom_cards.length : 0}</div>
                      <div>Created: {new Date(project.created_at).toLocaleDateString()}</div>
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <Icon name="check" className="w-3 h-3 mr-1" />
                          Loaded
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="border-t pt-6">
                <h4 className="text-lg font-medium text-gray-900 mb-2">Create New Project</h4>
                <p className="text-gray-600 mb-4">
                  Start fresh by selecting roles and scenarios to create a new custom project.
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="mb-4">
                <Icon name="folder" className="w-16 h-16 mx-auto text-gray-300" />
              </div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Saved Projects</h4>
              <p className="text-gray-600 mb-4">
                Create your first custom project by selecting roles and scenarios below.
              </p>
            </div>
          )}
          <div className="text-center">
            <button
              onClick={() => {
                setSelectedProject(null)
                setSelectedRoles([])
                setSelectedScenario(null)
              }}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              Create New Project Instead
            </button>
          </div>
        </div>
      )}

      {/* Role Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Select Your Organizational Roles</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowRoleManager(true)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <Icon name="plus" className="w-4 h-4 mr-1" />
              Create & Manage Role
            </button>
            <button
              onClick={selectAllRoles}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
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
          {getAllRoles().map(role => (
            <div
              key={role.id}
              onClick={() => toggleRole(role.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                selectedRoles.includes(role.id)
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={role.icon || 'user'} className="w-6 h-6 text-gray-700" />
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
                  {role.isCustom && (
                    <span className="inline-block px-1 py-0.5 bg-purple-100 text-purple-800 text-xs font-medium rounded">
                      Custom
                    </span>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-600">{role.description}</p>
              {selectedRoles.includes(role.id) && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    <Icon name="check" className="w-3 h-3 mr-1" />
                    Selected
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          Selected roles: {selectedRoles.length} / {getAllRoles().length} 
          <span className="ml-2 text-gray-500">
            ({roles.length} default, {customRoles.length} custom)
          </span>
        </div>
      </div>

      {/* Scenario Selection */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Choose a Scenario</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowScenarioEditor(true)}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm flex items-center"
            >
              <Icon name="plus" className="w-4 h-4 mr-1" />
              Create Custom
            </button>
          </div>
        </div>

        {/* Scenario Filter */}
        <div className="mb-6">
          <div className="flex space-x-2">
            <button
              onClick={() => setScenarioFilter('all')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scenarioFilter === 'all' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All ({getAllScenarios().length})
            </button>
            <button
              onClick={() => setScenarioFilter('default')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scenarioFilter === 'default' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Default ({scenarios.length})
            </button>
            <button
              onClick={() => setScenarioFilter('custom')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                scenarioFilter === 'custom' 
                  ? 'bg-primary-500 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
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
                  ? 'border-gray-400 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="text-lg font-semibold text-gray-900 text-left">{scenario.name}</h4>
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
              
              <p className="text-gray-600 mb-4 text-left">{scenario.description}</p>
              
              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500 text-left">
                  <span className="mr-2">⏱️</span>
                  Estimated time: {scenario.estimatedTime}
                </div>
                
                <div className="text-sm text-gray-700 text-left">
                  <span className="font-medium">Learning objectives:</span>
                  <ul className="mt-1 ml-4 list-disc list-inside text-xs space-y-1 text-left">
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
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <Icon name="check" className="w-4 h-4 mr-1" />
                    Selected
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

          {/* Start Game Button - Only for Single Player */}
          <div className="text-center">
            <button
              onClick={handleStartGame}
              disabled={selectedRoles.length === 0 || !selectedScenario || !playerName}
              className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {projectType === 'custom' && !selectedProject ? 'Save Project & Start Solo Training' : 'Start Solo Training'}
            </button>
            
            {(selectedRoles.length === 0 || !selectedScenario || !playerName) && (
              <p className="mt-2 text-sm text-gray-500">
                Please complete all setup steps to begin
              </p>
            )}
          </div>
        </>
      )}

      {/* Save Project Modal */}
      {showSaveProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Custom Project</h3>
            <p className="text-gray-600 mb-4">
              Save your role and scenario selection as a project for future use.
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowSaveProject(false)
                  onStartGame(selectedRoles, selectedScenario, playerName)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Skip & Start
              </button>
              <button
                onClick={saveCurrentProject}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save & Start
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Role Manager Modal */}
      {showRoleManager && (
        <CustomRoleManager
          onClose={() => {
            setShowRoleManager(false)
            loadCustomRoles() // Refresh roles after closing
          }}
        />
      )}

      {/* Scenario Editor Modal */}
      {showScenarioEditor && (
        <ScenarioEditor
          onClose={() => setShowScenarioEditor(false)}
          onSave={(newScenario) => {
            const updatedScenarios = loadCustomScenarios()
            setCustomScenarios(updatedScenarios)
            setShowScenarioEditor(false)
          }}
        />
      )}
    </div>
  )
}

export default GameSetup
