import { useState, useEffect } from 'react'
import { roles, nistFramework } from '../data/gameData'
import { saveCustomScenarios, loadCustomScenarios, deleteCustomScenario } from '../utils/scenarioStorage'

const ScenarioEditor = ({ onClose, onSave }) => {
  const [customScenarios, setCustomScenarios] = useState([])
  const [editingScenario, setEditingScenario] = useState(null)
  const [showEditor, setShowEditor] = useState(false)

  // Form state for scenario creation
  const [scenarioForm, setScenarioForm] = useState({
    name: '',
    description: '',
    severity: 'Medium',
    estimatedTime: '45 minutes',
    objectives: ['']
  })

  // Form state for inject cards
  const [injectCards, setInjectCards] = useState([{
    targetRole: 'it',
    title: '',
    content: '',
    urgency: 'medium',
    timestamp: '09:00 AM'
  }])

  useEffect(() => {
    setCustomScenarios(loadCustomScenarios())
  }, [])

  const resetForm = () => {
    setScenarioForm({
      name: '',
      description: '',
      severity: 'Medium',
      estimatedTime: '45 minutes',
      objectives: ['']
    })
    setInjectCards([{
      targetRole: 'it',
      title: '',
      content: '',
      urgency: 'medium',
      timestamp: '09:00 AM'
    }])
    setEditingScenario(null)
  }

  const addObjective = () => {
    setScenarioForm(prev => ({
      ...prev,
      objectives: [...prev.objectives, '']
    }))
  }

  const updateObjective = (index, value) => {
    setScenarioForm(prev => ({
      ...prev,
      objectives: prev.objectives.map((obj, i) => i === index ? value : obj)
    }))
  }

  const removeObjective = (index) => {
    setScenarioForm(prev => ({
      ...prev,
      objectives: prev.objectives.filter((_, i) => i !== index)
    }))
  }

  const addInjectCard = () => {
    setInjectCards(prev => [...prev, {
      targetRole: 'it',
      title: '',
      content: '',
      urgency: 'medium',
      timestamp: '09:00 AM'
    }])
  }

  const updateInjectCard = (index, field, value) => {
    setInjectCards(prev => prev.map((inject, i) => 
      i === index ? { ...inject, [field]: value } : inject
    ))
  }

  const removeInjectCard = (index) => {
    setInjectCards(prev => prev.filter((_, i) => i !== index))
  }

  const saveScenario = () => {
    if (!scenarioForm.name || !scenarioForm.description || injectCards.some(card => !card.title || !card.content)) {
      alert('Please fill in all required fields')
      return
    }

    const scenarioId = editingScenario?.id || `custom_${Date.now()}`
    const newScenario = {
      id: scenarioId,
      ...scenarioForm,
      objectives: scenarioForm.objectives.filter(obj => obj.trim()),
      isCustom: true,
      createdAt: editingScenario?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    const newInjectCards = {}
    newInjectCards[scenarioId] = injectCards.map((card, index) => ({
      ...card,
      id: `${scenarioId}_${index + 1}`
    }))

    const existingScenarios = loadCustomScenarios()
    let updatedScenarios

    if (editingScenario) {
      updatedScenarios = existingScenarios.map(s => 
        s.id === scenarioId ? newScenario : s
      )
    } else {
      updatedScenarios = [...existingScenarios, newScenario]
    }

    if (saveCustomScenarios(updatedScenarios)) {
      // Also save inject cards
      const existingInjects = JSON.parse(localStorage.getItem('cybersecurity_fire_drill_custom_injects') || '{}')
      const updatedInjects = { ...existingInjects, ...newInjectCards }
      localStorage.setItem('cybersecurity_fire_drill_custom_injects', JSON.stringify(updatedInjects))

      setCustomScenarios(updatedScenarios)
      onSave && onSave(newScenario, newInjectCards[scenarioId])
      resetForm()
      setShowEditor(false)
      alert('Scenario saved successfully!')
    } else {
      alert('Failed to save scenario')
    }
  }

  const editScenario = (scenario) => {
    setEditingScenario(scenario)
    setScenarioForm({
      name: scenario.name,
      description: scenario.description,
      severity: scenario.severity,
      estimatedTime: scenario.estimatedTime,
      objectives: scenario.objectives
    })

    // Load inject cards for this scenario
    const customInjects = JSON.parse(localStorage.getItem('cybersecurity_fire_drill_custom_injects') || '{}')
    const scenarioInjects = customInjects[scenario.id] || []
    setInjectCards(scenarioInjects.length > 0 ? scenarioInjects : [{
      targetRole: 'it',
      title: '',
      content: '',
      urgency: 'medium',
      timestamp: '09:00 AM'
    }])

    setShowEditor(true)
  }

  const deleteScenario = (scenarioId) => {
    if (confirm('Are you sure you want to delete this scenario?')) {
      if (deleteCustomScenario(scenarioId)) {
        // Also delete inject cards
        const existingInjects = JSON.parse(localStorage.getItem('cybersecurity_fire_drill_custom_injects') || '{}')
        delete existingInjects[scenarioId]
        localStorage.setItem('cybersecurity_fire_drill_custom_injects', JSON.stringify(existingInjects))

        setCustomScenarios(loadCustomScenarios())
        alert('Scenario deleted successfully!')
      }
    }
  }

  if (showEditor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingScenario ? 'Edit Scenario' : 'Create New Scenario'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false)
                  resetForm()
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {/* Scenario Details */}
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    value={scenarioForm.name}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Advanced Persistent Threat"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Time
                  </label>
                  <input
                    type="text"
                    value={scenarioForm.estimatedTime}
                    onChange={(e) => setScenarioForm(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 60 minutes"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={scenarioForm.description}
                  onChange={(e) => setScenarioForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the cybersecurity scenario..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Severity Level
                </label>
                <select
                  value={scenarioForm.severity}
                  onChange={(e) => setScenarioForm(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Learning Objectives
                </label>
                {scenarioForm.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={objective}
                      onChange={(e) => updateObjective(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Learning objective..."
                    />
                    {scenarioForm.objectives.length > 1 && (
                      <button
                        onClick={() => removeObjective(index)}
                        className="px-2 py-2 text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addObjective}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  + Add Objective
                </button>
              </div>

              {/* Inject Cards */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Inject Cards</h3>
                {injectCards.map((inject, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium text-gray-900">Inject {index + 1}</h4>
                      {injectCards.length > 1 && (
                        <button
                          onClick={() => removeInjectCard(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Target Role
                        </label>
                        <select
                          value={inject.targetRole}
                          onChange={(e) => updateInjectCard(index, 'targetRole', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {roles.map(role => (
                            <option key={role.id} value={role.id}>{role.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Urgency
                        </label>
                        <select
                          value={inject.urgency}
                          onChange={(e) => updateInjectCard(index, 'urgency', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={inject.title}
                          onChange={(e) => updateInjectCard(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Inject title..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Timestamp
                        </label>
                        <input
                          type="text"
                          value={inject.timestamp}
                          onChange={(e) => updateInjectCard(index, 'timestamp', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 09:00 AM"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Content *
                      </label>
                      <textarea
                        value={inject.content}
                        onChange={(e) => updateInjectCard(index, 'content', e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Describe the incident details..."
                      />
                    </div>
                  </div>
                ))}

                <button
                  onClick={addInjectCard}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                >
                  + Add Inject Card
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  onClick={() => {
                    setShowEditor(false)
                    resetForm()
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={saveScenario}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingScenario ? 'Update Scenario' : 'Save Scenario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Custom Scenarios</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="mb-6">
            <button
              onClick={() => setShowEditor(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              + Create New Scenario
            </button>
          </div>

          {customScenarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Scenarios</h3>
              <p className="text-gray-600">Create your first custom scenario to get started.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {customScenarios.map(scenario => (
                <div key={scenario.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      scenario.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                      scenario.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                      scenario.severity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {scenario.severity}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4">{scenario.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>⏱️ {scenario.estimatedTime}</span>
                    <span>Created: {new Date(scenario.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => editScenario(scenario)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteScenario(scenario.id)}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ScenarioEditor
