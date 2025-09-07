import { useState, useEffect } from 'react'
import Icon from './Icon'
import CustomRoleManager from './CustomRoleManager'
import ScenarioEditor from './ScenarioEditor'

const CustomMultiplayerSetup = ({ onStartSession, roles, scenarios }) => {
  const [savedProjects, setSavedProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [selectedRoles, setSelectedRoles] = useState([])
  const [selectedScenario, setSelectedScenario] = useState(null)
  const [facilitatorName, setFacilitatorName] = useState('')
  const [projectName, setProjectName] = useState('')
  const [saveAsProject, setSaveAsProject] = useState(false)
  const [customRoles, setCustomRoles] = useState([])
  const [customScenarios, setCustomScenarios] = useState([])
  const [loadingProjects, setLoadingProjects] = useState(false)
  const [validationError, setValidationError] = useState('')
  const [showRoleManager, setShowRoleManager] = useState(false)
  const [showScenarioEditor, setShowScenarioEditor] = useState(false)

  useEffect(() => {
    loadSavedProjects()
    loadCustomRoles()
    loadCustomScenarios()
  }, [])

  const loadSavedProjects = async () => {
    setLoadingProjects(true)
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const projects = await response.json()
        setSavedProjects(projects)
      }
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoadingProjects(false)
    }
  }

  const loadCustomRoles = async () => {
    try {
      const response = await fetch('/api/custom-roles')
      if (response.ok) {
        const customRolesData = await response.json()
        // Mark all fetched roles as custom
        const rolesWithCustomFlag = customRolesData.map(role => ({ ...role, isCustom: true }))
        setCustomRoles(rolesWithCustomFlag)
      }
    } catch (error) {
      console.error('Error loading custom roles:', error)
    }
  }

  const loadCustomScenarios = () => {
    const stored = localStorage.getItem('cybersecurity_fire_drill_custom_scenarios')
    if (stored) {
      try {
        setCustomScenarios(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading custom scenarios:', error)
      }
    }
  }

  const getAllRoles = () => {
    return [...roles, ...customRoles]
  }

  const getAllScenarios = () => {
    const defaultScenarios = scenarios.map(s => ({ ...s, isCustom: false }))
    return [...defaultScenarios, ...customScenarios]
  }

  const loadProject = (project) => {
    // If clicking on already selected project, deselect it
    if (selectedProject?.id === project.id) {
      setSelectedProject(null)
      setSelectedRoles([])
      setSelectedScenario(null)
      setSaveAsProject(false)
      return
    }
    
    // Otherwise, load the project
    const roleIds = (project.selected_roles || []).map(role => role.id)
    setSelectedRoles(roleIds)
    
    const scenario = project.scenarios && project.scenarios.length > 0 ? project.scenarios[0] : null
    setSelectedScenario(scenario)
    
    setSelectedProject(project)
    setSaveAsProject(false) // Don't save again if loading existing
  }

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    )
  }

  const saveCurrentProject = async () => {
    if (!projectName.trim()) {
      alert('Please enter a project name')
      return false
    }

    const projectData = {
      name: projectName,
      description: `Multiplayer project with ${selectedRoles.length} roles and scenario: ${selectedScenario?.name || 'Unknown'}`,
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

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectData)
      })

      if (response.ok) {
        console.log('Project saved successfully')
        return true
      } else {
        alert('Failed to save project')
        return false
      }
    } catch (error) {
      console.error('Error saving project:', error)
      alert('Failed to save project')
      return false
    }
  }

  const handleStartSession = async () => {
    // Clear previous validation error
    setValidationError('')
    
    const missingFields = []
    if (selectedRoles.length === 0) missingFields.push('at least one role')
    if (!selectedScenario) missingFields.push('a scenario')
    if (!facilitatorName.trim()) missingFields.push('facilitator name')
    
    if (missingFields.length > 0) {
      const errorMessage = `Please select ${missingFields.join(', ')}.`
      setValidationError(errorMessage)
      return
    }

    // Save project if requested
    if (saveAsProject && !selectedProject) {
      const saved = await saveCurrentProject()
      if (!saved) return
    }

    // Prepare session data
    const sessionData = {
      facilitatorName,
      selectedRoles,
      selectedScenario,
      availableRoles: selectedRoles, // For participant filtering
      isCustomProject: true
    }

    onStartSession(sessionData)
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Custom Multiplayer Setup</h2>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Load an existing project or create a new multiplayer session with custom roles and scenarios.
        </p>
      </div>

      {/* Facilitator Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Facilitator Information</h3>
        <div className="max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
            Facilitator Name *
          </label>
          <input
            type="text"
            value={facilitatorName}
            onChange={(e) => setFacilitatorName(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
            placeholder="Enter your name"
          />
        </div>
      </div>

      {/* Load Existing Project */}
      {savedProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Load Existing Project</h3>
          <p className="text-gray-600 mb-4">
            Select a saved project to use its role and scenario configuration. You can also modify roles and scenarios to create a new customized session.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                <h4 className="font-semibold text-gray-900 mb-2">{project.name}</h4>
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Roles: {project.selected_roles ? project.selected_roles.length : 0}</div>
                  <div>Scenarios: {project.scenarios ? project.scenarios.length : 0}</div>
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
        </div>
      )}

      {/* Create New Session */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {selectedProject ? 'Loaded Configuration' : 'Create New Session'}
        </h3>

        {/* Role Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Select Roles</h4>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowRoleManager(true)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
              >
                <Icon name="plus" className="w-4 h-4 mr-1" />
                Create & Manage Role
              </button>
              <button
                onClick={() => setSelectedRoles(getAllRoles().map(role => role.id))}
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Select All
              </button>
              <button
                onClick={() => setSelectedRoles([])}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Clear All
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAllRoles().map(role => (
              <div
                key={role.id}
                onClick={() => toggleRole(role.id)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedRoles.includes(role.id)
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-3 mb-2">
                  {!role.isCustom && <Icon name={role.icon || 'user'} className="w-6 h-6 text-gray-700" />}
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
                    <Icon name="check" className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scenario Selection */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-lg font-medium text-gray-900">Select Scenario</h4>
            <button
              onClick={() => setShowScenarioEditor(true)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
            >
              <Icon name="plus" className="w-4 h-4 mr-1" />
              Create New Scenario
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getAllScenarios().map(scenario => (
              <div
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedScenario?.id === scenario.id
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h5 className="font-semibold text-gray-900">{scenario.name}</h5>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    scenario.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                    scenario.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {scenario.severity}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{scenario.description}</p>
                <div className="text-xs text-gray-500">
                  Estimated time: {scenario.estimatedTime}
                </div>
                {selectedScenario?.id === scenario.id && (
                  <div className="mt-2">
                    <Icon name="check" className="w-4 h-4 text-blue-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Save as Project Option */}
        {!selectedProject && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <input
                type="checkbox"
                id="saveAsProject"
                checked={saveAsProject}
                onChange={(e) => setSaveAsProject(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="saveAsProject" className="text-sm font-medium text-gray-700">
                Save this configuration as a project
              </label>
            </div>
            {saveAsProject && (
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter project name"
              />
            )}
          </div>
        )}

        {/* Start Session Button */}
        <div className="text-center">
          <button
            onClick={handleStartSession}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Start Multiplayer Session
          </button>
          
          {validationError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" fill="#DC2626" />
                <path d="M12 8v4M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p className="text-sm text-red-700">{validationError}</p>
            </div>
          )}
        </div>
      </div>

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
          onClose={() => {
            setShowScenarioEditor(false)
            loadCustomScenarios() // Refresh scenarios after closing
          }}
          onSave={(scenario) => {
            setCustomScenarios(prev => [...prev, scenario])
            setShowScenarioEditor(false)
          }}
        />
      )}
    </div>
  )
}

export default CustomMultiplayerSetup
