import { useState } from 'react'
import { exportScenarios, importScenarios } from '../utils/scenarioStorage'

const ScenarioManager = ({ customScenarios, onImport }) => {
  const [importing, setImporting] = useState(false)

  const handleExport = () => {
    if (customScenarios.length === 0) {
      alert('No custom scenarios to export')
      return
    }
    
    if (exportScenarios(customScenarios)) {
      alert('Scenarios exported successfully!')
    } else {
      alert('Failed to export scenarios')
    }
  }

  const handleImport = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setImporting(true)
    try {
      const scenarios = await importScenarios(file)
      onImport(scenarios)
      alert(`Successfully imported ${scenarios.length} scenarios!`)
    } catch (error) {
      alert(`Failed to import scenarios: ${error.message}`)
    } finally {
      setImporting(false)
      event.target.value = '' // Reset file input
    }
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Sharing</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          disabled={customScenarios.length === 0}
          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          📤 Export Scenarios
        </button>
        
        <label className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 cursor-pointer">
          {importing ? '📥 Importing...' : '📥 Import Scenarios'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
        </label>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-left">
        Export your custom scenarios to share with your team, or import scenarios created by others.
      </p>
    </div>
  )
}

export default ScenarioManager
