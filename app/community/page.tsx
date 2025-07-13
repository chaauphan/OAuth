'use client';

import { useEffect, useState } from "react";
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
  user: {
    displayName: string;
    email: string;
  };
}

interface Stats {
  totalGames: number;
  uniqueUsers: number;
  averageGamesPerUser: number;
}

export default function CommunityPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetchAllUsersGames();
  }, []);

  const fetchAllUsersGames = async () => {
    try {
      const response = await fetch('/api/games/all-users');
      const data = await response.json();

      if (response.ok) {
        setGames(data.games || []);
        setStats(data.stats || null);
      } else {
        setError(data.error || 'Failed to load games');
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-start">
              
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                Game Feed
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                What have Chau and friends been up to?
              </p>
            </div>

            {/* Silly Fun Stats */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGames}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Total Games</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.uniqueUsers}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Players</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 text-center shadow-sm">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.averageGamesPerUser}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg Games/Player</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchAllUsersGames}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Feed */}
        {!loading && !error && games.length > 0 && (
          <div className="space-y-6">
            {games.map((game) => (
              <div 
                key={`${game.id}-${game.user.email}`}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
              >
                <div className="flex">
                  {game.imageUrl && (
                    <div className="flex-shrink-0">
                      <Image
                        src={game.imageUrl}
                        alt={game.title}
                        width={120}
                        height={80}
                        className="w-30 h-20 object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                          {game.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Added: {new Date(game.addedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {game.user.displayName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(game.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
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
              No games logged yet!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to log a game!
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 