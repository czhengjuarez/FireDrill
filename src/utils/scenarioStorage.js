// Local storage utilities for custom scenarios
const STORAGE_KEY = 'cybersecurity_fire_drill_custom_scenarios'

export const saveCustomScenarios = (scenarios) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
    return true
  } catch (error) {
    console.error('Failed to save custom scenarios:', error)
    return false
  }
}

export const loadCustomScenarios = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Failed to load custom scenarios:', error)
    return []
  }
}

export const deleteCustomScenario = (scenarioId) => {
  try {
    const scenarios = loadCustomScenarios()
    const filtered = scenarios.filter(s => s.id !== scenarioId)
    saveCustomScenarios(filtered)
    return true
  } catch (error) {
    console.error('Failed to delete custom scenario:', error)
    return false
  }
}

export const exportScenarios = (scenarios) => {
  try {
    const dataStr = JSON.stringify(scenarios, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `cybersecurity-fire-drill-scenarios-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Failed to export scenarios:', error)
    return false
  }
}

export const importScenarios = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const scenarios = JSON.parse(e.target.result)
        if (Array.isArray(scenarios)) {
          resolve(scenarios)
        } else {
          reject(new Error('Invalid scenario format'))
        }
      } catch (error) {
        reject(error)
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsText(file)
  })
}
