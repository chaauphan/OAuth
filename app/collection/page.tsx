'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface Game {
  id: number;
  mobyGamesId: number;
  title: string;
  platform: string;
  releaseDate?: string;
  imageUrl?: string;
  addedAt: string;
}

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserGames();
    }
  }, [session]);

  const fetchUserGames = async () => {
    try {
      const response = await fetch('/api/games/collection');
      const data = await response.json();

      if (response.ok) {
        setGames(data.games || []);
      } else {
        setError(data.error || 'Failed to load collection');
      }
    } catch (error) {
      console.error('Error fetching collection:', error);
      setError('Failed to load collection');
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Sign In Required</h1>
          <p className="mb-6">Please sign in to view your games.</p>
          <Link 
            href="/"
            className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Go to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                My Games
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {games.length} game{games.length !== 1 ? 's' : ''} played
              </p>
            </div>
            <Link 
              href="/"
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              Log More Games
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your collection...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchUserGames}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {games.map((game) => (
              <div 
                key={game.id}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {game.imageUrl && (
                  <img
                    src={game.imageUrl}
                    alt={game.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                    {game.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    {game.platform}
                  </p>
                  {game.releaseDate && (
                    <p className="text-sm text-gray-500 dark:text-gray-500 mb-3">
                      Released: {new Date(game.releaseDate).toLocaleDateString()}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Added: {new Date(game.addedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && games.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎮</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Your collection is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some games!
            </p>
            <Link 
              href="/"
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Add Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 