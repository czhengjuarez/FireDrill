import { nistFramework } from '../data/gameData'

const ResponsePanel = ({ responses, scenarioInjects, nistFramework }) => {
  const responseCount = Object.keys(responses).length
  const totalInjects = scenarioInjects.length
  const completionRate = totalInjects > 0 ? (responseCount / totalInjects) * 100 : 0

  // Count responses by NIST category
  const nistCounts = Object.values(responses).reduce((acc, response) => {
    acc[response.nistCategory] = (acc[response.nistCategory] || 0) + 1
    return acc
  }, {})

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Response Summary</h3>
      
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{responseCount}/{totalInjects}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          ></div>
        </div>
        <div className="text-xs text-gray-500 mt-1">
          {completionRate.toFixed(0)}% Complete
        </div>
      </div>

      {/* NIST Framework Distribution */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Response Categories</h4>
        <div className="space-y-2">
          {Object.entries(nistFramework).map(([key, framework]) => {
            const count = nistCounts[key] || 0
            return (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${framework.color}`}></div>
                  <span className="text-sm text-gray-700">{framework.name}</span>
                </div>
                <span className="text-sm font-medium text-gray-900">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Responses */}
      {responseCount > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Recent Responses</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {Object.entries(responses)
              .sort(([,a], [,b]) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5)
              .map(([injectId, response]) => {
                const inject = scenarioInjects.find(i => i.id === injectId)
                return (
                  <div key={injectId} className="p-2 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-900">
                        {inject?.title || 'Unknown Inject'}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${nistFramework[response.nistCategory]?.color} text-white`}>
                        {nistFramework[response.nistCategory]?.name}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {response.response}
                    </p>
                    <div className="text-xs text-gray-400 mt-1">
                      {response.timestamp}
                    </div>
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {responseCount === 0 && (
        <div className="text-center py-6">
          <div className="w-12 h-px bg-gray-300 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">No responses yet</p>
          <p className="text-xs text-gray-400">Submit responses to track your progress</p>
        </div>
      )}
    </div>
  )
}

export default ResponsePanel
