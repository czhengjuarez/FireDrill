import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const GoogleLoginButton = () => {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load Google Identity Services script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '1051145498673-8b5igbve6snjh22554hl3r4l6vldf39v.apps.googleusercontent.com',
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: 250,
            text: 'signin_with',
          }
        );
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleCredentialResponse = async (response) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Google credential response:', response);
      console.log('Credential token:', response.credential ? 'Present' : 'Missing');
      
      // Log the JWT token structure for debugging
      if (response.credential) {
        const parts = response.credential.split('.');
        console.log('JWT parts count:', parts.length);
        if (parts.length === 3) {
          try {
            const payload = JSON.parse(atob(parts[1]));
            console.log('JWT payload preview:', {
              iss: payload.iss,
              email: payload.email,
              exp: payload.exp,
              currentTime: Date.now() / 1000
            });
          } catch (e) {
            console.error('Failed to decode JWT for debugging:', e);
          }
        }
      }
      
      await login(response.credential);
    } catch (error) {
      console.error('Login failed:', error);
      setError(`Login failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <div id="google-signin-button"></div>
      {isLoading && (
        <div className="text-sm text-gray-600">
          Signing in...
        </div>
      )}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
          {error}
        </div>
      )}
    </div>
  );
};

export default GoogleLoginButton;
