'use client';

import { useSession } from 'next-auth/react';
import { DisplayNameSetup } from '../../components/display-name-setup';
import { useState } from 'react';

export default function TestDisplayNamePage() {
  const { data: session, status } = useSession();
  const [displayNameSet, setDisplayNameSet] = useState(false);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please Sign In</h1>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be signed in to set your display name.
          </p>
        </div>
      </div>
    );
  }

  const handleDisplayNameSet = (displayName: string) => {
    setDisplayNameSet(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome to Bello!
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Let's set up your display name
          </p>
        </div>

        <DisplayNameSetup 
          onDisplayNameSet={handleDisplayNameSet}
          showEditButton={false}
        />

        {displayNameSet && (
          <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-green-800 dark:text-green-200 text-sm">
              Display name set successfully! You can now use the app.
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 