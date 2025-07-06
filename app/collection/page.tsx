'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";

interface Game {
  id: number;
  mobyGamesId: number;
  title: string;
  platform: string;
  releaseDate?: string;
  imageUrl?: string;
  addedAt: string;
  playedAt?: string;
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
          <p className="mb-6">Please sign in to view.</p>
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
              className="bg-green-500 hover:bg-green-400 text-white font-bold py-2 px-4 border-b-4 border-green-700 hover:border-green-500 rounded mb-4 top-10 left-10"
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
            <div className="flex justify-center mb-6">
              <Image 
                src="/reallySadCat.gif" 
                alt="Sad cat" 
                width={128}
                height={128}
                className="w-32 h-32 rounded-lg"
              />
            </div>
            <div className="space-x-4">
              <button 
                onClick={fetchUserGames}
                className="cursor-pointer bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded mb-4 top-10 left-10"
              >
                Try Again
              </button>
              <button 
                onClick={() => window.location.reload()}
                className="cursor-pointer bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded mb-4 top-10 left-10 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        )}

        {/* Games Grid - Compact Cards */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {games.map((game) => (
              <div 
                key={game.id}
                className="bg-white dark:bg-neutral-900 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
              >
                {game.imageUrl && (
                  <Image
                    src={game.imageUrl}
                    alt={game.title}
                    width={200}
                    height={128}
                    className="w-full h-32 object-cover"
                  />
                )}
                <div className="p-3">
                  <h3 className="font-medium text-sm text-gray-900 dark:text-white mb-1 line-clamp-2">
                    {game.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                    {game.platform}
                  </p>
                  {game.playedAt && (
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">
                      Played: {new Date(game.playedAt).toLocaleDateString()}
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