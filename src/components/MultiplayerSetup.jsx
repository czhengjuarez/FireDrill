import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const MultiplayerSetup = ({ onStartSession, onJoinSession, roles, scenarios }) => {
  const [mode, setMode] = useState('create'); // 'create' or 'join'
  const [facilitatorName, setFacilitatorName] = useState('');
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [sessionCode, setSessionCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateSession = async () => {
    if (!facilitatorName.trim() || !selectedScenario || selectedRoles.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const sessionData = {
        facilitator_name: facilitatorName,
        scenario_data: selectedScenario,
        available_roles: selectedRoles,
        participants: [],
        phase: 'setup',
        responses: {},
        facilitator_notes: '',
        session_log: [{
          timestamp: new Date().toISOString(),
          event: 'session_created',
          data: { facilitator: facilitatorName, scenario: selectedScenario.name }
        }]
      };

      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      });

      if (response.ok) {
        const session = await response.json();
        onStartSession(session, selectedRoles);
      } else {
        alert('Failed to create session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinSession = async () => {
    if (!sessionCode.trim() || !participantName.trim()) {
      alert('Please enter session code and your name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/sessions/${sessionCode}`);
      if (response.ok) {
        const session = await response.json();
        onJoinSession(session, participantName);
      } else {
        alert('Session not found');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    } finally {
      setLoading(false);
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoles(prev => 
      prev.includes(roleId) 
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Mode Selection */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Multiplayer Training Session</h2>
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={() => setMode('create')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'create' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Icon name="plus" className="w-5 h-5 inline mr-2" />
            Create Session
          </button>
          <button
            onClick={() => setMode('join')}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              mode === 'join' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <Icon name="users" className="w-5 h-5 inline mr-2" />
            Join Session
          </button>
        </div>
      </div>

      {mode === 'create' ? (
        <div className="space-y-6">
          {/* Facilitator Setup */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Facilitator Setup</h3>
            <div className="max-w-md mx-auto">
              <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                Your Name (Facilitator)
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

          {/* Role Selection */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Roles for Participants</h3>
            <p className="text-gray-600 mb-4">
              Select the roles that participants can choose from during the session.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {roles.map(role => (
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
                    <h4 className="font-semibold text-gray-900 text-sm">{role.name}</h4>
                  </div>
                  <p className="text-xs text-gray-600">{role.description}</p>
                  {selectedRoles.includes(role.id) && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Icon name="check" className="w-3 h-3 mr-1" />
                        Selected
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
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Select Scenario</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {scenarios.map(scenario => (
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
                    <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
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
                    ⏱️ {scenario.estimatedTime}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Create Session Button */}
          <div className="text-center">
            <button
              onClick={handleCreateSession}
              disabled={!facilitatorName.trim() || !selectedScenario || selectedRoles.length === 0 || loading}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Icon name="loading" className="w-5 h-5 inline mr-2 animate-spin" />
                  Creating Session...
                </>
              ) : (
                <>
                  <Icon name="play" className="w-5 h-5 inline mr-2" />
                  Create Training Session
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          {/* Join Session */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Join Training Session</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Session Code
                </label>
                <input
                  type="text"
                  value={sessionCode}
                  onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg font-mono"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your name"
                />
              </div>
              <button
                onClick={handleJoinSession}
                disabled={!sessionCode.trim() || !participantName.trim() || loading}
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? (
                  <>
                    <Icon name="loading" className="w-5 h-5 inline mr-2 animate-spin" />
                    Joining...
                  </>
                ) : (
                  <>
                    <Icon name="users" className="w-5 h-5 inline mr-2" />
                    Join Session
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiplayerSetup;
