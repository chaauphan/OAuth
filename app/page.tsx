'use client';

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Image from "next/image";
import { DisplayNameSetup } from "../components/display-name-setup";
import StarRating from "../components/star-rating";

interface CommunityGame {
  id: number;
  mobyGamesId: number;
  title: string;
  platform: string;
  releaseDate?: string;
  imageUrl?: string;
  addedAt: string;
  playedAt?: string;
  rating?: number;
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

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  
  // Feed state
  const [communityGames, setCommunityGames] = useState<CommunityGame[]>([]);
  const [communityLoading, setCommunityLoading] = useState(true);
  const [communityError, setCommunityError] = useState("");
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    setMounted(true);
    fetchCommunityFeed();
  }, []);

  // Check if need to set display name
  useEffect(() => {
    const checkDisplayName = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/user/display-name');
          if (response.ok) {
            const data = await response.json();
            if (!data.displayName) {
              setShowDisplayNameModal(true);
            } else {
              setShowDisplayNameModal(false);
            }
          }
        } catch (error) {
          console.error('Error checking display name:', error);
          // Fallback to session check if API fails
          if (session?.user && !session.user.displayName) {
            setShowDisplayNameModal(true);
          }
        }
      }
    };

    // Add a small delay to prevent too many concurrent requests
    const timeoutId = setTimeout(checkDisplayName, 100);
    return () => clearTimeout(timeoutId);
  }, [session]);

  // Fetch feed
  const fetchCommunityFeed = async () => {
    try {
      const response = await fetch('/api/games/all-users');
      const data = await response.json();

      if (response.ok) {
        setCommunityGames(data.games || []);
        setStats(data.stats || null);
      } else {
        setCommunityError(data.error || 'Failed to load community feed');
      }
    } catch (error) {
      console.error('Error fetching community feed:', error);
      setCommunityError('Failed to load community feed');
    } finally {
      setCommunityLoading(false);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-green">
      {/* Feed Section */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Home
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            What have Chau and friends been up to?
          </p>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.totalGames}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Games</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.uniqueUsers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Players</div>
            </div>
            <div className="bg-white dark:bg-zinc-800 rounded-lg p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-pink-400 dark:text-pink-400">{stats.averageGamesPerUser}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg Games/Player</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {communityLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading community feed...</p>
          </div>
        )}

        {/* Error */}
        {communityError && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{communityError}</p>
            <button 
                onClick={() => window.location.reload()}
                className="cursor-pointer bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 border-b-4 border-red-700 hover:border-red-500 rounded mb-4 top-10 left-10 transition-colors"
              >
                Refresh Page
              </button>
          </div>
        )}

        {/* Feed */}
        {!communityLoading && !communityError && communityGames.length > 0 && (
          <div className="space-y-6">
            {communityGames.slice(0, 10).map((game) => (
              <div 
                key={`${game.id}-${game.user.email}`}
                className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-200"
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
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-0">
                          {game.title}
                        </h3>
                        
                        <div className="mb-0">
                          <StarRating rating={game.rating || 0} size="sm" showValue={game.rating ? true : false} />
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
        {!communityLoading && !communityError && communityGames.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              No games logged yet!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Be the first to log a game!
            </p>
          </div>
        )}
      </div>

      {/* MobyGames Credit */}
      <div className="fixed bottom-4 left-4 text-xs text-gray-600 dark:text-gray-400 z-10">
        Game data provided by{' '}
        <a 
          href="https://www.mobygames.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          MobyGames
        </a>
      </div>

      {/* Display Name Modal */}
      {showDisplayNameModal && session?.user && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Hi!
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please set your display name to continue
              </p>
            </div>
            
            <DisplayNameSetup 
              onDisplayNameSet={() => {
                setShowDisplayNameModal(false);
              }}
              showEditButton={false}
            />
          </div>
        </div>
      )}
    </main>
  );
}