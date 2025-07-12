'use client';


import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { sortGamesByDatePlayed, sortGamesByTitle } from "../../lib/sort";

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
  const [sortTitle, setSortTitle] = useState(false);
  const [sortDate, setSortDate] = useState(false);

  useEffect(() => {
    if (session?.user?.email) {
      fetchUserGames();
    }
  }, [session]);

  useEffect(() => {
    if (sortTitle) {
      fetchUserGames();
    }
  }, [sortTitle]);

  useEffect(() => {
    if (sortDate) {
      fetchUserGames();
    }
  }, [sortDate]);

  const fetchUserGames = async () => {
    try {
      const response = await fetch('/api/games/collection');
      const data = await response.json();

      if (response.ok && !sortTitle && !sortDate) {
        setGames(data.games || []);
      } 
      else if (response.ok && sortTitle) {
        const sortedGames = sortGamesByTitle(data.games || []);
        setGames(sortedGames);
      }
      else if (response.ok && sortDate) {
        const sortedGames = sortGamesByDatePlayed(data.games || []);
        setGames(sortedGames);
      }
      else {
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
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-start">
              <Link 
                href="/"
                className="bg-rose-400 hover:bg-rose-500 text-white font-bold py-2 px-4 border-b-4 border-rose-500 hover:border-rose-500 rounded transition-colors"
              >
                Log More Games
              </Link>
            </div>
            
            {/* Sort */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  My Games
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {games.length} game{games.length !== 1 ? 's' : ''} played
                </p>
              </div>

              <Menu as="div" className="relative inline-block text-left">
              <div>
              <MenuButton className="inline-flex bg-white w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset">
                Sort by:
              </MenuButton>
              </div>

              <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
              >
              <div className="py-1">
                <MenuItem>
                  <a
                    onClick={() => {
                      setSortTitle(true);
                      setSortDate(false);
                    }}
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Title
                  </a>
                </MenuItem>
                <MenuItem>
                  <a
                    onClick={() => {
                      setSortTitle(false);
                      setSortDate(true);
                    }}
                    href="#"
                    className="block px-4 py-2 text-sm text-gray-700 data-focus:bg-gray-100 data-focus:text-gray-900 data-focus:outline-hidden"
                  >
                    Date Played
                  </a>
                </MenuItem>
              </div>
              </MenuItems>
            </Menu>
          </div>
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

        {/* Games Grid */}
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
            <div className="text-6xl mb-4">(´•︵•`)</div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Uh oh spaghettio, your collection is empty!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some games!
            </p>
            <Link 
              href="/"
              className="bg-rose-400 hover:bg-rose-500 text-white font-bold py-2 px-4 rounded-full">
              Add Your First Game
            </Link>
          </div>
        )}
      </div>
    </div>
  );
} 