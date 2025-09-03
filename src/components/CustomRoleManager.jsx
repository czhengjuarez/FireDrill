import React, { useState, useEffect } from 'react';
import Icon from './Icon';

const CustomRoleManager = ({ onClose }) => {
  const [customRoles, setCustomRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: ''
  });

  useEffect(() => {
    loadCustomRoles();
  }, []);

  const loadCustomRoles = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/custom-roles');
      if (response.ok) {
        const roles = await response.json();
        setCustomRoles(roles);
      }
    } catch (error) {
      console.error('Failed to load custom roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async (e) => {
    e.preventDefault()
    if (!newRole.name.trim() || !newRole.description.trim()) {
      alert('Please fill in role name and description')
      return
    }

    const roleData = {
      name: newRole.name,
      description: newRole.description,
      icon: 'user'
    }

    try {
      const response = await fetch('/api/custom-roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roleData)
      })

      if (response.ok) {
        const savedRole = await response.json()
        console.log('Role created successfully:', savedRole)
        setCustomRoles(prev => [...prev, savedRole])
        setNewRole({ name: '', description: '' })
        setShowCreateForm(false)
        alert('Role created successfully!')
      } else {
        const errorText = await response.text()
        console.error('Failed to create role:', response.status, errorText)
        alert(`Failed to create role: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error('Error creating role:', error)
      alert('Failed to create role')
    }
  };

  const deleteRole = async (roleId) => {
    if (!confirm('Are you sure you want to delete this custom role?')) return;

    try {
      const response = await fetch(`/api/custom-roles/${roleId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCustomRoles(customRoles.filter(r => r.id !== roleId));
      }
    } catch (error) {
      console.error('Failed to delete role:', error);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span>Loading custom roles...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Custom Role Manager</h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Custom Roles</h3>
            <button
              onClick={() => setShowCreateForm(true)}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
            >
              <Icon name="plus" className="w-4 h-4" />
              <span>New Role</span>
            </button>
          </div>

          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold mb-3">Create New Role</h4>
              <form onSubmit={createRole} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role Name
                  </label>
                  <input
                    type="text"
                    value={newRole.name}
                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter role name..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newRole.description}
                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    placeholder="Describe the role's responsibilities..."
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <button
                    type="submit"
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Create Role
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {customRoles.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="users" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Custom Roles Yet</h3>
              <p className="text-gray-500 mb-4">Create custom roles that can be used across all scenarios.</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Create Your First Role
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customRoles.map((role) => (
                <div
                  key={role.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Icon name={role.icon || 'user'} className="w-6 h-6 text-gray-700" />
                      <h4 className="font-semibold text-gray-900">{role.name}</h4>
                    </div>
                    <button
                      onClick={() => deleteRole(role.id)}
                      className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors"
                      title="Delete role"
                    >
                      ×
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm">{role.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomRoleManager;
