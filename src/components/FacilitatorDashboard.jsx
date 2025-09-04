import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { injectCards } from '../data/gameData';

const FacilitatorDashboard = ({ session, onUpdateSession, onEndSession }) => {
  const [currentInjectIndex, setCurrentInjectIndex] = useState(0);
  const [facilitatorNotes, setFacilitatorNotes] = useState(session.facilitator_notes || '');
  const [sessionLog, setSessionLog] = useState(session.session_log || []);
  const [participants, setParticipants] = useState(session.participants || []);
  const [responses, setResponses] = useState(session.responses || {});
  const [phase, setPhase] = useState(session.phase || (session.isCustomProject ? 'ready' : 'setup'));

  // Get inject cards for the current scenario
  const scenarioInjects = injectCards[session.scenario_data?.id] || [];
  const currentInject = scenarioInjects[currentInjectIndex];

  useEffect(() => {
    // Poll for session updates every 3 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/sessions/${session.id}`);
        if (response.ok) {
          const updatedSession = await response.json();
          setParticipants(updatedSession.participants);
          setResponses(updatedSession.responses);
          setPhase(updatedSession.phase);
        }
      } catch (error) {
        console.error('Error polling session:', error);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [session.id]);

  const updateSession = async (updates) => {
    try {
      const updatedData = {
        participants,
        current_inject_id: currentInject?.id || null,
        phase,
        responses,
        facilitator_notes: facilitatorNotes,
        session_log: sessionLog,
        ...updates
      };

      const response = await fetch(`/api/sessions/${session.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (response.ok) {
        onUpdateSession(updatedData);
      }
    } catch (error) {
      console.error('Error updating session:', error);
    }
  };

  const addToLog = (event, data = {}) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      data: { inject_index: currentInjectIndex, ...data }
    };
    const newLog = [...sessionLog, logEntry];
    setSessionLog(newLog);
  };

  const startSession = () => {
    setPhase('briefing');
    addToLog('session_started');
    updateSession({ phase: 'briefing' });
  };

  const startInjects = () => {
    setPhase('active');
    addToLog('injects_started');
    updateSession({ phase: 'active' });
  };

  const nextInject = () => {
    if (currentInjectIndex < scenarioInjects.length - 1) {
      setCurrentInjectIndex(currentInjectIndex + 1);
      addToLog('inject_advanced', { 
        from_inject: currentInject?.title,
        to_inject: scenarioInjects[currentInjectIndex + 1]?.title 
      });
      updateSession();
    } else {
      // End of injects, move to debrief
      setPhase('debrief');
      addToLog('debrief_started');
      updateSession({ phase: 'debrief' });
    }
  };

  const previousInject = () => {
    if (currentInjectIndex > 0) {
      setCurrentInjectIndex(currentInjectIndex - 1);
      addToLog('inject_back', { 
        from_inject: currentInject?.title,
        to_inject: scenarioInjects[currentInjectIndex - 1]?.title 
      });
      updateSession();
    }
  };

  const endSession = () => {
    if (confirm('Are you sure you want to end this training session?')) {
      setPhase('completed');
      addToLog('session_ended');
      updateSession({ phase: 'completed' });
      onEndSession();
    }
  };

  const getParticipantResponses = (injectId) => {
    return responses[injectId] || {};
  };

  const getResponseCount = (injectId) => {
    const injectResponses = getParticipantResponses(injectId);
    return Object.keys(injectResponses).length;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Facilitator Dashboard</h1>
              <p className="text-gray-600">
                Session: <span className="font-mono font-semibold">{session.session_code || session.id}</span> | 
                Scenario: {session.scenario_data?.name} | 
                Phase: <span className="capitalize">{phase === 'ready' ? 'Ready to Start' : phase}</span>
                {session.isCustomProject && <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Custom Project</span>}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigator.clipboard.writeText(session.session_code)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
              >
                <Icon name="copy" className="w-4 h-4 inline mr-2" />
                Copy Code
              </button>
              <button
                onClick={endSession}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
              >
                <Icon name="stop" className="w-4 h-4 inline mr-2" />
                End Session
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Phase Controls */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Control</h3>
              
              {/* Custom Project Ready State */}
              {session.isCustomProject && phase === 'ready' && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <Icon name="check" className="w-5 h-5 text-green-500 mr-2" />
                    <div>
                      <h4 className="text-sm font-medium text-green-800">Session Ready</h4>
                      <p className="text-sm text-green-700">
                        Pre-configured with {session.available_roles?.length || 0} roles and scenario: {session.scenario_data?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="flex space-x-3">
                {(phase === 'setup' || phase === 'ready') && (
                  <button
                    onClick={startSession}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                  >
                    <Icon name="play" className="w-4 h-4 inline mr-2" />
                    Start Briefing
                  </button>
                )}
                {phase === 'briefing' && (
                  <button
                    onClick={startInjects}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    <Icon name="play" className="w-4 h-4 inline mr-2" />
                    Begin Injects
                  </button>
                )}
                {phase === 'active' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={previousInject}
                      disabled={currentInjectIndex === 0}
                      className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      <Icon name="arrow-left" className="w-4 h-4 inline mr-2" />
                      Previous
                    </button>
                    <button
                      onClick={nextInject}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                      {currentInjectIndex < scenarioInjects.length - 1 ? (
                        <>
                          <Icon name="arrow-right" className="w-4 h-4 inline mr-2" />
                          Next Inject
                        </>
                      ) : (
                        <>
                          <Icon name="flag" className="w-4 h-4 inline mr-2" />
                          Start Debrief
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Current Inject */}
            {phase === 'active' && currentInject && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Current Inject ({currentInjectIndex + 1}/{scenarioInjects.length})
                    </h3>
                    <h4 className="text-xl font-bold text-blue-600 mt-2">{currentInject.title}</h4>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {getResponseCount(currentInject.id)} / {participants.length} responses
                  </span>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-gray-800">{currentInject.description}</p>
                </div>

                {currentInject.questions && (
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">Discussion Points:</h5>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      {currentInject.questions.map((question, index) => (
                        <li key={index}>{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Participant Responses */}
            {phase === 'active' && currentInject && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Participant Responses</h3>
                <div className="space-y-4">
                  {participants.map(participant => {
                    const participantResponse = getParticipantResponses(currentInject.id)[participant.userId];
                    return (
                      <div key={participant.userId} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center space-x-3">
                            <Icon name="user" className="w-5 h-5 text-gray-500" />
                            <span className="font-semibold">{participant.name}</span>
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                              {participant.role}
                            </span>
                          </div>
                          <span className={`px-2 py-1 rounded text-sm ${
                            participantResponse 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {participantResponse ? 'Responded' : 'Pending'}
                          </span>
                        </div>
                        {participantResponse && (
                          <div className="bg-gray-50 rounded p-3 mt-2">
                            <p className="text-gray-800">{participantResponse.response}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(participantResponse.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Participants */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Participants ({participants.length})
              </h3>
              <div className="space-y-3">
                {participants.map(participant => (
                  <div key={participant.userId} className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      participant.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <p className="text-sm text-gray-500">{participant.role}</p>
                    </div>
                  </div>
                ))}
                {participants.length === 0 && (
                  <p className="text-gray-500 text-center py-4">
                    Waiting for participants to join...
                  </p>
                )}
              </div>
            </div>

            {/* Facilitator Notes */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Facilitator Notes</h3>
              <textarea
                value={facilitatorNotes}
                onChange={(e) => setFacilitatorNotes(e.target.value)}
                onBlur={() => updateSession({ facilitator_notes: facilitatorNotes })}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Add your notes about the session..."
              />
            </div>

            {/* Session Progress */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Injects</span>
                  <span>{currentInjectIndex + 1} / {scenarioInjects.length}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${((currentInjectIndex + 1) / scenarioInjects.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default FacilitatorDashboard;
