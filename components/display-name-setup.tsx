'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface DisplayNameSetupProps {
  onDisplayNameSet?: (displayName: string) => void;
  showEditButton?: boolean;
}

export function DisplayNameSetup({ onDisplayNameSet, showEditButton = false }: DisplayNameSetupProps) {
  const { data: session, update } = useSession();
  const [displayName, setDisplayName] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentDisplayName, setCurrentDisplayName] = useState('');

  useEffect(() => {
    if (session?.user) {
      fetchCurrentDisplayName();
    }
  }, [session, onDisplayNameSet, showEditButton]);

  const fetchCurrentDisplayName = async () => {
    try {
      const response = await fetch('/api/user/display-name');
      if (response.ok) {
        const data = await response.json();
        setCurrentDisplayName(data.displayName || '');
        if (data.displayName && !showEditButton) {
          // If user already has display name and not in edit mode, call callback
          onDisplayNameSet?.(data.displayName);
        }
      }
    } catch (error) {
      console.error('Error fetching display name:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/user/display-name', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ displayName: displayName.trim() }),
      });

      const data = await response.json();

      if (response.ok) {
        setCurrentDisplayName(data.displayName);
        setIsEditing(false);
        setDisplayName('');
        // Update the session to include the new display name
        await update();
        onDisplayNameSet?.(data.displayName);
      } else {
        setError(data.error || 'Failed to update display name');
      }
    } catch (error) {
      console.error('Error updating display name:', error);
      setError('Failed to update display name. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setDisplayName(currentDisplayName);
    setError('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName('');
    setError('');
  };

  if (!session?.user) {
    return null;
  }

  // If user has a display name and  not in edit mode, show edit button
  if (currentDisplayName && !isEditing && showEditButton) {
    return (
      <div className="flex items-center space-x-3">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Display name: <strong className="text-gray-900 dark:text-white">{currentDisplayName}</strong>
        </span>
        <button
          onClick={handleEdit}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
        >
          Edit
        </button>
      </div>
    );
  }

  // If user has display name not showing edit button, just show name
  if (currentDisplayName && !isEditing && !showEditButton) {
    return (
      <div className="text-sm text-gray-600 dark:text-gray-400">
        Display name: <strong className="text-gray-900 dark:text-white">{currentDisplayName}</strong>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {isEditing ? 'Edit Display Name' : 'Set Your Display Name'}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Choose a display name that will be shown to other users
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Display Name
          </label>
          <input
            type="text"
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="Enter your display name..."
            maxLength={50}
            className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
            disabled={isLoading}
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {displayName.length}/50 characters
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm">{error}</p>
        )}

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading || !displayName.trim()}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              isEditing ? 'Update Display Name' : 'Set Display Name'
            )}
          </button>
          
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 