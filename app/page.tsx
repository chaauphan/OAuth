'use client';

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { DisplayNameSetup } from "../components/display-name-setup";

interface Game {
  game_id: number;
  title: string;
  platform: string;
  release_date?: string;
  image_url?: string;
  playedAt?: string;
}

export default function Home() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showDisplayNameModal, setShowDisplayNameModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [addingGame, setAddingGame] = useState<number | null>(null);
  const [playedDate, setPlayedDate] = useState("");
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check if need to set display name
  useEffect(() => {
    if (session?.user && !session.user.displayName) {
      setShowDisplayNameModal(true);
    }
  }, [session]);

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

  const handleAddGameClick = (game: Game) => {
    setSelectedGame(game);
    setShowDateModal(true);
  };

  const addGameToCollection = async (game: Game, datePlayed: string) => {
    setAddingGame(game.game_id);
    
    const gameData = {
      gameId: game.game_id,
      title: game.title,
      platform: game.platform,
      releaseDate: game.release_date,
      imageUrl: game.image_url,
      playedAt: datePlayed || null
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
        console.log('Game added successfully:', data.message);
        // Close the date modal and reset
        setShowDateModal(false);
        setSelectedGame(null);
        setPlayedDate("");
      } else {
        console.error('Failed to add game:', data.error);
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
    <main className="min-h-screen flex items-center justify-center bg-green relative">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-8">Bello</h1>
        <button
          onClick={() => setShowModal(true)}
          className="cursor-pointer bg-green-500 hover:bg-green-400 text-white font-bold text-xl py-4 px-8 border-b-4 border-green-700 hover:border-green-500 rounded-full transition-colors w-fit"
        >
          Get started
        </button>
      </div>
      
      {/* MobyGames Credit */}
      <div className="absolute bottom-4 left-4 text-xs text-gray-600 dark:text-gray-400">
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
      {/* Search Modal */}
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50">
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
                  className="cursor-pointer text-gray-500 dark:text-white hover:text-gray-700 text-xl"
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
                            <Image
                              src={game.image_url}
                              alt={game.title}
                              width={64}
                              height={64}
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
                              handleAddGameClick(game);
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
                className="cursor-pointer px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
              >
                Sign In with Google
              </button>
              <button
                className="cursor-pointer px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition mb-4 w-full"
              >
                Create Account
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cursor-pointer px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700 transition w-full"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Date Selection Modal */}
      {showDateModal && selectedGame && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 dark:bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-md mx-4 p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-black dark:text-white">
                Date played?
              </h3>
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setSelectedGame(null);
                  setPlayedDate("");
                }}
                className="cursor-pointer text-gray-500 dark:text-white hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="mb-6">
              <div className="flex items-center space-x-4 p-3 border border-gray-200 dark:border-gray-600 rounded-lg mb-4">
                {selectedGame.image_url && (
                  <Image
                    src={selectedGame.image_url}
                    alt={selectedGame.title}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-black dark:text-white">{selectedGame.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedGame.platform} {selectedGame.release_date && `• ${selectedGame.release_date}`}
                  </p>
                </div>
              </div>
              
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date played (optional)
              </label>
              <input
                type="date"
                value={playedDate}
                onChange={(e) => setPlayedDate(e.target.value)}
                className="w-full px-4 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-black dark:text-white"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDateModal(false);
                  setSelectedGame(null);
                  setPlayedDate("");
                }}
                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => addGameToCollection(selectedGame, playedDate)}
                disabled={addingGame === selectedGame.game_id}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingGame === selectedGame.game_id ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Adding...
                  </div>
                ) : (
                  'Add to Collection'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
              onDisplayNameSet={(displayName) => {
                setShowDisplayNameModal(false);
                window.location.reload();
              }}
              showEditButton={false}
            />
          </div>
        </div>
      )}
    </main>
  );
}