'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Game {
  game_id: number;
  title: string;
  platform: string;
  release_date?: string;
  image_url?: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addingGame, setAddingGame] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          if (query.trim().length >= 2) {
            searchGames(query);
          } else {
            setGames([]);
            setSearchError("");
          }
        }, 300); // 300ms delay
      };
    })(),
    []
  );

  // Update search when query changes
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  const searchGames = async (query: string) => {
    if (!query.trim() || query.trim().length < 2) return;

    setIsSearching(true);
    setSearchError("");

    try {
      const response = await fetch(`/api/games/search?q=${encodeURIComponent(query)}&limit=10`);
      const data = await response.json();

      if (response.ok) {
        setGames(data.games || []);
      } else {
        setSearchError(data.error || 'Failed to search games');
        setGames([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchError('Failed to search games');
      setGames([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addGameToCollection = async (game: Game) => {
    setAddingGame(game.game_id);
    
    const gameData = {
      gameId: game.game_id,
      title: game.title,
      platform: game.platform,
      releaseDate: game.release_date,
      imageUrl: game.image_url
    };
    
    console.log('Sending game data:', gameData);
    
    try {
      const response = await fetch('/api/games/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameData),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success feedback (you can add a toast notification here)
        console.log('Game added successfully:', data.message);
        // Optionally remove the game from search results or mark it as added
      } else {
        console.error('Failed to add game:', data.error);
        // Show error feedback
      }
    } catch (error) {
      console.error('Error adding game:', error);
    } finally {
      setAddingGame(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchGames(searchQuery);
    }
  };

  if (!mounted) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-8">Bello</h1>
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-green">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Bello</h1>
        {session && (
          <div className="mb-6">
            <p className="text-lg mb-4">
              You are signed in as: <strong>{session.user?.name || session.user?.email}</strong>
            </p>
            <Link 
              href="/collection"
              className="absolute bg-blue-500 text-white px-10 py-2 rounded-lg hover:bg-blue-600 transition-colors mb-4 top-5 left-5"
            >
              Games Played
            </Link>
          </div>
        )}
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-500 text-white font-bold px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
        >
          Get started
        </button>
      </div>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {status === "loading" ? (
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
              <p>Loading...</p>
            </div>
          ) : session ? (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-4 h-96 flex flex-col">
              <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-bold text-black dark:text-white">Log a game...</h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 dark:text-white hover:text-gray-700 text-xl"
                >
                  ×
                </button>
              </div>
              <div className="flex-1 flex flex-col p-6 overflow-hidden">
                <div className="mb-4">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search for game..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
                    />
                    {isSearching && (
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {searchError && (
                    <p className="text-red-500 text-center mb-4">{searchError}</p>
                  )}
                  
                  {isSearching && (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                      <p className="text-gray-500 dark:text-gray-400">Searching...</p>
                    </div>
                  )}
                  
                  {!isSearching && games.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-3">
                        Found {games.length} games:
                      </h3>
                      {games.map((game) => (
                        <div
                          key={game.game_id}
                          className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                        >
                          {game.image_url && (
                            <img
                              src={game.image_url}
                              alt={game.title}
                              className="w-16 h-16 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 text-left">
                            <h4 className="font-semibold text-black dark:text-white">{game.title}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {game.platform} {game.release_date && `• ${game.release_date}`}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              addGameToCollection(game);
                            }}
                            disabled={addingGame === game.game_id}
                            className="flex items-center justify-center w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-full transition-colors duration-200 hover:scale-110 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Add to collection"
                          >
                            {addingGame === game.game_id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                              <span className="text-lg font-bold">+</span>
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {!isSearching && games.length === 0 && searchQuery.length >= 2 && !searchError && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      No games found. Try a different search term.
                    </p>
                  )}
                  
                  {searchQuery.length < 2 && searchQuery.length > 0 && (
                    <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                      Type at least 2 characters to search...
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-sm w-full text-center">
              <h2 className="text-2xl font-bold mb-4 text-black">Sign In Required</h2>
              <p className="mb-6 text-black">Please sign in to join Poobies site.</p>
              <button
                onClick={() => signIn('google')}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
              >
                Sign In with Google
              </button>
              <button
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition w-full"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
    </main>
  );
}