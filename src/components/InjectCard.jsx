import { useState, useEffect } from 'react'
import { nistFramework } from '../data/gameData'

const InjectCard = ({ inject, playerRoles, onSubmitResponse, existingResponse }) => {
  const [response, setResponse] = useState(existingResponse?.response || '')
  const [selectedNistCategory, setSelectedNistCategory] = useState(existingResponse?.nistCategory || '')
  const [showResponseForm, setShowResponseForm] = useState(!existingResponse)

  // Reset form state when inject changes
  useEffect(() => {
    setResponse(existingResponse?.response || '')
    setSelectedNistCategory(existingResponse?.nistCategory || '')
    setShowResponseForm(!existingResponse)
  }, [inject.id, existingResponse])

  const targetRole = playerRoles.find(role => role.id === inject.targetRole)
  
  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const handleSubmit = () => {
    if (response.trim() && selectedNistCategory) {
      onSubmitResponse(inject.id, response, selectedNistCategory)
      setShowResponseForm(false)
    }
  }

  const handleEdit = () => {
    setShowResponseForm(true)
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Inject Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold mb-1">{inject.title}</h3>
            <div className="flex items-center space-x-4 text-sm opacity-90">
              <span>📅 {inject.timestamp}</span>
              {targetRole && (
                <span>👤 {targetRole.name}</span>
              )}
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(inject.urgency)}`}>
            {inject.urgency.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Inject Content */}
      <div className="p-6">
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-2">Incident Details</h4>
          <p className="text-gray-700 leading-relaxed text-left">{inject.content}</p>
        </div>

        {/* Target Role Info */}
        {targetRole && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
              <span className="mr-2">{targetRole.icon}</span>
              You are responding as: {targetRole.name}
            </h4>
            <p className="text-gray-800 text-sm">{targetRole.description}</p>
          </div>
        )}

        {/* Response Section */}
        
        {existingResponse && !showResponseForm ? (
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold text-gray-900">Your Response</h4>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                Edit Response
              </button>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${nistFramework[existingResponse.nistCategory]?.color} text-white`}>
                  {nistFramework[existingResponse.nistCategory]?.name}
                </span>
                <span className="text-sm text-gray-500">{existingResponse.timestamp}</span>
              </div>
              <p className="text-gray-700">{existingResponse.response}</p>
            </div>
          </div>
        ) : (
          <div className="border-t pt-6">
            <h4 className="font-semibold text-gray-900 mb-4">Select your response</h4>
            
            {/* NIST Category Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NIST Framework Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(nistFramework).map(([key, framework]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedNistCategory(key)}
                    className={`p-2 rounded-md text-sm font-medium transition-colors ${
                      selectedNistCategory === key
                        ? `${framework.color} text-white`
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {framework.name}
                  </button>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {selectedNistCategory ? nistFramework[selectedNistCategory]?.description : 'Please select a NIST framework category for your response'}
              </p>
            </div>

            {/* Response Text Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What actions would you take? How would you communicate with other roles?
              </label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 text-gray-900"
                placeholder="Describe your response to this incident inject..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-2">
              {existingResponse && (
                <button
                  onClick={() => setShowResponseForm(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={!response.trim() || !selectedNistCategory}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Submit Response
              </button>
            </div>
          </div>
        )}

        {/* Discussion Prompts */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Discussion Points</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• What information do you need to share with other roles?</li>
            <li>• What immediate actions should be taken?</li>
            <li>• How does this align with your organization's incident response plan?</li>
            <li>• What are the potential impacts if this incident escalates?</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default InjectCard
