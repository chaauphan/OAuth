'use client';
/* 
Testing public collection view 
============================ 
*/
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function ChauGamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchChauGames();
  }, []);

  const fetchChauGames = async () => {
    try {
      const response = await fetch('/api/games/chau');
      const data = await response.json();

      if (response.ok) {
        setGames(data.games || []);
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-start">
              <Link 
                href="/"
                className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                What Has Chau Been Playing?
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                A public view of Chau&apos;s game collection
              </p>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading Chau&apos;s games...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchChauGames}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold py-2 px-4 border-b-4 border-blue-700 hover:border-blue-500 rounded transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Games Grid */}
        {!loading && !error && games.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {games.map((game) => (
              <div 
                key={game.id}
                className="bg-white dark:bg-neutral-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 hover:scale-105"
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
              No games found yet!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Chau hasn&apos;t logged any games yet.
            </p>
          </div>
        )}

        {/* Stats */}
        {!loading && !error && games.length > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Total games: <strong className="text-gray-900 dark:text-white">{games.length}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 