import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { roles } from '../data/gameData';

const CustomCardEditor = ({ project, onSave, onClose }) => {
  const [selectedScenario, setSelectedScenario] = useState('');
  const [customRoles, setCustomRoles] = useState([]);
  const [newCard, setNewCard] = useState({
    title: '',
    content: '',
    targetRole: '',
    urgency: 'medium',
    timestamp: ''
  });

  const urgencyLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'critical', label: 'Critical', color: 'bg-red-100 text-red-800' }
  ];

  useEffect(() => {
    loadCustomRoles();
  }, []);

  const loadCustomRoles = async () => {
    try {
      const response = await fetch('/api/custom-roles');
      if (response.ok) {
        const roles = await response.json();
        setCustomRoles(roles);
      }
    } catch (error) {
      console.error('Failed to load custom roles:', error);
    }
  };

  const getAllRoles = () => {
    return [...roles, ...customRoles];
  };

  const addCard = () => {
    if (!selectedScenario || !newCard.title || !newCard.content || !newCard.targetRole) {
      alert('Please fill in all required fields');
      return;
    }

    const cardId = `custom_${Date.now()}`;
    const cardWithId = {
      ...newCard,
      id: cardId
    };

    const updatedProject = {
      ...project,
      customCards: {
        ...project.customCards,
        [selectedScenario]: [
          ...(project.customCards[selectedScenario] || []),
          cardWithId
        ]
      }
    };

    onSave(updatedProject);
    
    // Reset form
    setNewCard({
      title: '',
      content: '',
      targetRole: '',
      urgency: 'medium',
      timestamp: ''
    });
  };

  const removeCard = (scenarioId, cardIndex) => {
    const updatedCards = [...(project.customCards[scenarioId] || [])];
    updatedCards.splice(cardIndex, 1);
    
    const updatedProject = {
      ...project,
      customCards: {
        ...project.customCards,
        [scenarioId]: updatedCards
      }
    };

    onSave(updatedProject);
  };

  const availableScenarios = project.scenarios || [];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Custom Card Editor</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Add New Card Form */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Add New Card</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Scenario *
                </label>
                <select
                  value={selectedScenario}
                  onChange={(e) => setSelectedScenario(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a scenario...</option>
                  {availableScenarios.map((scenario) => (
                    <option key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Role *
                </label>
                <select
                  value={newCard.targetRole}
                  onChange={(e) => setNewCard({ ...newCard, targetRole: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a role...</option>
                  <optgroup label="Default Roles">
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </optgroup>
                  {customRoles.length > 0 && (
                    <optgroup label="Custom Roles">
                      {customRoles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name} (Custom)
                        </option>
                      ))}
                    </optgroup>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Title *
                </label>
                <input
                  type="text"
                  value={newCard.title}
                  onChange={(e) => setNewCard({ ...newCard, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter card title..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Content *
                </label>
                <textarea
                  value={newCard.content}
                  onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows="4"
                  placeholder="Enter the card content that will be presented to the role..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Urgency Level
                  </label>
                  <select
                    value={newCard.urgency}
                    onChange={(e) => setNewCard({ ...newCard, urgency: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {urgencyLevels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timestamp
                  </label>
                  <input
                    type="text"
                    value={newCard.timestamp}
                    onChange={(e) => setNewCard({ ...newCard, timestamp: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 09:15 AM"
                  />
                </div>
              </div>

              <button
                onClick={addCard}
                className="w-full bg-gray-600 text-white py-3 px-4 rounded-md hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Icon name="plus" className="w-4 h-4" />
                <span>Add Card</span>
              </button>
            </div>

            {/* Existing Custom Cards */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">Existing Custom Cards</h3>
              
              {Object.keys(project.customCards || {}).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Icon name="cards" className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No custom cards yet. Create your first card using the form on the left.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(project.customCards || {}).map(([scenarioId, cards]) => {
                    const scenario = availableScenarios.find(s => s.id === scenarioId);
                    return (
                      <div key={scenarioId} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          {scenario?.name || scenarioId}
                        </h4>
                        <div className="space-y-3">
                          {cards.map((card, index) => {
                            const role = roles.find(r => r.id === card.targetRole);
                            const urgency = urgencyLevels.find(u => u.value === card.urgency);
                            
                            return (
                              <div key={index} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency?.color}`}>
                                      {urgency?.label}
                                    </span>
                                    {card.timestamp && (
                                      <span className="text-xs text-gray-500">{card.timestamp}</span>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => removeCard(scenarioId, index)}
                                    className="text-gray-400 hover:text-red-600 transition-colors"
                                  >
                                    <Icon name="trash" className="w-4 h-4" />
                                  </button>
                                </div>
                                <h5 className="font-medium text-gray-900 mb-1">{card.title}</h5>
                                <p className="text-sm text-gray-600 mb-2">{card.content}</p>
                                <div className="text-xs text-gray-500">
                                  Target: {role?.name || card.targetRole}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCardEditor;
