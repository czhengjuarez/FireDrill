import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { injectCards } from '../data/gameData';

const ParticipantInterface = ({ session, participantData, onLeaveSession, roles }) => {
  const [selectedRole, setSelectedRole] = useState(participantData.role || '');
  const [currentResponse, setCurrentResponse] = useState('');
  const [responses, setResponses] = useState({});
  const [sessionState, setSessionState] = useState(session);
  const [hasJoined, setHasJoined] = useState(false);

  // Get inject cards for the current scenario
  const scenarioInjects = injectCards[session.scenario_data?.id] || [];
  const currentInject = scenarioInjects.find(inject => inject.id === sessionState.current_inject_id);

  useEffect(() => {
    // Poll for session updates every 2 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sessions/${session.id}`);
        if (response.ok) {
          const updatedSession = await response.json();
          setSessionState(updatedSession);
        }
      } catch (error) {
        console.error('Error polling session:', error);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [session.id]);

  const joinSession = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      const updatedParticipants = [
        ...sessionState.participants,
        {
          userId: participantData.userId,
          name: participantData.name,
          role: selectedRole,
          status: 'active',
          joinedAt: new Date().toISOString()
        }
      ];

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionState,
          participants: updatedParticipants
        })
      });

      if (response.ok) {
        setHasJoined(true);
        setSessionState(prev => ({ ...prev, participants: updatedParticipants }));
      } else {
        alert('Failed to join session');
      }
    } catch (error) {
      console.error('Error joining session:', error);
      alert('Failed to join session');
    }
  };

  const submitResponse = async () => {
    if (!currentResponse.trim() || !currentInject) {
      alert('Please enter a response');
      return;
    }

    try {
      const updatedResponses = {
        ...sessionState.responses,
        [currentInject.id]: {
          ...sessionState.responses[currentInject.id],
          [participantData.userId]: {
            response: currentResponse,
            timestamp: new Date().toISOString(),
            role: selectedRole,
            participantName: participantData.name
          }
        }
      };

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...sessionState,
          responses: updatedResponses
        })
      });

      if (response.ok) {
        setResponses(prev => ({
          ...prev,
          [currentInject.id]: currentResponse
        }));
        setCurrentResponse('');
        setSessionState(prev => ({ ...prev, responses: updatedResponses }));
      } else {
        alert('Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response');
    }
  };

  const getAvailableRoles = () => {
    // Get roles that haven't been taken by other participants
    const takenRoles = sessionState.participants
      .filter(p => p.userId !== participantData.userId)
      .map(p => p.role);
    
    // Get facilitator's selected roles from session data
    const facilitatorSelectedRoleIds = sessionState.available_roles || [];
    
    // Filter roles to only show those selected by facilitator
    const facilitatorSelectedRoles = roles.filter(role => 
      facilitatorSelectedRoleIds.includes(role.id)
    );

    return facilitatorSelectedRoles.filter(role => !takenRoles.includes(role.id));
  };

  const getCurrentParticipant = () => {
    return sessionState.participants.find(p => p.userId === participantData.userId);
  };

  const hasSubmittedResponse = (injectId) => {
    return responses[injectId] || sessionState.responses[injectId]?.[participantData.userId];
  };

  if (!hasJoined) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Join Training Session</h1>
            <p className="text-gray-600">
              Session: <span className="font-mono font-semibold">{session.session_code}</span>
            </p>
            <p className="text-gray-600">
              Scenario: <span className="font-semibold">{session.scenario_data?.name}</span>
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Your Role
            </label>
            <div className="space-y-2">
              {getAvailableRoles().map(role => (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedRole === role.id
                      ? 'border-blue-400 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">{role.name}</h4>
                      <p className="text-sm text-gray-600">{role.description}</p>
                    </div>
                    {selectedRole === role.id && (
                      <Icon name="check" className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={joinSession}
            disabled={!selectedRole}
            className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Icon name="users" className="w-5 h-5 inline mr-2" />
            Join as {selectedRole ? getAvailableRoles().find(r => r.id === selectedRole)?.name : 'Role'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {participantData.name} - {getCurrentParticipant()?.role}
              </h1>
              <p className="text-gray-600">
                Session: <span className="font-mono font-semibold">{session.session_code}</span> | 
                Scenario: {session.scenario_data?.name} | 
                Phase: <span className="capitalize">{sessionState.phase}</span>
              </p>
            </div>
            <button
              onClick={onLeaveSession}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
            >
              <Icon name="exit" className="w-4 h-4 inline mr-2" />
              Leave Session
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Waiting States */}
        {sessionState.phase === 'setup' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Icon name="clock" className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Waiting for Facilitator</h2>
            <p className="text-gray-600">
              The facilitator will start the session shortly. Please wait...
            </p>
          </div>
        )}

        {sessionState.phase === 'briefing' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Scenario Briefing</h2>
            <div className="bg-blue-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-900 mb-2">{session.scenario_data?.name}</h3>
              <p className="text-blue-800">{session.scenario_data?.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Severity</h4>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  session.scenario_data?.severity === 'Critical' ? 'bg-red-100 text-red-800' :
                  session.scenario_data?.severity === 'High' ? 'bg-orange-100 text-orange-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {session.scenario_data?.severity}
                </span>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Estimated Time</h4>
                <p className="text-gray-700">{session.scenario_data?.estimatedTime}</p>
              </div>
            </div>
            {session.scenario_data?.objectives && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Learning Objectives</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  {session.scenario_data.objectives.map((objective, index) => (
                    <li key={index}>{objective}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Active Phase */}
        {sessionState.phase === 'active' && currentInject && (
          <div className="space-y-6">
            
            {/* Current Inject */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Current Situation</h2>
                  <h3 className="text-2xl font-bold text-blue-600 mt-2">{currentInject.title}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  hasSubmittedResponse(currentInject.id) 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {hasSubmittedResponse(currentInject.id) ? 'Response Submitted' : 'Response Needed'}
                </span>
              </div>
              
              <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                <p className="text-red-800">{currentInject.description}</p>
              </div>

              {currentInject.questions && (
                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Consider These Questions:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {currentInject.questions.map((question, index) => (
                      <li key={index}>{question}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Response Area */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Your Response as {getCurrentParticipant()?.role}
              </h3>
              
              {hasSubmittedResponse(currentInject.id) ? (
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <Icon name="check" className="w-5 h-5 text-green-500 mr-2" />
                    <span className="font-semibold text-green-800">Response Submitted</span>
                  </div>
                  <p className="text-green-700">
                    {responses[currentInject.id] || sessionState.responses[currentInject.id]?.[participantData.userId]?.response}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    value={currentResponse}
                    onChange={(e) => setCurrentResponse(e.target.value)}
                    className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder={`As the ${getCurrentParticipant()?.role}, describe your immediate actions and response to this situation...`}
                  />
                  <button
                    onClick={submitResponse}
                    disabled={!currentResponse.trim()}
                    className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    <Icon name="send" className="w-4 h-4 inline mr-2" />
                    Submit Response
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Debrief Phase */}
        {sessionState.phase === 'debrief' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Debrief</h2>
            <p className="text-gray-600 mb-4">
              The facilitator is leading the debrief discussion. Please participate in the conversation
              about lessons learned and areas for improvement.
            </p>
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Key Discussion Points</h3>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>What went well during the incident response?</li>
                <li>What challenges did you encounter in your role?</li>
                <li>How could communication be improved?</li>
                <li>What would you do differently next time?</li>
              </ul>
            </div>
          </div>
        )}

        {/* Completed Phase */}
        {sessionState.phase === 'completed' && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Icon name="check-circle" className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Training Session Complete</h2>
            <p className="text-gray-600 mb-4">
              Thank you for participating in this cybersecurity training exercise.
            </p>
            <button
              onClick={onLeaveSession}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Return to Main Menu
            </button>
          </div>
        )}

        {/* Other Participants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Other Participants ({sessionState.participants.length - 1})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessionState.participants
              .filter(p => p.userId !== participantData.userId)
              .map(participant => (
                <div key={participant.userId} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${
                    participant.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                  }`}></div>
                  <div>
                    <p className="font-medium text-gray-900">{participant.name}</p>
                    <p className="text-sm text-gray-500">{participant.role}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ParticipantInterface;
