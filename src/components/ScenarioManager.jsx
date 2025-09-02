import { useState } from 'react'
import { exportScenarios, importScenarios } from '../utils/scenarioStorage'
import Icon from './Icon'

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

  const handleDownloadTemplate = () => {
    const template = [
      {
        id: "template_scenario_1",
        name: "Sample Scenario",
        description: "A template scenario to help you get started",
        difficulty: "Medium",
        estimatedTime: "30-45 minutes",
        injects: [
          {
            id: "inject_1",
            phase: "Identify",
            title: "Initial Alert",
            description: "Your monitoring system has detected unusual network activity.",
            timeMinutes: 0,
            responses: [
              "Investigate the alert immediately",
              "Escalate to security team",
              "Document the incident"
            ]
          },
          {
            id: "inject_2", 
            phase: "Protect",
            title: "Containment Decision",
            description: "Analysis shows potential malware on workstation WS-001.",
            timeMinutes: 15,
            responses: [
              "Isolate the affected workstation",
              "Run additional scans",
              "Notify affected users"
            ]
          }
        ],
        isCustom: true,
        createdAt: new Date().toISOString()
      }
    ]
    
    const dataStr = JSON.stringify(template, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'scenario-template.json'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Sharing</h3>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleExport}
          disabled={customScenarios.length === 0}
          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Icon name="download" className="w-4 h-4" />
          Export Scenarios
        </button>
        
        <label className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2">
          <Icon name="upload" className="w-4 h-4" />
          {importing ? 'Importing...' : 'Import Scenarios'}
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            disabled={importing}
            className="hidden"
          />
        </label>
        
        <button
          onClick={handleDownloadTemplate}
          className="px-4 py-2 bg-gray-100 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-200 flex items-center gap-2"
        >
          <Icon name="document" className="w-4 h-4" />
          Template
        </button>
      </div>
      <p className="text-sm text-gray-600 mt-2 text-left">
        Export your custom scenarios to share with your team, import scenarios created by others, or download a template to get started.
      </p>
    </div>
  )
}

export default ScenarioManager
