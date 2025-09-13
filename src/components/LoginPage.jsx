import React from 'react';
import GoogleLoginButton from './GoogleLoginButton';
import Icon from './Icon';

const LoginPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L13.09 8.26L20 9L13.09 15.74L12 22L10.91 15.74L4 9L10.91 8.26L12 2Z" fill="#8E1F5A"/>
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Cybersecurity Fire Drill
          </h1>
          <p className="text-gray-600 mb-8">
            Sign in to access your training scenarios and projects
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Welcome to Fire Drill Training
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Create and manage your own cybersecurity training scenarios, custom roles, and projects. Each user has their own isolated workspace for maximum security and organization.
          </p>
          
          <ul className="space-y-3 mb-8">
            <li className="flex items-start space-x-3">
              <Icon name="check" className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Create custom training scenarios</span>
            </li>
            <li className="flex items-start space-x-3">
              <Icon name="check" className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Manage custom roles and responsibilities</span>
            </li>
            <li className="flex items-start space-x-3">
              <Icon name="check" className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Run multiplayer training sessions</span>
            </li>
            <li className="flex items-start space-x-3">
              <Icon name="check" className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">Secure, isolated user workspaces</span>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <GoogleLoginButton />
          
          <p className="text-center text-sm text-gray-500">
            Secure authentication with Google
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our terms of service and privacy policy. Your data is securely stored and isolated from other users.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
