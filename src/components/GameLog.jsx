import React from 'react'
import Icon from './Icon'

const GameLog = ({ gameLog }) => {
  const getLogIcon = (type) => {
    switch (type) {
      case 'game_start': return <Icon name="rocket" className="w-4 h-4 text-blue-600" />
      case 'inject_revealed': return <Icon name="alert" className="w-4 h-4 text-orange-600" />
      case 'response_submitted': return <Icon name="checkCircle" className="w-4 h-4 text-green-600" />
      case 'game_end': return <Icon name="flag" className="w-4 h-4 text-purple-600" />
      default: return <Icon name="document" className="w-4 h-4 text-gray-600" />
    }
  }

  const getLogColor = (type) => {
    switch (type) {
      case 'game_start': return 'text-green-600'
      case 'inject_revealed': return 'text-red-600'
      case 'response_submitted': return 'text-blue-600'
      case 'game_end': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Log</h3>
      
      {gameLog.length > 0 ? (
        <div className="space-y-3 max-h-64 overflow-y-auto">
          {gameLog.slice().reverse().map((entry, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="mt-0.5">{getLogIcon(entry.type)}</div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${getLogColor(entry.type)}`}>
                  {entry.message}
                </p>
                {entry.targetRole && (
                  <p className="text-xs text-gray-500">
                    Target: {entry.targetRole}
                  </p>
                )}
                <p className="text-xs text-gray-400">
                  {entry.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <div className="text-gray-400 text-4xl mb-2">📋</div>
          <p className="text-sm text-gray-500">No activity yet</p>
          <p className="text-xs text-gray-400">Game actions will appear here</p>
        </div>
      )}
    </div>
  )
}

export default GameLog
